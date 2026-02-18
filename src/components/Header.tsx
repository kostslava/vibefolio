"use client";

import React from "react";

interface HeaderProps {
  activeTab: "projects" | "about";
  onTabChange: (tab: "projects" | "about") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 mx-4 mt-4 rounded-xl"
      style={{
        background: "#c8d8e8",
        border: "2px solid #a0b4c8",
      }}
    >
      <div className="flex items-center gap-6">
        <h1
          className="text-xl font-bold tracking-wide"
          style={{ fontStyle: "italic", fontFamily: "Georgia, serif" }}
        >
          VIBEFOLIO
        </h1>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange("projects")}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: activeTab === "projects" ? "#ffffff" : "transparent",
              border:
                activeTab === "projects"
                  ? "1.5px solid #8aa0b8"
                  : "1.5px solid transparent",
            }}
          >
            Projects
          </button>
          <button
            onClick={() => onTabChange("about")}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: activeTab === "about" ? "#ffffff" : "transparent",
              border:
                activeTab === "about"
                  ? "1.5px solid #8aa0b8"
                  : "1.5px solid transparent",
            }}
          >
            About
          </button>
        </nav>
      </div>
      <button
        className="p-2 rounded-lg transition-colors duration-200 cursor-pointer"
        style={{ color: "#4a6a8a" }}
        title="Settings"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </header>
  );
}
