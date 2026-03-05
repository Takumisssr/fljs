import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cors());

// --- Database Setup ---
const db = new Database("fitness.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    data TEXT, -- JSON string
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date TEXT,
    data TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS plans (
    user_id TEXT PRIMARY KEY,
    data TEXT, -- JSON string
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS photos_meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    filename TEXT,
    analysis TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// --- AI Setup ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// --- API Routes ---

// User / Profile
app.post("/api/profile", (req, res) => {
  const { userId, profile } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });
  
  const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!userExists) {
    db.prepare("INSERT INTO users (id) VALUES (?)").run(userId);
  }

  db.prepare(`
    INSERT INTO profiles (user_id, data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `).run(userId, JSON.stringify(profile));

  res.json({ success: true });
});

app.get("/api/profile/:userId", (req, res) => {
  const row = db.prepare("SELECT data FROM profiles WHERE user_id = ?").get(req.params.userId);
  res.json(row ? JSON.parse(row.data) : null);
});

// Logs
app.post("/api/logs", (req, res) => {
  const { userId, date, log } = req.body;
  db.prepare(`
    INSERT INTO logs (user_id, date, data)
    VALUES (?, ?, ?)
  `).run(userId, date, JSON.stringify(log));
  res.json({ success: true });
});

app.get("/api/logs/:userId", (req, res) => {
  const rows = db.prepare("SELECT * FROM logs WHERE user_id = ? ORDER BY date DESC").all(req.params.userId);
  res.json(rows.map(r => ({ ...r, data: JSON.parse(r.data) })));
});

// Plans
app.get("/api/plan/:userId", (req, res) => {
  const row = db.prepare("SELECT data FROM plans WHERE user_id = ?").get(req.params.userId);
  res.json(row ? JSON.parse(row.data) : null);
});

// AI Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message, profile, history, todayLog } = req.body;
    
    const systemInstruction = `你是一位顶级的AI健身教练，擅长“维度博弈”——即根据用户的身体、心理、环境等多维度条件，动态制定可持续的训练、恢复、饮食和情绪管理计划。

    核心原则：
    1. 维度博弈：不只是给动作，要平衡压力、睡眠、预算、文化背景和生理周期。
    2. 严谨性：基于证据等级高、可复现的运动科学与医学数据。
    3. 澄清优先：如果用户信息模糊（如没说重量、没说痛感位置），必须先反问补齐信息。
    4. 情绪感知：用户表达负面情绪时，优先安抚并主动降级计划。
    5. 补剂策略：杜绝智商税，仅在必要时建议。

    输出规范：你必须返回一个严格的 JSON 对象。
    {
      "assistant_text": "符合语气风格的自然语言回复",
      "payload": {
        "intent": "识别到的意图 (e.g., 'plan_generation', 'posture_analysis', 'log_feedback', 'calorie_calc', 'emotional_support', 'companion', 'data_dashboard', 'clarify')",
        "need_followup": true/false,
        "followup_questions": ["待补齐的问题1", "问题2"],
        "cards": [
          {
            "type": "plan_card", 
            "data": { "today": "...", "week": "...", "month": "...", "prediction": "成果预估趋势" }
          },
          {
            "type": "posture_card",
            "data": { "observations": "...", "risks": "...", "priority": "..." }
          },
          {
            "type": "calorie_card",
            "data": { "estimate": "...", "macros": "...", "advice": "..." }
          },
          {
            "type": "dashboard_card",
            "data": { "stats": "...", "advice": "..." }
          },
          {
            "type": "photo_guide_card",
            "data": { "tips": "..." }
          }
        ],
        "plan_update": { "workout": "...", "meals": "...", "recovery": "...", "level": "normal/downgraded" },
        "warnings": ["安全/医疗警告"]
      }
    }

    当前用户信息: \${JSON.stringify(profile)}
    今日打卡: \${JSON.stringify(todayLog)}
    历史记录摘要: \${JSON.stringify(history?.slice(-5))}
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // If a new plan is generated, save it
    if (result.payload?.plan) {
      db.prepare(`
        INSERT INTO plans (user_id, data, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).run(userId, JSON.stringify(result.payload.plan));
    }

    res.json(result);
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Photo Analysis
const upload = multer({ dest: "uploads/" });
app.post("/api/analyze-photo", upload.single("photo"), async (req: any, res) => {
  try {
    const { userId, profile } = req.body;
    const photo = req.file;
    if (!photo) return res.status(400).json({ error: "No photo uploaded" });

    const imageData = fs.readFileSync(photo.path).toString("base64");
    
    const prompt = `作为AI健身教练，请分析这张体态照片。
    用户信息: \${profile}
    请提供：
    1. 体态观察要点（非医疗诊断）
    2. 针对性的训练重点
    3. 如果照片不规范，请提供重拍规范。
    
    请以 JSON 格式输出：
    {
      "observations": "...",
      "focus_areas": "...",
      "shooting_guide": "..."
    }
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { data: imageData, mimeType: photo.mimetype } }
        ]
      }],
      config: { responseMimeType: "application/json" }
    });

    const analysis = JSON.parse(response.text || "{}");
    
    db.prepare("INSERT INTO photos_meta (user_id, filename, analysis) VALUES (?, ?, ?)").run(
      userId, photo.filename, JSON.stringify(analysis)
    );

    res.json(analysis);
  } catch (error) {
    console.error("Photo Analysis Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Replan
app.post("/api/replan", async (req, res) => {
  try {
    const { userId, profile, logs, currentPlan } = req.body;
    
    const prompt = `根据用户过去两周的打卡记录和当前计划，生成下一周的优化计划。
    用户信息: \${JSON.stringify(profile)}
    打卡记录: \${JSON.stringify(logs)}
    当前计划: \${JSON.stringify(currentPlan)}
    
    请输出 JSON：
    {
      "new_plan": { "workout": "...", "meals": "...", "recovery": "..." },
      "reasoning": "为什么要这样修改"
    }
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text || "{}");
    
    if (result.new_plan) {
      db.prepare(`
        INSERT INTO plans (user_id, data, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).run(userId, JSON.stringify(result.new_plan));
    }

    res.json(result);
  } catch (error) {
    console.error("Replan Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Album
app.get("/api/album/:userId", (req, res) => {
  const rows = db.prepare("SELECT * FROM photos_meta WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
  res.json(rows.map(r => ({ ...r, analysis: JSON.parse(r.analysis) })));
});

// Settings
app.post("/api/settings", (req, res) => {
  const { userId, settings } = req.body;
  db.prepare(`
    INSERT INTO profiles (user_id, data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `).run(userId, JSON.stringify(settings));
  res.json({ success: true });
});

// --- Vite Middleware ---
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:\${PORT}`);
});
