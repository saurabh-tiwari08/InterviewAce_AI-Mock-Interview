"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic, Brain, BarChart3, Zap, ArrowRight, Code2, Briefcase,
  Database, Globe, ChevronRight, Star, Users, TrendingUp
} from "lucide-react";

const ROLES = [
  { id: "swe", label: "Software Engineer", icon: Code2, color: "accent" },
  { id: "frontend", label: "Frontend Dev", icon: Globe, color: "blue" },
  { id: "backend", label: "Backend Dev", icon: Database, color: "amber" },
  { id: "pm", label: "Product Manager", icon: Briefcase, color: "red" },
];

const LEVELS = ["Internship", "Junior", "Mid-Level", "Senior", "Staff/Lead"];

const TOPICS = [
  "Data Structures", "System Design", "Behavioral", "React", "Node.js",
  "Python", "Databases", "OS Concepts", "Networking", "Leadership",
  "Product Thinking", "ML Basics", "C++"
];

const STATS = [
  { icon: Users, value: "580+", label: "Mock interviews" },
  { icon: TrendingUp, value: "38%", label: "Avg score improvement" },
  
];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    role: "",
    level: "",
    topics: [] as string[],
    duration: 20,
    company: "",
  });

  const toggleTopic = (t: string) => {
    setConfig((prev) => ({
      ...prev,
      topics: prev.topics.includes(t)
        ? prev.topics.filter((x) => x !== t)
        : [...prev.topics, t],
    }));
  };

  const startInterview = () => {
    const params = new URLSearchParams({
      role: config.role,
      level: config.level,
      topics: config.topics.join(","),
      duration: config.duration.toString(),
      company: config.company,
    });
    router.push(`/interview?${params.toString()}`);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <Brain className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-sm tracking-tight">InterviewAce</span>
            <span className="tag-chip ml-2">BETA</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            {STATS.map((s) => (
              <div key={s.label} className="hidden sm:flex items-center gap-1.5">
                <s.icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-mono text-xs text-[var(--text-primary)]">{s.value}</span>
                <span className="text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-mono mb-6">
            <Zap className="w-3 h-3" />
            Powered by Gemini AI · Real-time feedback
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 leading-[1.1]"
            style={{ fontFamily: "'Clash Display', system-ui" }}>
            Ace your next
            <span className="block text-[var(--accent)]">tech  interview</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto leading-relaxed">
            Realistic AI mock interviews with instant, structured feedback.
            Stop practicing in the dark - know exactly where you stand.
          </p>
        </motion.div>

        {/* Config Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Step indicator */}
          <div className="flex border-b border-[var(--border)]">
            {[
              { n: 1, label: "Role & Level" },
              { n: 2, label: "Topics" },
              { n: 3, label: "Settings" },
            ].map((s) => (
              <button
                key={s.n}
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex-1 py-3.5 text-xs font-mono flex items-center justify-center gap-2 transition-all
                  ${step === s.n ? "border-b-2 border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]" : ""}
                  ${step < s.n ? "text-[var(--text-secondary)] opacity-40 cursor-not-allowed" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s.n ? "bg-[var(--accent)] text-black" : step > s.n ? "bg-[var(--accent-dim)] text-[var(--accent)]" : "bg-[var(--border)] text-[var(--text-secondary)]"}`}>
                  {step > s.n ? "✓" : s.n}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-semibold mb-1">What role are you interviewing for?</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">This shapes the question bank and evaluation criteria</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setConfig((c) => ({ ...c, role: r.id }))}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2.5 transition-all text-sm font-medium
                        ${config.role === r.id
                          ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                          : "border-[var(--border)] hover:border-white/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      <r.icon className="w-5 h-5" />
                      {r.label}
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">Experience level</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setConfig((c) => ({ ...c, level: l }))}
                      className={`px-4 py-2 rounded-lg text-sm transition-all
                        ${config.level === l
                          ? "bg-[var(--accent)] text-black font-semibold"
                          : "bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:border-white/20"
                        }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                    Target company <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft, DocuSign..."
                    value={config.company}
                    onChange={(e) => setConfig((c) => ({ ...c, company: e.target.value }))}
                    className="w-full bg-black/30 border border-[var(--border)] rounded-xl px-4 py-3 text-sm 
                      focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder:text-white/20
                      transition-colors"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!config.role || !config.level}
                  className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-semibold mb-1">What topics should we cover?</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Select all that apply - AI will mix them naturally</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={`px-3.5 py-2 rounded-lg text-sm transition-all font-mono
                        ${config.topics.includes(t)
                          ? "bg-[var(--accent)] text-black font-semibold"
                          : "bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 rounded-xl text-sm">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={config.topics.length === 0}
                    className="btn-primary flex-[3] py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue ({config.topics.length} selected) <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-semibold mb-1">Final settings</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">You can always end the interview early</p>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-[var(--text-secondary)]">Interview duration</label>
                    <span className="font-mono text-[var(--accent)] text-sm">{config.duration} min</span>
                  </div>
                  <input
                    type="range" min="10" max="60" step="5"
                    value={config.duration}
                    onChange={(e) => setConfig((c) => ({ ...c, duration: Number(e.target.value) }))}
                    className="w-full accent-green-400"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1 font-mono">
                    <span>10m</span><span>30m</span><span>60m</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-black/30 rounded-xl border border-[var(--border)] p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Role</span>
                    <span className="font-mono text-[var(--accent)]">{ROLES.find(r => r.id === config.role)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Level</span>
                    <span className="font-mono text-[var(--accent)]">{config.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Topics</span>
                    <span className="font-mono text-[var(--accent)] text-right max-w-48 truncate">{config.topics.join(", ")}</span>
                  </div>
                  {config.company && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Company</span>
                      <span className="font-mono text-[var(--accent)]">{config.company}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[var(--accent-dim)] border border-[var(--border-accent)] rounded-xl p-3 mb-6 flex gap-3">
                  <Mic className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Your browser will request microphone access. Speak clearly - the AI transcribes in real time
                    and generates follow-up questions based on your responses.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-ghost flex-1 py-3 rounded-xl text-sm">
                    Back
                  </button>
                  <button
                    onClick={startInterview}
                    className="btn-primary flex-[3] py-3.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Start Interview
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Feature row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          {[
            { icon: Mic, title: "Real voice input", desc: "Speak naturally — AI transcribes and understands context" },
            { icon: Brain, title: "Adaptive questions", desc: "Follow-up questions based on your actual answers" },
            { icon: BarChart3, title: "Detailed scorecard", desc: "STAR method, technical depth, communication — all scored" },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-5 flex gap-3.5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] border border-[var(--border-accent)] flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{f.title}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="text-center py-8 text-xs text-yellow/20 font-mono">
        Built by Saurabh Tiwari with ❤️ · Powered by Gemini AI
      </footer>
    </div>
  );
}
