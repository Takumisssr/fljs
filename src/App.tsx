import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  MessageSquare, 
  Calendar, 
  ClipboardList, 
  User, 
  ChevronRight, 
  Plus, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  TrendingUp,
  Heart,
  Utensils,
  Moon,
  Zap,
  Smile,
  Clock,
  Scale,
  Activity,
  Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Profile {
  goal: string;
  subGoal: string;
  timePerDay: number;
  equipment: string[];
  injuries: string;
  sleep: string;
  stress: string;
  diet: string;
  allergies: string;
  budget: string;
  gender?: 'male' | 'female';
  period?: boolean;
  workTime: string;
  bodyFat?: number;
  cooking: boolean;
  experience: string;
  tone: 'strict' | 'gentle' | 'data';
}

interface Plan {
  workout: string;
  meals: string;
  recovery: string;
}

interface Log {
  weight: number;
  bodyFat?: number;
  sleepHours: number;
  mood: string;
  completion: number;
  notes: string;
}

// --- Components ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navItems = [
    { path: '/chat', icon: MessageSquare, label: '教练' },
    { path: '/plan', icon: Calendar, label: '计划' },
    { path: '/log', icon: ClipboardList, label: '打卡' },
    { path: '/album', icon: ImageIcon, label: '相册' },
  ];

  if (location.pathname === '/onboarding') return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
            方脸健身 AI
          </h1>
          <div className="flex items-center gap-2">
            <Link to="/settings" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-zinc-600" />
            </Link>
            <Link to="/onboarding" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <User className="w-5 h-5 text-zinc-600" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-2 z-10">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 transition-colors",
                  isActive ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<Profile>>({
    goal: 'health',
    tone: 'gentle',
    timePerDay: 30,
    equipment: [],
    cooking: true,
    experience: 'beginner',
  });

  const steps = [
    { title: '您的核心目标？', field: 'goal', options: ['健康', '减肥', '美观增肌', '提升运动技能'] },
    { title: '更细化的目标？', field: 'subGoal', options: ['减脂增肌', '头脑清醒', '延缓衰老', '对抗疾病', '提升表现', '改善睡眠'] },
    { title: '您的工作时间？', field: 'workTime', options: ['朝九晚五', '弹性工作', '自由职业', '学生'] },
    { title: '您的当前体重 (kg)？', field: 'weight', type: 'number' },
    { title: '您的体脂率 (%)？', field: 'bodyFat', type: 'number' },
    { title: '抗压能力/心理状况？', field: 'stress', options: ['压力极大', '一般', '轻松'] },
    { title: '是否会做饭？', field: 'cooking', options: [{value: true, label: '会做饭'}, {value: false, label: '外卖/食堂'}] },
    { title: '资金状况/预算？', field: 'budget', options: ['紧凑', '中等', '充足'] },
    { title: '训练经验？', field: 'experience', options: ['小白', '入门', '进阶', '大神'] },
    { title: '教练语气风格？', field: 'tone', options: [
      { value: 'strict', label: '严厉监督型' },
      { value: 'gentle', label: '温柔陪伴型' },
      { value: 'data', label: '数据教练型' },
    ]},
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const userId = 'user_123'; // Mock userId
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile }),
      });
      window.location.href = '/chat';
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full pt-12">
        <div className="mb-8">
          <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `\${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400 mt-2">步骤 {step + 1} / {steps.length}</p>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{currentStep.title}</h2>

        <div className="space-y-3">
          {currentStep.options ? (
            currentStep.options.map((opt: any) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              const isSelected = Array.isArray(profile[currentStep.field as keyof Profile]) 
                ? (profile[currentStep.field as keyof Profile] as string[]).includes(val)
                : profile[currentStep.field as keyof Profile] === val;

              return (
                <button
                  key={val}
                  onClick={() => {
                    if (currentStep.type === 'multi') {
                      const current = (profile[currentStep.field as keyof Profile] as string[]) || [];
                      setProfile({ ...profile, [currentStep.field]: current.includes(val) ? current.filter(v => v !== val) : [...current, val] });
                    } else {
                      setProfile({ ...profile, [currentStep.field]: val });
                    }
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-100 hover:border-zinc-200 text-zinc-600"
                  )}
                >
                  {label}
                </button>
              );
            })
          ) : (
            <input
              type={currentStep.type || 'text'}
              placeholder={(currentStep as any).placeholder || ''}
              className="w-full p-4 rounded-xl border-2 border-zinc-100 focus:border-emerald-500 outline-none transition-all"
              value={profile[currentStep.field as keyof Profile] as any || ''}
              onChange={(e) => setProfile({ ...profile, [currentStep.field]: e.target.value })}
            />
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto w-full pt-6">
        <button
          onClick={handleNext}
          className="w-full bg-zinc-900 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          {step === steps.length - 1 ? '完成建档' : '下一步'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ChatCard = ({ card }: { card: any }) => {
  switch (card.type) {
    case 'plan_card':
      return (
        <div className="bg-zinc-900 text-white p-4 rounded-2xl space-y-3 mt-2 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">训练计划</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-emerald-400">今日: {card.data.today}</div>
            <div className="text-xs text-zinc-400 line-clamp-2">本周: {card.data.week}</div>
            <div className="text-xs text-emerald-500 font-bold mt-1">📈 预估: {card.data.prediction}</div>
          </div>
          <Link to="/plan" className="block text-center text-xs bg-white/10 py-2 rounded-lg hover:bg-white/20 transition-colors">查看完整计划</Link>
        </div>
      );
    case 'posture_card':
      return (
        <div className="bg-white border border-zinc-200 p-4 rounded-2xl space-y-3 mt-2">
          <div className="flex items-center gap-2 text-zinc-900">
            <Camera className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider">体态分析</span>
          </div>
          <p className="text-xs text-zinc-600">{card.data.observations}</p>
          <div className="flex gap-2">
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">优先级: {card.data.priority}</span>
          </div>
        </div>
      );
    case 'calorie_card':
      return (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl space-y-2 mt-2">
          <div className="flex items-center gap-2 text-orange-700">
            <Utensils className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">热量估算</span>
          </div>
          <div className="text-lg font-bold text-orange-900">{card.data.estimate}</div>
          <p className="text-xs text-orange-600">{card.data.macros}</p>
        </div>
      );
    case 'photo_guide_card':
      return (
        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-2 mt-2">
          <div className="flex items-center gap-2 text-zinc-700">
            <Camera className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">拍照指导</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">{card.data.tips}</p>
        </div>
      );
    default:
      return null;
  }
};

const Chat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch('/api/profile/user_123').then(res => res.json()).then(setProfile);
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || !profile) return;
    
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123',
          message: text,
          profile,
          history: messages,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', ...data }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-emerald-600 fill-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">方脸健身 AI 教练</h3>
            <p className="text-zinc-500 text-sm px-8">基于维度博弈理论，为您提供可持续的健身、饮食与情绪管理建议。</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 px-4">
              {['生成今日计划', '分析体态照片', '估算餐食热量', '心情不太好'].map(q => (
                <button 
                  key={q} 
                  onClick={() => handleSend(q)}
                  className="text-xs bg-white border border-zinc-200 px-3 py-2 rounded-full text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' ? "bg-emerald-500 text-white rounded-tr-none shadow-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm"
            )}>
              {msg.assistant_text || msg.text}
              
              {msg.payload?.warnings?.map((w: string, idx: number) => (
                <div key={idx} className="mt-2 flex items-start gap-1.5 text-[10px] text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}

              {msg.payload?.cards?.map((card: any, idx: number) => (
                <div key={idx}>
                  <ChatCard card={card} />
                </div>
              ))}

              {msg.payload?.followup_questions?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.payload.followup_questions.map((q: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入文字或上传照片..."
            className="w-full bg-white border border-zinc-200 p-4 pr-12 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm shadow-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={loading}
              className="p-2 bg-zinc-900 text-white rounded-xl disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanView = () => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetch('/api/plan/user_123').then(res => res.json()).then(data => {
      setPlan(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-400" /></div>;

  if (!plan) return (
    <div className="text-center py-12">
      <Calendar className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
      <p className="text-zinc-500">暂无今日计划</p>
      <Link to="/chat" className="text-emerald-500 font-medium mt-2 inline-block">去和教练聊聊生成计划</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-xl border border-zinc-200">
        {(['today', 'week', 'month'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              tab === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t === 'today' ? '今日' : t === 'week' ? '7日' : '4周'}
          </button>
        ))}
      </div>

      <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-zinc-900">训练内容</h3>
          </div>
          {tab === 'today' && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">维度博弈优化中</span>}
        </div>
        <div className="prose prose-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">
          {tab === 'today' ? plan.workout : tab === 'week' ? "本周重点：渐进负荷与核心稳定。\n1-3天：力量训练\n4天：主动恢复\n5-7天：有氧与灵活性" : "本月目标：体脂下降2%，肌肉量维持。\n第一阶段：适应期\n第二阶段：强化期\n第三阶段：冲刺期\n第四阶段：减量周"}
        </div>
        {tab === 'today' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="text-[10px] bg-zinc-100 px-3 py-1.5 rounded-full text-zinc-600 font-bold hover:bg-zinc-200 transition-colors">替代动作</button>
            <button className="text-[10px] bg-zinc-100 px-3 py-1.5 rounded-full text-zinc-600 font-bold hover:bg-zinc-200 transition-colors">只有20分钟</button>
            <button className="text-[10px] bg-zinc-100 px-3 py-1.5 rounded-full text-zinc-600 font-bold hover:bg-zinc-200 transition-colors">器械不全</button>
          </div>
        )}
      </section>

      <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-zinc-900">营养与补剂</h3>
        </div>
        <div className="prose prose-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{plan.meals}</div>
        <p className="mt-3 text-[10px] text-zinc-400 italic">依据医学界最新实验数据：蛋白质摄入建议为 1.6g/kg 体重。</p>
      </section>

      <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-zinc-900">恢复与心理</h3>
        </div>
        <div className="prose prose-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{plan.recovery}</div>
      </section>
    </div>
  );
};

const LogView = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState<Partial<Log>>({
    weight: 70,
    sleepHours: 8,
    mood: 'happy',
    completion: 100,
    notes: '',
  });

  useEffect(() => {
    fetch('/api/logs/user_123').then(res => res.json()).then(setLogs);
  }, []);

  const handleSubmit = async () => {
    const date = new Date().toISOString().split('T')[0];
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_123', date, log: newLog }),
    });
    setShowForm(false);
    fetch('/api/logs/user_123').then(res => res.json()).then(setLogs);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">训练完成率</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">85%</div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1">↑ 12% vs 上周</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">体重趋势</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">-1.2kg</div>
          <div className="text-[10px] text-zinc-400 font-bold mt-1">近7天变化</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-zinc-900">打卡日记</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xl fixed inset-x-4 bottom-24 z-20 max-w-md mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">今日状态打卡</h3>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 p-2">取消</button>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">体重 (kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-zinc-50 rounded-xl border-none mt-1 focus:ring-2 ring-emerald-500/20 outline-none" 
                    value={newLog.weight} 
                    onChange={e => setNewLog({...newLog, weight: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">睡眠时长 (h)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-zinc-50 rounded-xl border-none mt-1 focus:ring-2 ring-emerald-500/20 outline-none" 
                    value={newLog.sleepHours} 
                    onChange={e => setNewLog({...newLog, sleepHours: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">心情状态</label>
                <div className="flex justify-between mt-2">
                  {['happy', 'neutral', 'sad', 'stressed'].map(m => (
                    <button 
                      key={m}
                      onClick={() => setNewLog({...newLog, mood: m})}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        newLog.mood === m ? "border-emerald-500 bg-emerald-50" : "border-zinc-100"
                      )}
                    >
                      {m === 'happy' ? <Smile className="w-6 h-6 text-emerald-500" /> : 
                       m === 'neutral' ? <Smile className="w-6 h-6 text-zinc-400" /> :
                       m === 'sad' ? <Smile className="w-6 h-6 text-blue-400" /> :
                       <AlertCircle className="w-6 h-6 text-red-400" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">训练完成度 ({newLog.completion}%)</label>
                <input 
                  type="range" 
                  className="w-full mt-2 accent-emerald-500" 
                  min="0" max="100" 
                  value={newLog.completion} 
                  onChange={e => setNewLog({...newLog, completion: Number(e.target.value)})}
                />
              </div>
              <button 
                onClick={handleSubmit}
                className="w-full bg-zinc-900 text-white p-4 rounded-2xl font-bold mt-4 shadow-lg active:scale-[0.98] transition-all"
              >
                提交今日数据
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {logs.map((log, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-4 shadow-sm">
            <div className="bg-zinc-50 p-3 rounded-xl text-center min-w-[60px]">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">{log.date.split('-')[1]}月</p>
              <p className="text-xl font-bold text-zinc-900">{log.date.split('-')[2]}</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-zinc-800">{log.data.weight} kg</p>
                <div className="flex items-center gap-1">
                   {log.data.mood === 'happy' ? <Smile className="w-4 h-4 text-emerald-500" /> : <Smile className="w-4 h-4 text-zinc-300" />}
                   <span className="text-[10px] text-zinc-400">{log.data.sleepHours}h 睡眠</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${log.data.completion}%` }}
                  className="h-full bg-emerald-500 rounded-full" 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AlbumView = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [compare, setCompare] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/album/user_123').then(res => res.json()).then(setPhotos);
  }, []);

  const toggleCompare = (id: number) => {
    if (compare.includes(id)) setCompare(compare.filter(i => i !== id));
    else if (compare.length < 2) setCompare([...compare, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-zinc-900">相册日记</h2>
        <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
          {compare.length === 2 ? '开始对比' : '选择两张对比'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.length === 0 && [1,2,3,4,5,6].map(i => (
          <div key={i} className="aspect-square bg-zinc-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-zinc-300" />
          </div>
        ))}
        {photos.map((p, i) => (
          <div 
            key={i} 
            onClick={() => toggleCompare(p.id)}
            className={cn(
              "aspect-square bg-zinc-200 rounded-xl relative overflow-hidden cursor-pointer border-2 transition-all",
              compare.includes(p.id) ? "border-emerald-500 scale-[0.95]" : "border-transparent"
            )}
          >
            <img src={`/uploads/${p.filename}`} alt="Progress" className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] px-1 rounded">
              {new Date(p.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-zinc-900 text-white p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold">拍照指导</h3>
        </div>
        <ul className="text-xs text-zinc-400 space-y-2">
          <li className="flex gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> 同一时间（建议晨起空腹）</li>
          <li className="flex gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> 同一位置、同一光线</li>
          <li className="flex gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> 保持自然站姿，手机高度在腰部</li>
        </ul>
      </section>
    </div>
  );
};

const SettingsView = () => {
  const [settings, setSettings] = useState({
    tone: 'gentle',
    pushTime: '08:00',
    frequency: 'daily',
    companionMode: false,
  });

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_123', settings }),
    });
    alert('设置已保存');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-zinc-900">设置</h2>
      
      <div className="space-y-4">
        <section className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase">教练语气风格</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['strict', 'gentle', 'data'].map(t => (
                <button
                  key={t}
                  onClick={() => setSettings({...settings, tone: t as any})}
                  className={cn(
                    "py-2 text-[10px] font-bold rounded-lg border-2 transition-all",
                    settings.tone === t ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-400"
                  )}
                >
                  {t === 'strict' ? '严厉型' : t === 'gentle' ? '温柔型' : '数据型'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-medium">陪伴模式 (多共情，少计划)</span>
            </div>
            <button 
              onClick={() => setSettings({...settings, companionMode: !settings.companionMode})}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                settings.companionMode ? "bg-emerald-500" : "bg-zinc-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                settings.companionMode ? "right-1" : "left-1"
              )} />
            </button>
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-4">
            <label className="text-xs font-bold text-zinc-400 uppercase">计划推送时间</label>
            <input 
              type="time" 
              className="w-full p-3 bg-zinc-50 rounded-xl border-none mt-1" 
              value={settings.pushTime}
              onChange={e => setSettings({...settings, pushTime: e.target.value})}
            />
          </div>
        </section>

        <button 
          onClick={handleSave}
          className="w-full bg-zinc-900 text-white p-4 rounded-2xl font-bold shadow-lg"
        >
          保存设置
        </button>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold">模拟推送队列</span>
          </div>
          <p className="text-[10px] text-emerald-600 leading-relaxed">
            系统将在每日 {settings.pushTime} 自动为您生成并推送今日博弈计划。
            当前语气：{settings.tone === 'strict' ? '严厉监督' : settings.tone === 'gentle' ? '温柔陪伴' : '客观数据'}。
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/plan" element={<PlanView />} />
          <Route path="/log" element={<LogView />} />
          <Route path="/album" element={<AlbumView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
