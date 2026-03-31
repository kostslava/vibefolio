"use client";

import React, { useState } from "react";
import { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  isCurrent: boolean;
  color: {
    bg: string;
    border: string;
    shadow: string;
  };
}

export default function ProjectCard({ project, isCurrent, color }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer sketch-border crayon-texture"
      style={{
        background: color.bg,
        borderColor: color.border,
        boxShadow: expanded ? `3px 3px 0 ${color.shadow}` : `2px 2px 0 ${color.shadow}`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Project header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <h4
            className="font-black text-base"
            style={{
              color: "#2a2a2a",
              fontFamily: "'Comic Sans MS', cursive",
            }}
          >
            {project.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-bold"
              style={{
                color: color.shadow,
                fontFamily: "'Comic Sans MS', cursive",
              }}
            >
              {project.dateStarted}
            </span>
            {!isCurrent && project.dateEnded && (
              <>
                <span style={{ color: color.shadow }}>→</span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: color.shadow,
                    fontFamily: "'Comic Sans MS', cursive",
                  }}
                >
                  {project.dateEnded}
                </span>
              </>
            )}
            {isCurrent && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold sketch-border"
                style={{
                  background: "#6bff9d",
                  color: "#1a6a3a",
                  borderColor: "#2a2a2a",
                  fontFamily: "'Comic Sans MS', cursive",
                }}
              >
                ⚡ LIVE
              </span>
            )}
          </div>
        </div>
        <div
          className="transition-transform duration-300 shrink-0 ml-2 font-bold text-xl"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            color: color.shadow,
          }}
        >
          {expanded ? "▲" : "▼"}
        </div>
      </div>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? "400px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div
          className="px-4 pb-4 pt-2"
          style={{ borderTop: `2px solid ${color.border}` }}
        >
          <p
            className="text-sm mb-3 leading-relaxed font-medium"
            style={{
              color: "#4a4a4a",
              fontFamily: "'Comic Sans MS', cursive",
            }}
          >
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-110 hover:rotate-2 sketch-border"
                style={{
                  background: "#fff",
                  color: "#2a2a2a",
                  borderColor: color.border,
                  fontFamily: "'Comic Sans MS', cursive",
                  boxShadow: `2px 2px 0 ${color.shadow}`,
                }}
              >
                🔗 {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
