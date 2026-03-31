"use client";

import React, { useState, useRef } from "react";
import { Person } from "@/lib/types";

interface AIChatProps {
  person: Person;
}

/** Build a concise system prompt from the person's portfolio data */
function buildSystemContext(person: Person): string {
  const projects = [
    ...person.currentProjects.map((p) => `${p.name} (current): ${p.description}`),
    ...person.pastProjects.map((p) => `${p.name} (past): ${p.description}`),
  ].join("; ");

  const socials = person.socials.map((s) => `${s.label}: ${s.url}`).join(", ");

  return `You are a hype-person AI for ${person.name}'s portfolio. Answer in 2-3 short spoken sentences max. Be warm and punchy. Only use facts below.
Bio: ${person.bio}
Projects: ${projects}
Contact: ${socials}`.trim();
}

/** Waveform animation shown while audio is playing */
function Waveform() {
  return (
    <span className="inline-flex items-end gap-[3px] h-4 ml-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: "#4a8ab8",
            animation: `wave 0.9s ease-in-out ${i * 0.1}s infinite alternate`,
            height: `${8 + i * 2}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.4); }
        }
      `}</style>
    </span>
  );
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
    label: "Their experience",
    icon: "💼",
    prompt: (name: string) => `What has ${name} built? Summarize their projects briefly.`,
  },
  {
    id: "contact",
    label: "Contact info",
    icon: "📬",
    prompt: (name: string) => `How can someone reach ${name}? Give their socials.`,
  },
  {
    id: "help",
    label: "How can they help?",
    icon: "🚀",
    prompt: (name: string) => `What can ${name} help with? What value do they bring?`,
  },
];

export default function AIChat({ person }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const firstName = person.name.split(" ")[0];

  const handlePreset = async (btn: (typeof PRESET_BUTTONS)[number]) => {
    if (loading) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlaying(false);
    setActiveId(btn.id);
    setLoading(true);

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
        const bytes = Uint8Array.from(atob(data.audioBase64), (c) =>
          c.charCodeAt(0)
        );
        const blob = new Blob([bytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = url;
        audioRef.current.onplay = () => setPlaying(true);
        audioRef.current.onended = () => {
          setPlaying(false);
          URL.revokeObjectURL(url);
        };
        audioRef.current.onerror = () => {
          setPlaying(false);
          URL.revokeObjectURL(url);
        };
        audioRef.current.play().catch(() => setPlaying(false));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Toggle button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-2.5 flex items-center gap-2 text-xs font-semibold transition-colors duration-200 shrink-0"
        style={{
          background: open ? "#b8ccd8" : "#c4d4e4",
          borderTop: "1px solid #a0b4c8",
          borderBottom: open ? "none" : "1px solid #a0b4c8",
          color: "#2a4a6a",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ flexShrink: 0 }}
        >
          <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.9 2.7L8.6 20l-2.7.9L5 23.6l-.9-2.7L1.4 20l2.7-.9L5 16zM19 16l.9 2.7 2.7.9-2.7.9L19 23.6l-.9-2.7-2.7-.9 2.7-.9L19 16z" />
        </svg>
        Ask AI about {firstName}
        {playing && <Waveform />}
        <svg
          className="ml-auto transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Button panel ──────────────────────────────────────────── */}
      <div
        className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "180px" : "0px",
          opacity: open ? 1 : 0,
          background: "#d0dcea",
          borderBottom: open ? "1px solid #a0b4c8" : "none",
        }}
      >
        <div className="px-3 py-3 flex flex-col gap-2">
          {PRESET_BUTTONS.map((btn) => {
            const isActive = activeId === btn.id;
            const isThisLoading = isActive && loading;
            const isThisPlaying = isActive && playing;

            return (
              <button
                key={btn.id}
                onClick={() => handlePreset(btn)}
                disabled={loading}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all duration-150"
                style={{
                  background: isActive ? "#3a7ab8" : "#e4edf5",
                  color: isActive ? "#fff" : "#2a4a6a",
                  border: isActive ? "1.5px solid #2a6aaa" : "1.5px solid #b4c8dc",
                  opacity: loading && !isActive ? 0.5 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <span style={{ fontSize: "13px" }}>{btn.icon}</span>
                <span className="flex-1">{btn.label}</span>
                {isThisLoading && (
                  <span className="text-[10px] opacity-70">Generating…</span>
                )}
                {isThisPlaying && <Waveform />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
