"use client";

import React from "react";

interface HeaderProps {
  activeTab: "projects" | "about";
  onTabChange: (tab: "projects" | "about") => void;
  isAdmin?: boolean;
  onAdminClick?: () => void;
  onAdminLogout?: () => void;
}

export default function Header({
  activeTab,
  onTabChange,
  isAdmin = false,
  onAdminClick,
  onAdminLogout,
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

        {/* Admin */}
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "#3a7ab8", color: "#fff", border: "1.5px solid #2a6aa8" }}>
              Admin
            </span>
            <button
              onClick={onAdminLogout}
              className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-white/40"
              style={{ color: "#4a6a8a", border: "1px solid #a0b8cc" }}
            >
              log out
            </button>
          </div>
        ) : (
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/50 active:scale-95"
            style={{ color: "#3a6a8a", border: "1.5px solid #8aaac0", background: "rgba(255,255,255,0.25)" }}
            title="Admin login"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Admin
          </button>
        )}
      </div>
    </header>
  );
}

