"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Person } from "@/lib/types";

// ── Global AI lock ────────────────────────────────────────────────────────────
// Module-level singleton: only one AI response can run at a time across ALL
// AIChat instances (even across multiple open portfolio cards).
type LockListener = (busy: boolean) => void;
const _lockListeners = new Set<LockListener>();
let _globalBusy = false;

const aiLock = {
  get busy() { return _globalBusy; },
  acquire() { _globalBusy = true; _lockListeners.forEach((fn) => fn(true)); },
  release() { _globalBusy = false; _lockListeners.forEach((fn) => fn(false)); },
  subscribe(fn: LockListener) {
    _lockListeners.add(fn);
    return () => { _lockListeners.delete(fn); };
  },
};

interface AIChatProps {
  person: Person;
}

function buildSystemContext(person: Person): string {
  const projects = [
    ...person.currentProjects.map((p) => `${p.name}: ${p.description}`),
    ...person.pastProjects.map((p) => `${p.name} (past): ${p.description}`),
  ].join("; ");
  const socials = person.socials.map((s) => `${s.label} ${s.url}`).join(", ");
  return `You're the AI hype-person for ${person.name}. Be witty, confident, and human — like a friend who actually knows them. MAX 2 short sentences. Only include facts relevant to the question. No filler, no "I'd be happy to".
Bio: ${person.bio}
Projects: ${projects}
Socials: ${socials}`;
}

/** Render a string with **bold** markdown into React nodes */
function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const PRESET_BUTTONS = [
  {
    id: "who",
    label: "Who is this?",
    prompt: (name: string) => `Quick punchy intro: who is ${name} in one or two sentences?`,
  },
  {
    id: "experience",
    label: "Experience",
    prompt: (name: string) => `What's the most impressive thing ${name} has built? Mention 1-2 projects max.`,
  },
  {
    id: "contact",
    label: "Contact",
    prompt: (name: string) => `Where can someone find or contact ${name}? List their socials directly.`,
  },
  {
    id: "help",
    label: "Can help with?",
    prompt: (name: string) => `What specific skills or problems can ${name} help with? Be direct.`,
  },
];

function PresetIcon({ id }: { id: string }) {
  if (id === "who") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (id === "experience") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  }
  if (id === "contact") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13c0 5 4 8 7 8s7-3 7-8V6l-7-4-7 4z" />
      <path d="M12 12l4-4" />
      <path d="M16 8h-3" />
      <path d="M16 8v3" />
    </svg>
  );
}

type Phase = "idle" | "loading" | "playing";

const ESTIMATED_MS = 2000;

function Waveform() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3 shrink-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full"
          style={{
            background: "#4a8ab8",
            animation: `wave 0.9s ease-in-out ${i * 0.1}s infinite alternate`,
            height: `${5 + i * 1.5}px`,
          }}
        />
      ))}
      <style>{`@keyframes wave{from{transform:scaleY(0.4)}to{transform:scaleY(1.4)}}`}</style>
    </span>
  );
}

