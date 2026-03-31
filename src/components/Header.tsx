"use client";

import React from "react";

interface HeaderProps {
  activeTab: "projects" | "about";
  onTabChange: (tab: "projects" | "about") => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({
  activeTab,
  onTabChange,
  searchQuery = "",
  onSearchChange,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "#c8d8e8", borderBottom: "2px solid #a0b4c8" }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-6 h-16">
        {/* Logo */}
        <h1
          className="text-xl font-bold tracking-wide select-none shrink-0"
          style={{
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            color: "#2a4a6a",
          }}
        >
          VIBEFOLIO
        </h1>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1">
          {(["projects", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: activeTab === tab ? "#ffffff" : "transparent",
                border: activeTab === tab ? "1.5px solid #8aa0b8" : "1.5px solid transparent",
                color: "#2a4a6a",
              }}
            >
              {tab === "projects" ? "Projects" : "About"}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        {activeTab === "projects" && onSearchChange && (
          <div className="relative" style={{ width: "240px" }}>
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "#ffffff",
                border: "1.5px solid #a0b4c8",
                color: "#2a4a6a",
              }}
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b8dad"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        )}
      </div>
    </header>
  );
}

