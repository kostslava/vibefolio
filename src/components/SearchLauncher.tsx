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
  const [phase, setPhase] = useState<"idle" | "searching" | "selected">("idle");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Person | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = people.filter(
    (p) =>
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.bio.toLowerCase().includes(query.toLowerCase())
  );

  const openSearch = () => {
    setPhase("searching");
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selectPerson = (person: Person) => {
    setSelected(person);
    setPhase("selected");
    setQuery("");
  };

  const handleOpen = () => {
    if (selected) {
      onOpenPortfolio(selected);
    }
  };

  // Escape closes back to idle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "searching") setPhase("idle");
        if (phase === "selected") setPhase("idle");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[50]"
      style={{ width: LAUNCHER_WIDTH }}
    >
      {/* Idle state */}
      {phase === "idle" && (
        <button
          onClick={openSearch}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{
            background: "#dce6f0",
            border: "2px solid #a0b4c8",
            color: "#8aa0b8",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-sm font-medium">Find a portfolio...</span>
        </button>
      )}

      {/* Searching state */}
      {phase === "searching" && (
        <div
          className="w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "#dce6f0",
            border: "2px solid #8aa0b8",
          }}
        >
          {/* Search input row */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1.5px solid #b8c8d8" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8aa0b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            <button
              onClick={() => setPhase("idle")}
              className="text-xs cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: "#8aa0b8" }}
            >
              esc
            </button>
          </div>

          {/* Results list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div
                className="px-5 py-4 text-sm"
                style={{ color: "#8aa0b8" }}
              >
                No people found
              </div>
            ) : (
              filtered.map((person) => (
                <button
                  key={person.id}
                  onClick={() => selectPerson(person)}
                  className="w-full flex items-center gap-3 px-5 py-3 transition-colors duration-150 cursor-pointer text-left"
                  style={{ borderBottom: "1px solid #c8d8e8" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#c8d8e8")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "#e8eff5",
                      border: "1.5px solid #8aa0b8",
                      color: "#4a6a8a",
                    }}
                  >
                    {getInitials(person.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: "#2a4a6a" }}
                    >
                      {person.name}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "#6b8dad" }}
                    >
                      {person.bio}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected state */}
      {phase === "selected" && selected && (
        <div
          className="w-full rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: "#dce6f0",
            border: "2px solid #8aa0b8",
          }}
        >
          {/* Person row — click to re-search */}
          <button
            onClick={openSearch}
            className="w-full flex items-center gap-3 px-5 py-4 transition-colors duration-150 cursor-pointer"
            style={{ borderBottom: "1.5px solid #b8c8d8" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#c8d8e8")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "#e8eff5",
                border: "1.5px solid #8aa0b8",
                color: "#4a6a8a",
              }}
            >
              {getInitials(selected.name)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "#2a4a6a" }}
              >
                {selected.name}
              </div>
              <div className="text-xs" style={{ color: "#8aa0b8" }}>
                Click to search again
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8aa0b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Open Portfolio button */}
          <div className="px-4 py-3">
            <button
              onClick={handleOpen}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95"
              style={{
                background: "#4a7a9a",
                color: "#ffffff",
                border: "none",
              }}
            >
              Open Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
