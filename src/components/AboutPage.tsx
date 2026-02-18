"use client";

import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div
        className="rounded-2xl p-8"
        style={{
          background: "#c8d8e8",
          border: "2px solid #a0b4c8",
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ fontStyle: "italic", fontFamily: "Georgia, serif", color: "#2a4a6a" }}
        >
          About Vibefolio
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#3a5a7a" }}>
          Vibefolio is a collaborative portfolio platform where creators showcase their
          projects and connect with others. Click on any person&apos;s card to explore their
          current and past work.
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#3a5a7a" }}>
          Each portfolio window is draggable and resizable — arrange them however you
          like on your screen. Click on any project to expand it and see its links
          and description.
        </p>
        <div className="flex items-center gap-2 mt-6">
          <span className="text-xs" style={{ color: "#6b8dad" }}>
            Built with Next.js & Tailwind CSS
          </span>
          <span style={{ color: "#a0b4c8" }}>•</span>
          <span className="text-xs" style={{ color: "#6b8dad" }}>
            vibefolio.site
          </span>
        </div>
      </div>
    </div>
  );
}
