"use client";

import React, { useState, useRef, useEffect } from "react";
import { Person } from "@/lib/types";

interface AIChatProps {
  person: Person;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

/** Build a rich system prompt from the person's portfolio data */
function buildSystemContext(person: Person): string {
  const currentList =
    person.currentProjects.length > 0
      ? person.currentProjects
          .map((p) => `  • ${p.name} (started ${p.dateStarted}): ${p.description}`)
          .join("\n")
      : "  None listed";

  const pastList =
    person.pastProjects.length > 0
      ? person.pastProjects
          .map(
            (p) =>
              `  • ${p.name} (${p.dateStarted}–${p.dateEnded ?? "present"}): ${p.description}`
          )
          .join("\n")
      : "  None listed";

  return `You are a friendly AI assistant embedded inside ${person.name}'s developer portfolio. \
Answer questions about ${person.name} based only on the information below. \
Be concise, warm, and conversational — as if you're their hype person. \
Do not make up details not supported by the data. \
If asked about skills, infer them naturally from the bio and projects.

=== ${person.name.toUpperCase()} ===
Bio: ${person.bio}

Current projects:
${currentList}

Past projects:
${pastList}`.trim();
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

export default function AIChat({ person }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const msgIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");

    const userMsg: Message = {
      id: ++msgIdRef.current,
      role: "user",
      text: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          systemContext: buildSystemContext(person),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: ++msgIdRef.current,
        role: "assistant",
        text: data.text ?? "🔊",
      };
      setMessages((prev) => [...prev, aiMsg]);

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
    } catch (err: unknown) {
      const errMsg: Message = {
        id: ++msgIdRef.current,
        role: "assistant",
        text: err instanceof Error ? `Error: ${err.message}` : "Something went wrong.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const firstName = person.name.split(" ")[0];

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
        {/* Sparkles icon */}
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

      {/* ── Chat drawer ───────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "260px" : "0px",
          opacity: open ? 1 : 0,
          background: "#d0dcea",
          borderBottom: open ? "1px solid #a0b4c8" : "none",
        }}
      >
        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
          style={{ minHeight: 0, maxHeight: 190 }}
        >
          {messages.length === 0 && !loading && (
            <p
              className="text-xs text-center py-2"
              style={{ color: "#7a94a8" }}
            >
              Ask anything about {person.name} ✦
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className="text-xs rounded-xl px-3 py-2 max-w-[88%] leading-relaxed"
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "#3a7ab8" : "#e8f0f8",
                color: m.role === "user" ? "#fff" : "#2a4a6a",
                border: m.role === "assistant" ? "1px solid #b4c8dc" : "none",
              }}
            >
              {m.text}
            </div>
          ))}

          {loading && (
            <div
              className="text-xs rounded-xl px-3 py-2 self-start"
              style={{
                background: "#e8f0f8",
                color: "#6b8dad",
                border: "1px solid #b4c8dc",
              }}
            >
              {playing ? (
                <>
                  Speaking
                  <Waveform />
                </>
              ) : (
                "Thinking…"
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          className="flex gap-2 px-3 pb-3 pt-1 shrink-0"
          style={{ borderTop: "1px solid #b4c4d4" }}
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-xs rounded-xl px-3 py-2 outline-none transition-shadow duration-150"
            style={{
              background: "#eef4f8",
              border: "1.5px solid #b4c8dc",
              color: "#2a4a6a",
            }}
            placeholder={`What is ${firstName} good at?`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150"
            style={{
              background:
                loading || !input.trim() ? "#c0d0e0" : "#3a7ab8",
              color: loading || !input.trim() ? "#8aa0b8" : "#fff",
              flexShrink: 0,
            }}
            title="Send"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
