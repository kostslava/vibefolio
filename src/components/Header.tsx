"use client";

import React from "react";

interface HeaderProps {
  activeTab: "projects" | "about";
  onTabChange: (tab: "projects" | "about") => void;
}

export default function Header({
  activeTab,
  onTabChange,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "#c8d8e8", borderBottom: "2px solid #a0b4c8" }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-2 flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-6">
        {/* Logo */}
        <h1
          className="w-full sm:w-auto text-center sm:text-left text-[clamp(1rem,6vw,1.25rem)] font-bold tracking-[0.05em] select-none leading-tight"
          style={{
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            color: "#2a4a6a",
          }}
        >
          VIBEFOLIO
        </h1>

        {/* Nav tabs */}
        <nav className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-1" aria-label="Primary">
          {(["projects", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="px-3 sm:px-4 min-h-11 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: activeTab === tab ? "#ffffff" : "transparent",
                border: activeTab === tab ? "1.5px solid #8aa0b8" : "1.5px solid transparent",
                color: "#2a4a6a",
              }}
              aria-pressed={activeTab === tab}
            >
              {tab === "projects" ? "Projects" : "About"}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
