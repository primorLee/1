"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Code2,
  Users,
  Megaphone,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

const ADVISOR_ROLES = [
  {
    id: "investor",
    title: "投资人",
    desc: "关注市场空间、增长潜力、竞争壁垒和回报。",
    icon: Briefcase,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    gradient: "from-indigo-500/20 to-blue-500/20",
  },
  {
    id: "engineer",
    title: "工程师",
    desc: "关注技术可行性、实现难度、资源需求和开发风险。",
    icon: Code2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    id: "user",
    title: "用户",
    desc: "关注产品是否真正解决痛点，是否愿意持续使用。",
    icon: Users,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "marketer",
    title: "市场专家",
    desc: "关注定位、传播、获客和差异化。",
    icon: Megaphone,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    gradient: "from-fuchsia-500/20 to-pink-500/20",
  },
];

type Role = (typeof ADVISOR_ROLES)[number];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = async (role: Role) => {
    const response = await fetch("/api/advisor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idea,
        roleTitle: role.title,
        roleDesc: role.desc,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data.text;
  };

  const handleSubmit = async () => {
    if (!idea.trim() || loading) return;

    setSubmitted(true);
    setLoading(true);
    setFeedbacks({});
    setError(null);

    try {
      const results = await Promise.all(
        ADVISOR_ROLES.map(async (role) => {
          const text = await generateFeedback(role);
          return [role.id, text] as const;
        })
      );

      const feedbackMap = Object.fromEntries(results);
      setFeedbacks(feedbackMap);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "调用失败，请检查 API Key 或网络连接。"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse the structured text
  const parseFeedback = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const sections = {
      pros: [] as string[],
      cons: [] as string[],
      advice: [] as string[],
      other: [] as string[],
    };

    let currentSection = 'other';

    lines.forEach(line => {
      if (line.includes('最认可的点') || line.startsWith('1）') || line.startsWith('1.')) {
        currentSection = 'pros';
        sections.pros.push(line.replace(/^(1）|1\.|我最认可的点：?)/, '').trim());
      } else if (line.includes('最担心的风险') || line.startsWith('2）') || line.startsWith('2.')) {
        currentSection = 'cons';
        sections.cons.push(line.replace(/^(2）|2\.|我最担心的风险：?)/, '').trim());
      } else if (line.includes('给你的建议') || line.startsWith('3）') || line.startsWith('3.')) {
        currentSection = 'advice';
        sections.advice.push(line.replace(/^(3）|3\.|我给你的建议：?)/, '').trim());
      } else {
        if (currentSection === 'pros') sections.pros.push(line);
        else if (currentSection === 'cons') sections.cons.push(line);
        else if (currentSection === 'advice') sections.advice.push(line);
        else sections.other.push(line);
      }
    });

    return sections;
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Startup Evaluator</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Idea <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Advisor</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            输入你的创业想法，系统将从四个关键角色给出结构化反馈。
            <br className="hidden md:block" />
            让投资人、工程师、用户和市场专家为你把关。
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mb-24"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-fuchsia-500/30 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-2 backdrop-blur-xl shadow-2xl">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="例如：做一个帮助模拟 IC 设计团队自动整理仿真结果、生成报告并优化参数的 AI 工具..."
                rows={5}
                className="w-full bg-transparent text-white placeholder:text-slate-500 p-6 text-lg md:text-xl resize-none outline-none"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-white/10 bg-black/20 rounded-2xl mt-2">
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  建议尽量描述目标用户、场景与商业模式
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !idea.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      开始分析
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <h2 className="text-3xl font-bold text-white">顾问视角</h2>
                {loading && (
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在生成多维度反馈...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ADVISOR_ROLES.map((role, index) => {
                  const feedbackText = feedbacks[role.id];
                  const parsed = feedbackText ? parseFeedback(feedbackText) : null;
                  const Icon = role.icon;

                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-colors"
                    >
                      {/* Top Gradient Bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${role.gradient}`} />
                      
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${role.bg} ${role.border} border flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${role.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{role.title}</h3>
                              <p className="text-sm text-slate-400 mt-1">{role.desc}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 relative">
                          {!feedbackText ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 min-h-[200px]">
                              {loading ? (
                                <>
                                  <Loader2 className={`w-8 h-8 animate-spin mb-4 ${role.color}`} />
                                  <p className="text-sm">正在思考...</p>
                                </>
                              ) : (
                                <p className="text-sm">等待分析</p>
                              )}
                            </div>
                          ) : parsed ? (
                            <div className="space-y-6 text-sm md:text-base leading-relaxed">
                              {/* Pros */}
                              {parsed.pros.length > 0 && (
                                <div>
                                  <h4 className="flex items-center gap-2 font-semibold text-emerald-400 mb-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    最认可的点
                                  </h4>
                                  <p className="text-slate-300">{parsed.pros.join(' ')}</p>
                                </div>
                              )}
                              
                              {/* Cons */}
                              {parsed.cons.length > 0 && (
                                <div>
                                  <h4 className="flex items-center gap-2 font-semibold text-rose-400 mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    最担心的风险
                                  </h4>
                                  <p className="text-slate-300">{parsed.cons.join(' ')}</p>
                                </div>
                              )}

                              {/* Advice */}
                              {parsed.advice.length > 0 && (
                                <div>
                                  <h4 className="flex items-center gap-2 font-semibold text-indigo-400 mb-2">
                                    <Lightbulb className="w-4 h-4" />
                                    给你的建议
                                  </h4>
                                  <ul className="space-y-2 text-slate-300">
                                    {parsed.advice.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-indigo-500/50 mt-0.5">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Fallback for unparsed text */}
                              {parsed.pros.length === 0 && parsed.cons.length === 0 && parsed.advice.length === 0 && (
                                <p className="text-slate-300 whitespace-pre-wrap">{feedbackText}</p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
