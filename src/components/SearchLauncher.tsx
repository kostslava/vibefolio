"use client";

import React, { useState, useRef, useEffect } from "react";
import { Person } from "@/lib/types";

interface SearchLauncherProps {
  people: Person[];
  onOpenPortfolio: (person: Person) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const LAUNCHER_WIDTH = 340;

export default function SearchLauncher({ people, onOpenPortfolio }: SearchLauncherProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = people.filter(
    (p) =>
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.bio.toLowerCase().includes(query.toLowerCase())
  );

  const openSearch = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const openPerson = (person: Person) => {
    onOpenPortfolio(person);
    setOpen(false);
    setQuery("");
  };

  // Keyboard: Escape closes, Enter opens when 1 result
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
      if (e.key === "Enter" && filtered.length === 1) openPerson(filtered[0]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered]);

  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[50]"
      style={{ width: LAUNCHER_WIDTH }}
    >
      {/* Idle state */}
      {!open && (
        <button
          onClick={openSearch}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{
            background: "#dce6f0",
            border: "2px solid #a0b4c8",
            color: "#8aa0b8",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-sm font-medium">Find a portfolio...</span>
        </button>
      )}

      {/* Search open */}
      {open && (
        <div
          className="w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "#dce6f0", border: "2px solid #8aa0b8" }}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1.5px solid #b8c8d8" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aa0b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or keywords..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "#2a4a6a" }}
            />
            {filtered.length === 1 && (
              <span className="text-[10px] font-medium" style={{ color: "#4a7a9a" }}>
                ↵ open
              </span>
            )}
            <button
              onClick={() => { setOpen(false); setQuery(""); }}
              className="text-xs cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: "#8aa0b8" }}
            >
              esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-5 py-4 text-sm" style={{ color: "#8aa0b8" }}>
                No people found
              </div>
            ) : (
              filtered.map((person) => (
                <button
                  key={person.id}
                  onClick={() => openPerson(person)}
                  className="w-full flex items-center gap-3 px-5 py-3 transition-colors duration-150 cursor-pointer text-left"
                  style={{ borderBottom: "1px solid #c8d8e8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#c8d8e8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "#e8eff5", border: "1.5px solid #8aa0b8", color: "#4a6a8a" }}
                  >
                    {getInitials(person.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: "#2a4a6a" }}>
                      {person.name}
                    </div>
                    <div className="text-xs truncate" style={{ color: "#6b8dad" }}>
                      {person.bio}
                    </div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8aa0b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