export default function AIChat({ person }: AIChatProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [globalBusy, setGlobalBusy] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ownsLock = useRef(false); // true only for the instance that acquired the lock

  // Subscribe to the global lock so all instances re-render when it changes
  useEffect(() => {
    setGlobalBusy(aiLock.busy);
    return aiLock.subscribe(setGlobalBusy);
  }, []);

  // Drive smooth progress bar while loading
  useEffect(() => {
    if (phase !== "loading") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setProgress(0);
    startTimeRef.current = performance.now();
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min(85, 85 * (1 - Math.exp(-elapsed / 1200)));
      setProgress(p);
      if (p >= 85) { clearInterval(intervalRef.current!); intervalRef.current = null; }
    }, 80);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const releaseLock = useCallback(() => {
    if (ownsLock.current) { ownsLock.current = false; aiLock.release(); }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const reset = useCallback((releaseGlobal = true) => {
    stopAudio();
    setPhase("idle");
    setProgress(0);
    setReplyText("");
    if (releaseGlobal) releaseLock();
  }, [stopAudio, releaseLock]);

  const handlePreset = async (btn: (typeof PRESET_BUTTONS)[number]) => {
    // Hard block: reject if ANY instance is already busy
    if (aiLock.busy) return;

    // Acquire the global lock
    ownsLock.current = true;
    aiLock.acquire();
    setPhase("loading");
    setProgress(0);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: btn.prompt(person.name),
          systemContext: buildSystemContext(person),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const text: string = data.text ?? "";
      if (!text.trim()) { reset(); return; }

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setReplyText(text);

      if (data.audioBase64) {
        const blob = new Blob(
          [Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0))],
          { type: "audio/wav" }
        );
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplay = () => setPhase("playing");
        audio.onended = () => { URL.revokeObjectURL(url); reset(); };
        audio.onerror = () => { URL.revokeObjectURL(url); reset(); };
        await audio.play();
      } else {
        setPhase("playing");
        setTimeout(() => reset(), 6000);
      }
    } catch {
      reset();
    }
  };

  return (
    <div
      className="shrink-0 px-3 py-2"
      style={{
        background: "#c8d8e8",
        borderTop: "1px solid #a0b4c8",
        borderBottom: "1px solid #a0b4c8",
      }}
    >
      {phase === "loading" ? (
        /* ── Progress bar ─────────────────────────────────────────── */
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px]" style={{ color: "#6b8dad" }}>
              {progress >= 99 ? "Speaking…" : "Thinking…"}
            </span>
            {progress < 99 && (() => {
              const estElapsed = progress > 0
                ? -1200 * Math.log(Math.max(0.001, 1 - progress / 85))
                : 0;
              const secsLeft = Math.max(1, Math.round((ESTIMATED_MS - estElapsed) / 1000));
              return (
                <span className="text-[10px] font-medium" style={{ color: "#4a7a9a" }}>
                  ~{secsLeft}s
                </span>
              );
            })()}
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 5, background: "#a0b8cc" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#4a8ab8,#6cb0d8)",
                transition: progress >= 99 ? "width 0.3s ease-out" : "width 0.08s linear",
              }}
            />
          </div>
        </div>
      ) : phase === "playing" ? (
        /* ── Playing: show text + waveform ───────────────────────── */
        <div className="flex items-start gap-2">
          <Waveform />
          <p className="text-[11px] leading-snug" style={{ color: "#2a4a6a" }}>
            {renderMarkdown(replyText)}
          </p>
        </div>
      ) : (
        /* ── Button row ───────────────────────────────────────────── */
        <div className="flex gap-1.5">
          {PRESET_BUTTONS.map((btn) => {
            const disabled = globalBusy;
            return (
              <div key={btn.id} className="relative flex-1 group">
                <button
                  onClick={() => handlePreset(btn)}
                  disabled={disabled}
                  className="w-full min-h-11 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] transition-all duration-150"
                  style={{
                    background: disabled ? "#c4d4e4" : "#dce8f4",
                    border: "1px solid #a8bece",
                    color: disabled ? "#90a8bc" : "#2a4a6a",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                  title={btn.label}
                  aria-label={btn.label}
                >
                  <span aria-hidden="true" className="leading-none">
                    <PresetIcon id={btn.id} />
                  </span>
                  <span className="text-[10px] leading-none sm:hidden">{btn.label}</span>
                </button>
                {!disabled && (
                  /* Tooltip – only shown when not globally busy */
                  <div
                    className="absolute bottom-full left-1/2 mb-1.5 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                    style={{
                      transform: "translateX(-50%)",
                      background: "#2a4a6a",
                      color: "#e8f0f8",
                    }}
                  >
                    {btn.label}
                    <div
                      className="absolute top-full left-1/2"
                      style={{
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: "4px solid #2a4a6a",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
