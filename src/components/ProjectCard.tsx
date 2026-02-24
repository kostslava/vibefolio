"use client";

import React, { useState } from "react";
import { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  isCurrent: boolean;
  onOpenProject?: (url: string, title: string) => void;
}

export default function ProjectCard({ project, isCurrent, onOpenProject }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
      style={{
        background: "#e8eff5",
        border: "1.5px solid #b8c8d8",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Project header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-base" style={{ color: "#2a4a6a" }}>
            {project.name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: "#6b8dad" }}>
              {project.dateStarted}
            </span>
            {!isCurrent && project.dateEnded && (
              <>
                <span className="text-xs" style={{ color: "#6b8dad" }}>
                  —
                </span>
                <span className="text-xs" style={{ color: "#6b8dad" }}>
                  {project.dateEnded}
                </span>
              </>
            )}
            {isCurrent && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#b8e6c8", color: "#2a6a3a" }}
              >
                Active
              </span>
            )}
          </div>
        </div>
        <svg
          className="transition-transform duration-300 shrink-0 ml-2"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            color: "#6b8dad",
          }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? "320px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "320px" }}
          onClick={(e) => e.stopPropagation()}
        >
        <div
          className="px-5 pb-4 pt-0"
          style={{ borderTop: "1px solid #c8d8e8" }}
        >
          <p
            className="text-sm mb-3 leading-relaxed"
            style={{ color: "#4a6a8a" }}
          >
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.links.map((link, i) => (
              onOpenProject ? (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProject(link.url, `${project.name} — ${link.label}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{
                    background: "#c8d8e8",
                    color: "#2a4a6a",
                    border: "1px solid #a0b4c8",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  {link.label}
                </button>
              ) : (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: "#c8d8e8",
                    color: "#2a4a6a",
                    border: "1px solid #a0b4c8",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  {link.label}
                </a>
              )
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
