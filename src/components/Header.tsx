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
      </div>
    </header>
  );
}
