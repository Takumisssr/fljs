import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Settings,
  User,
  Zap,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tone = 'strict' | 'gentle' | 'data';

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
  workTime: string;
  bodyFat?: number;
  cooking: boolean;
  experience: string;
  tone: Tone;
  weight?: number;
}

interface Plan {
  workout: string;
  meals: string;
  recovery: string;
}

interface LogEntry {
  id: number;
  date: string;
  data: {
    weight: number;
    sleepHours: number;
    mood: string;
    completion: number;
    notes?: string;
  };
}

interface AlbumItem {
  id: number;
  filename: string;
  analysis: {
    observations?: string;
    focus_areas?: string;
    shooting_guide?: string;
  };
  created_at: string;
}

interface AssistantMessage {
  role: 'assistant';
  assistant_text?: string;
  error?: string;
  payload?: {
    warnings?: string[];
    followup_questions?: string[];
  };
}

interface UserMessage {
  role: 'user';
  text: string;
}

type ChatMessage = AssistantMessage | UserMessage;

const USER_ID_KEY = 'fitness_user_id';

function getUserId() {
  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const created = `user_${crypto.randomUUID()}`;
  window.localStorage.setItem(USER_ID_KEY, created);
  return created;
}

async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.error || data?.message || `请求失败：${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function useUserId() {
  return useMemo(() => getUserId(), []);
}

function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navItems = [
    { path: '/chat', icon: MessageSquare, label: '聊天' },
    { path: '/plan', icon: Calendar, label: '计划' },
    { path: '/log', icon: ClipboardList, label: '打卡' },
    { path: '/album', icon: ImageIcon, label: '相册' },
  ];

  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 fill-emerald-500 text-emerald-500" />
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">方练健身 AI</h1>
              <p className="text-xs text-zinc-500">训练、饮食、恢复建议</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings" className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900">
              <Settings className="h-5 w-5" />
            </Link>
            <Link to="/onboarding" className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition',
                  active ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900',
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Onboarding() {
  const userId = useUserId();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile>({
    goal: '减脂',
    subGoal: '建立可持续习惯',
    timePerDay: 30,
    equipment: [],
    injuries: '',
    sleep: '7小时',
    stress: '中等',
    diet: '正常饮食',
    allergies: '',
    budget: '中等',
    workTime: '朝九晚六',
    cooking: true,
    experience: '新手',
    tone: 'gentle',
    weight: 70,
    bodyFat: 25,
  });

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile }),
      });
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存资料失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">先完善你的训练资料</h2>
        <p className="mt-2 text-sm text-zinc-500">保存后，你的训练建议、计划和打卡会自动同步。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-zinc-700">
          <span>目标</span>
          <input className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} />
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>细分目标</span>
          <input className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.subGoal} onChange={(e) => setProfile({ ...profile, subGoal: e.target.value })} />
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>每天训练时长（分钟）</span>
          <input type="number" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.timePerDay} onChange={(e) => setProfile({ ...profile, timePerDay: Number(e.target.value) })} />
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>体重（kg）</span>
          <input type="number" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.weight || ''} onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })} />
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>体脂（%）</span>
          <input type="number" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.bodyFat || ''} onChange={(e) => setProfile({ ...profile, bodyFat: Number(e.target.value) })} />
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>工作节奏</span>
          <input className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.workTime} onChange={(e) => setProfile({ ...profile, workTime: e.target.value })} />
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>训练经验</span>
          <select className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}>
            <option value="新手">新手</option>
            <option value="入门">入门</option>
            <option value="进阶">进阶</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-zinc-700">
          <span>教练语气</span>
          <select className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.tone} onChange={(e) => setProfile({ ...profile, tone: e.target.value as Tone })}>
            <option value="gentle">温和</option>
            <option value="strict">严格</option>
            <option value="data">数据型</option>
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>伤病或限制</span>
        <textarea className="min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={profile.injuries} onChange={(e) => setProfile({ ...profile, injuries: e.target.value })} />
      </label>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <button onClick={handleSubmit} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-4 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
        保存并开始使用
      </button>
    </div>
  );
}

function Chat() {
  const userId = useUserId();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    apiRequest<Profile | null>(`/api/profile/${userId}`)
      .then((data) => {
        setProfile(data);
        setProfileLoaded(true);
      })
      .catch((err) => {
        setPageError(err instanceof Error ? err.message : '加载资料失败');
        setProfileLoaded(true);
      });
  }, [userId]);

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || !profile || loading) return;

    const nextMessages = [...messages, { role: 'user', text } as UserMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await apiRequest<AssistantMessage>('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: text,
          profile,
          history: nextMessages,
        }),
      });
      setMessages((current) => [...current, { role: 'assistant', ...data }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '聊天失败，请稍后再试';
      setMessages((current) => [...current, { role: 'assistant', error: message }]);
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (!profile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', userId);
      formData.append('profile', JSON.stringify(profile));

      const result = await apiRequest<AlbumItem['analysis']>('/api/analyze-photo', {
        method: 'POST',
        body: formData,
      });

      setMessages((current) => [
        ...current,
        { role: 'user', text: `已上传照片：${file.name}` },
        {
          role: 'assistant',
          assistant_text: result.observations || result.focus_areas || '照片分析已完成，你可以去相册页查看记录。',
          payload: {
            warnings: result.shooting_guide ? [`拍摄建议：${result.shooting_guide}`] : [],
          },
        },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', error: err instanceof Error ? err.message : '上传照片失败' },
      ]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!profileLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-red-600">{pageError || '还没有用户资料，请先填写。'}</p>
        <Link to="/onboarding" className="inline-flex rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white">
          去填写资料
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">AI 教练聊天</h2>
        <p className="mt-2 text-sm text-zinc-500">告诉我你的目标、状态或问题，我会给你训练、饮食和恢复建议。</p>
      </section>

      <section className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        {messages.length === 0 ? (
          <div className="space-y-3 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Zap className="h-7 w-7 fill-emerald-500 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">开始一次训练对话</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {['帮我生成今天的训练计划', '今天状态一般该怎么练', '帮我估算减脂饮食', '给我一份恢复建议'].map((item) => (
                <button key={item} onClick={() => void sendMessage(item)} className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-600">
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6', message.role === 'user' ? 'rounded-tr-sm bg-emerald-500 text-white' : 'rounded-tl-sm border border-zinc-200 bg-zinc-50 text-zinc-800')}>
                {'text' in message ? message.text : message.assistant_text || message.error || '暂无返回内容'}
                {'error' in message && message.error ? (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{message.error}</span>
                  </div>
                ) : null}
                {'payload' in message && message.payload?.warnings?.length ? (
                  <div className="mt-2 space-y-2">
                    {message.payload.warnings.map((warning) => (
                      <div key={warning} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">
                        {warning}
                      </div>
                    ))}
                  </div>
                ) : null}
                {'payload' in message && message.payload?.followup_questions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.payload.followup_questions.map((question) => (
                      <button key={question} onClick={() => void sendMessage(question)} className="rounded-full bg-white px-3 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 transition hover:text-emerald-600">
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}

        {loading ? <div className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />AI 正在思考</div> : null}
        {uploading ? <div className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />正在上传并分析照片</div> : null}

        <div className="flex gap-2 pt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void sendMessage();
            }}
            placeholder="输入你的问题，比如今天练什么、怎么吃、哪里酸痛"
            className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-emerald-500"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />
          <button onClick={() => fileInputRef.current?.click()} className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-600" title="上传照片分析">
            <Camera className="h-5 w-5" />
          </button>
          <button onClick={() => void sendMessage()} disabled={loading || uploading} className="rounded-2xl bg-zinc-900 px-4 py-3 text-white transition hover:bg-zinc-800 disabled:opacity-60">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

function PlanView() {
  const userId = useUserId();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Plan | null>(`/api/plan/${userId}`)
      .then(setPlan)
      .catch((err) => setError(err instanceof Error ? err.message : '加载计划失败'));
  }, [userId]);

  if (error) return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>;
  if (!plan) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <Calendar className="mx-auto h-10 w-10 text-zinc-300" />
        <p className="mt-3 text-sm text-zinc-500">还没有训练计划，去聊天页生成一份吧。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[
        ['训练安排', plan.workout],
        ['饮食建议', plan.meals],
        ['恢复建议', plan.recovery],
      ].map(([title, content]) => (
        <section key={title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-600">{content}</p>
        </section>
      ))}
    </div>
  );
}

function LogView() {
  const userId = useUserId();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    weight: 70,
    sleepHours: 8,
    mood: 'normal',
    completion: 80,
    notes: '',
  });

  async function loadLogs() {
    try {
      const data = await apiRequest<LogEntry[]>(`/api/logs/${userId}`);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载打卡失败');
    }
  }

  useEffect(() => {
    void loadLogs();
  }, [userId]);

  async function submitLog() {
    setSaving(true);
    setError('');
    try {
      await apiRequest('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: new Date().toISOString().split('T')[0],
          log: form,
        }),
      });
      await loadLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存打卡失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">今日打卡</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm"><span>体重（kg）</span><input type="number" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} /></label>
          <label className="space-y-2 text-sm"><span>睡眠（小时）</span><input type="number" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: Number(e.target.value) })} /></label>
          <label className="space-y-2 text-sm">
            <span>心情</span>
            <select className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
              <option value="great">很好</option>
              <option value="normal">一般</option>
              <option value="tired">疲惫</option>
              <option value="stressed">压力大</option>
            </select>
          </label>
          <label className="space-y-2 text-sm"><span>完成度（%）</span><input type="number" min="0" max="100" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={form.completion} onChange={(e) => setForm({ ...form, completion: Number(e.target.value) })} /></label>
        </div>

        <label className="mt-4 block space-y-2 text-sm">
          <span>备注</span>
          <textarea className="min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>

        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}
        <button onClick={() => void submitLog()} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          保存今日打卡
        </button>
      </section>

      <section className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900">历史记录</h3>
        {logs.length === 0 ? <p className="text-sm text-zinc-500">还没有历史打卡。</p> : null}
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900">{log.date}</span>
              <span className="text-xs text-zinc-500">完成度 {log.data.completion}%</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">体重 {log.data.weight}kg，睡眠 {log.data.sleepHours}h，心情 {log.data.mood}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function AlbumView() {
  const userId = useUserId();
  const [photos, setPhotos] = useState<AlbumItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<AlbumItem[]>(`/api/album/${userId}`)
      .then(setPhotos)
      .catch((err) => setError(err instanceof Error ? err.message : '加载相册失败'));
  }, [userId]);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">照片分析记录</h2>
        <p className="mt-2 text-sm text-zinc-500">在聊天页点击相机按钮上传照片后，这里会自动显示分析记录。</p>
      </section>

      {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {photos.map((photo) => (
          <article key={photo.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <img src={`/uploads/${photo.filename}`} alt="训练照片" className="h-64 w-full object-cover" />
            <div className="space-y-3 p-5">
              <p className="text-xs text-zinc-500">{new Date(photo.created_at).toLocaleString()}</p>
              <p className="text-sm text-zinc-700">{photo.analysis.observations || photo.analysis.focus_areas || '已完成分析'}</p>
              {photo.analysis.shooting_guide ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">拍摄建议：{photo.analysis.shooting_guide}</div> : null}
            </div>
          </article>
        ))}
      </div>

      {photos.length === 0 && !error ? <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-500">暂时还没有照片记录。</div> : null}
    </div>
  );
}

function SettingsView() {
  const userId = useUserId();
  const [settings, setSettings] = useState({
    tone: 'gentle',
    pushTime: '08:00',
    companionMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      await apiRequest('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, settings }),
      });
      setMessage('设置已保存');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存设置失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">设置</h2>
      <label className="space-y-2 text-sm">
        <span>教练语气</span>
        <select className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={settings.tone} onChange={(e) => setSettings({ ...settings, tone: e.target.value })}>
          <option value="gentle">温和</option>
          <option value="strict">严格</option>
          <option value="data">数据型</option>
        </select>
      </label>
      <label className="space-y-2 text-sm">
        <span>提醒时间</span>
        <input type="time" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-emerald-500" value={settings.pushTime} onChange={(e) => setSettings({ ...settings, pushTime: e.target.value })} />
      </label>
      <label className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-sm">
        <span>陪伴模式</span>
        <input type="checkbox" checked={settings.companionMode} onChange={(e) => setSettings({ ...settings, companionMode: e.target.checked })} />
      </label>
      {message ? <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">{message}</div> : null}
      <button onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
        保存设置
      </button>
    </div>
  );
}

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
