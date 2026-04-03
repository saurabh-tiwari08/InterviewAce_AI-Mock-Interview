"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Square, Brain, Clock, ChevronRight,
  Volume2, Loader2, AlertCircle, CheckCircle, RotateCcw
} from "lucide-react";

type Message = {
  role: "ai" | "user";
  content: string;
  timestamp: number;
};

type InterviewState = "idle" | "ai-thinking" | "ai-speaking" | "user-speaking" | "processing" | "done";

function InterviewCore() {
  const router = useRouter();
  const params = useSearchParams();

  const role = params.get("role") || "swe";
  const level = params.get("level") || "Mid-Level";
  const topics = (params.get("topics") || "").split(",").filter(Boolean);
  const duration = Number(params.get("duration") || 20);
  const company = params.get("company") || "";

  const [state, setState] = useState<InterviewState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  // Timer
  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            endInterview();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1;
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")
    );
    if (preferred) utt.voice = preferred;
    utt.onend = () => onEnd?.();
    audioRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const callAI = useCallback(async (action: string, userAnswer?: string) => {
    setState("ai-thinking");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role, level, topics, company,
          history: messages,
          currentQuestion: messages.findLast(m => m.role === "ai")?.content,
          userAnswer,
          action,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const question = data.content.trim();
      const aiMsg: Message = { role: "ai", content: question, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
      setQuestionCount((q) => q + 1);

      setState("ai-speaking");
      speakText(question, () => {
        setState("user-speaking");
        startListening();
      });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "AI failed to respond";
      setError(errMsg);
      setState("idle");
    }
  }, [messages, role, level, topics, company, speakText]);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }
    const SpeechRec = (window as typeof window & { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition || window.SpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (final) setTranscript((t) => t + final + " ");
      setInterimTranscript(interim);
    };
    rec.onerror = () => setState("user-speaking");
    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const submitAnswer = useCallback(() => {
    const answer = (transcript + interimTranscript).trim();
    if (!answer) return;
    stopListening();
    setInterimTranscript("");
    setTranscript("");

    const userMsg: Message = { role: "user", content: answer, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setState("processing");

    setTimeout(() => callAI("followup", answer), 500);
  }, [transcript, interimTranscript, stopListening, callAI]);

  const startInterview = useCallback(async () => {
    setStarted(true);
    await callAI("first_question");
  }, [callAI]);

  const endInterview = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setState("done");

    const params = new URLSearchParams({
      role, level,
      topics: topics.join(","),
      company,
      history: JSON.stringify(messages),
    });
    router.push(`/results?${params.toString()}`);
  }, [messages, role, level, topics, company, router, stopListening]);

  const timePercent = Math.round((timeLeft / (duration * 60)) * 100);
  const isLowTime = timeLeft < 120;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Top Bar */}
      <header className="border-b border-[var(--border)] bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-sm font-mono text-[var(--text-secondary)]">
              {company ? `${company} · ` : ""}{level} {role.toUpperCase()}
            </span>
            <div className="flex gap-1">
              {topics.slice(0, 3).map(t => (
                <span key={t} className="tag-chip">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 font-mono text-sm ${isLowTime ? "text-[var(--red)]" : "text-[var(--text-secondary)]"}`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isLowTime ? "bg-[var(--red)]" : "bg-[var(--accent)]"}`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
            {started && (
              <button
                onClick={endInterview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--red)] border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                <Square className="w-3 h-3" />
                End
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6 space-y-4">
        {/* Welcome state */}
        {!started && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-[var(--accent-dim)] border border-[var(--border-accent)] flex items-center justify-center">
              <Brain className="w-10 h-10 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Clash Display', system-ui" }}>
                Ready when you are
              </h2>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm">
                The AI interviewer will ask questions and listen to your voice responses.
                Speak naturally — take your time.
              </p>
            </div>
            <button
              onClick={startInterview}
              className="btn-primary px-8 py-3.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
            >
              <Mic className="w-4 h-4" />
              Begin Interview
            </button>
            {error && (
              <div className="flex items-center gap-2 text-[var(--red)] text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
                ${msg.role === "ai"
                  ? "bg-[var(--accent-dim)] border border-[var(--border-accent)] text-[var(--accent)]"
                  : "bg-white/5 border border-[var(--border)] text-[var(--text-secondary)]"
                }`}>
                {msg.role === "ai" ? "AI" : "You"}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === "ai"
                  ? "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm"
                  : "bg-[var(--accent-dim)] border border-[var(--border-accent)] text-[var(--text-primary)] rounded-tr-sm"
                }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI thinking */}
        {state === "ai-thinking" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] border border-[var(--border-accent)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
              AI
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />
              <span className="text-xs text-[var(--text-secondary)] font-mono">Generating question...</span>
            </div>
          </motion.div>
        )}

        {/* AI speaking indicator */}
        {state === "ai-speaking" && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-mono pl-11">
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            Speaking...
          </div>
        )}

        {/* Interim transcript */}
        {state === "user-speaking" && (transcript || interimTranscript) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
              You
            </div>
            <div className="max-w-[80%] bg-white/5 border border-[var(--border)] border-dashed rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              {transcript}{" "}
              <span className="text-white/30 italic">{interimTranscript}</span>
              <span className="inline-block w-0.5 h-4 bg-[var(--accent)] ml-0.5 animate-blink" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-[var(--border)] bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {state === "user-speaking" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 bg-[var(--bg-card)] border border-red-500/30 rounded-xl px-4 py-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--red)] recording-pulse" />
                <span className="text-sm text-[var(--text-secondary)] font-mono flex-1">
                  {transcript || interimTranscript ? "Listening..." : "Speak your answer..."}
                </span>
                <Mic className="w-4 h-4 text-[var(--red)]" />
              </div>
              <button
                onClick={submitAnswer}
                className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 text-sm"
              >
                Done <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { stopListening(); setTranscript(""); setInterimTranscript(""); setState("idle"); }}
                className="p-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-white/20 transition-colors"
                title="Cancel"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {state === "idle" && started && (
            <div className="flex justify-center">
              <button
                onClick={() => { setState("user-speaking"); startListening(); }}
                className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 text-sm"
              >
                <Mic className="w-4 h-4" />
                Record Answer
              </button>
            </div>
          )}

          {(state === "ai-thinking" || state === "processing") && (
            <div className="flex justify-center items-center gap-2 text-[var(--text-secondary)] text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
              <span className="font-mono text-xs">
                {state === "processing" ? "Processing your answer..." : "Thinking..."}
              </span>
            </div>
          )}

          {state === "ai-speaking" && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setState("user-speaking");
                  startListening();
                }}
                className="btn-ghost px-6 py-3 rounded-xl text-sm flex items-center gap-2"
              >
                <MicOff className="w-4 h-4" />
                Skip to answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>}>
      <InterviewCore />
    </Suspense>
  );
}
