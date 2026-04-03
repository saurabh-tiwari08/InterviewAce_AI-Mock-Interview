"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, CheckCircle, AlertTriangle, TrendingUp, Award,
  RotateCcw, Home, Loader2, ChevronRight, Star
} from "lucide-react";

type EvalResult = {
  overallScore: number;
  summary: string;
  scores: {
    technicalDepth: number;
    communication: number;
    problemSolving: number;
    starMethod: number;
    confidence: number;
  };
  strengths: string[];
  improvements: string[];
  questionAnalysis: { question: string; quality: string; feedback: string }[];
  hiringRecommendation: string;
  nextSteps: string;
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <text x="50" y="50" textAnchor="middle" dy="0.35em" fill={color} fontSize="22" fontWeight="700" fontFamily="monospace">
        {score}
      </text>
    </svg>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "bg-green-400" : value >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span className={`text-xs font-mono ${value >= 75 ? "text-green-400" : value >= 50 ? "text-amber-400" : "text-red-400"}`}>
          {value}/100
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ResultsCore() {
  const params = useSearchParams();
  const router = useRouter();

  const role = params.get("role") || "";
  const level = params.get("level") || "";
  const topics = (params.get("topics") || "").split(",").filter(Boolean);
  const company = params.get("company") || "";
  const historyStr = params.get("history") || "[]";

  const [result, setResult] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const evaluate = async () => {
      try {
        const history = JSON.parse(decodeURIComponent(historyStr));
        if (history.length === 0) {
          setError("No interview data to evaluate.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, level, topics, company, history, action: "evaluate" }),
        });
        const data = await res.json();
        const parsed = JSON.parse(data.content);
        setResult(parsed);
      } catch (e) {
        setError("Failed to generate evaluation. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    evaluate();
  }, []);

  const recColor = (rec: string) => {
    if (rec?.includes("Strong Yes")) return "text-green-400 border-green-400/30 bg-green-400/10";
    if (rec?.includes("Yes")) return "text-green-400 border-green-400/30 bg-green-400/10";
    if (rec?.includes("Maybe")) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    return "text-red-400 border-red-400/30 bg-red-400/10";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-dim)] border border-[var(--border-accent)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold mb-1">Analyzing your interview...</p>
          <p className="text-sm text-[var(--text-secondary)]">AI is evaluating your responses across 5 dimensions</p>
        </div>
        <div className="flex gap-1 mt-2">
          {["Technical depth", "Communication", "Problem solving", "STAR method", "Confidence"].map((d, i) => (
            <div key={d} className="tag-chip" style={{ animationDelay: `${i * 0.1}s` }}>{d}</div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-[var(--red)]" />
        <p className="text-[var(--text-secondary)]">{error || "Something went wrong"}</p>
        <button onClick={() => router.push("/")} className="btn-primary px-6 py-3 rounded-xl text-sm">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] grid-bg pb-16">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            Interview Report · {level} {role.toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              New Interview
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Hero Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-8"
        >
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={result.overallScore} size={130} />
            <div className={`px-3 py-1 rounded-lg border text-xs font-mono ${recColor(result.hiringRecommendation)}`}>
              {result.hiringRecommendation}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Clash Display', system-ui" }}>
              Overall Score: {result.overallScore}/100
            </h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">{result.summary}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {topics.map(t => <span key={t} className="tag-chip">{t}</span>)}
              {company && <span className="tag-chip blue">{company}</span>}
            </div>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
              Score Breakdown
            </h2>
            <div className="space-y-4">
              <ScoreBar label="Technical Depth" value={result.scores.technicalDepth} />
              <ScoreBar label="Communication" value={result.scores.communication} />
              <ScoreBar label="Problem Solving" value={result.scores.problemSolving} />
              <ScoreBar label="STAR Method" value={result.scores.starMethod} />
              <ScoreBar label="Confidence" value={result.scores.confidence} />
            </div>
          </motion.div>

          {/* Strengths & Improvements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                    <span className="text-green-400 mt-0.5 shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Improvement Areas
              </h3>
              <ul className="space-y-2">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚡</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Question Analysis */}
        {result.questionAnalysis?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--accent)]" />
              Per-Question Analysis
            </h2>
            <div className="space-y-4">
              {result.questionAnalysis.map((qa, i) => (
                <div key={i} className="border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium leading-relaxed">{qa.question}</p>
                    <span className={`shrink-0 tag-chip ${qa.quality === "Excellent" ? "" : qa.quality === "Good" ? "amber" : "red"}`}>
                      {qa.quality}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{qa.feedback}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6 mb-8 border-[var(--border-accent)]"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--accent)]" />
            Recommended Next Steps
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.nextSteps}</p>
        </motion.div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="btn-primary px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </button>
          <button
            onClick={() => router.push(`/interview?role=${role}&level=${level}&topics=${topics.join(",")}&company=${company}&duration=20`)}
            className="btn-ghost px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            Same Setup <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>}>
      <ResultsCore />
    </Suspense>
  );
}
