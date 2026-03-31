"use client";

import React, { useState, useRef, useEffect } from "react";
import { Person } from "@/lib/types";

interface AIChatProps {
  person: Person;
}

function buildSystemContext(person: Person): string {
  const projects = [
    ...person.currentProjects.map((p) => `${p.name} (current): ${p.description}`),
    ...person.pastProjects.map((p) => `${p.name} (past): ${p.description}`),
  ].join("; ");
  const socials = person.socials.map((s) => `${s.label}: ${s.url}`).join(", ");
  return `You are a hype-person AI for ${person.name}'s portfolio. Answer in 2-3 short spoken sentences max. Be warm and punchy. Only use facts below.\nBio: ${person.bio}\nProjects: ${projects}\nContact: ${socials}`.trim();
}

const PRESET_BUTTONS = [
  {
    id: "who",
    label: "Who is this?",
    icon: "👤",
    prompt: (name: string) => `Give a quick punchy intro of who ${name} is.`,
  },
  {
    id: "experience",
    label: "Experience",
    icon: "💼",
    prompt: (name: string) => `What has ${name} built? Summarize their projects briefly.`,
  },
  {
    id: "contact",
    label: "Contact",
    icon: "📬",
    prompt: (name: string) => `How can someone reach ${name}? Give their socials.`,
  },
  {
    id: "help",
    label: "Can help with?",
    icon: "🚀",
    prompt: (name: string) => `What can ${name} help with? What value do they bring?`,
  },
];

type Phase = "idle" | "loading" | "playing";

function Waveform() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full"
          style={{
            background: "#7a94a8",
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Drive fake progress bar while loading
  useEffect(() => {
    if (phase !== "loading") {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    setProgress(0);
    startTimeRef.current = performance.now();
    const FAKE_DURATION = 11000; // reach ~90% in 11s

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min(90, (elapsed / FAKE_DURATION) * 90);
      setProgress(p);
      if (p < 90) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [phase]);

  const handlePreset = async (btn: (typeof PRESET_BUTTONS)[number]) => {
    if (phase !== "idle") return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPhase("loading");

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

      if (data.audioBase64) {
        // Snap progress to 100% before playing
        if (animRef.current) cancelAnimationFrame(animRef.current);
        setProgress(100);

        await new Promise((r) => setTimeout(r, 250));

        const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = url;
        audioRef.current.onplay = () => setPhase("playing");
        audioRef.current.onended = () => {
          setPhase("idle");
          URL.revokeObjectURL(url);
        };
        audioRef.current.onerror = () => {
          setPhase("idle");
          URL.revokeObjectURL(url);
        };
        audioRef.current.play().catch(() => setPhase("idle"));
      } else {
        setPhase("idle");
      }
    } catch {
      setPhase("idle");
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
        <div className="flex flex-col gap-1">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 6, background: "#a0b8cc" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#4a8ab8,#6cb0d8)",
                transition: progress === 100
                  ? "width 0.25s ease-out"
                  : "width 0.1s linear",
              }}
            />
          </div>
          <p className="text-[10px] text-center" style={{ color: "#6b8dad" }}>
            Generating audio…
          </p>
        </div>
      ) : (
        /* ── Button row ───────────────────────────────────────────── */
        <div className="flex gap-1.5">
          {PRESET_BUTTONS.map((btn) => (
            <div key={btn.id} className="relative flex-1 group">
              <button
                onClick={() => handlePreset(btn)}
                disabled={phase !== "idle"}
                className="w-full flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] transition-all duration-150"
                style={{
                  background: phase === "idle" ? "#dce8f4" : "#c8d4e0",
                  border: "1px solid #a8bece",
                  color: phase === "idle" ? "#2a4a6a" : "#8aa0b8",
                  opacity: phase === "playing" ? 0.55 : 1,
                  cursor: phase !== "idle" ? "not-allowed" : "pointer",
                }}
                title={btn.label}
              >
                <span style={{ fontSize: 14 }}>{btn.icon}</span>
              </button>
              {/* Tooltip */}
              {phase === "idle" && (
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
          ))}
          {phase === "playing" && (
            <div className="flex items-center px-1">
              <Waveform />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

