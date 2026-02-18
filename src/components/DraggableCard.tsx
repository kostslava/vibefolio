"use client";

import React, { useState, useRef, useEffect } from "react";
import { Person } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface DraggableCardProps {
  person: Person;
  initialX: number;
  initialY: number;
  index: number;
  onDragStart: () => void;
  onDragEnd: () => void;
  zIndex: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function DraggableCard({
  person,
  initialX,
  initialY,
  index,
  onDragStart,
  onDragEnd,
  zIndex,
}: DraggableCardProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [profileExpanded, setProfileExpanded] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return; // Don't drag when expanded
    if ((e.target as HTMLElement).closest("button")) return;
    
    onDragStart();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onDragEnd]);

  const handleCardClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  const colors = [
    { bg: "#ffd6e8", border: "#ff6b9d", shadow: "#ff4d88" },
    { bg: "#d6f0ff", border: "#6b9dff", shadow: "#4d88ff" },
    { bg: "#fff4d6", border: "#ffa56b", shadow: "#ff8c4d" },
    { bg: "#e6d6ff", border: "#9d6bff", shadow: "#884dff" },
    { bg: "#d6ffe6", border: "#6bff9d", shadow: "#4dff88" },
  ];
  const color = colors[index % colors.length];

  const projects =
    activeTab === "current" ? person.currentProjects : person.pastProjects;

  return (
    <div
      ref={cardRef}
      className="fixed select-none crayon-texture"
      style={{
        left: isExpanded ? "50%" : position.x,
        top: isExpanded ? "50%" : position.y,
        transform: isExpanded ? "translate(-50%, -50%)" : "none",
        width: isExpanded ? "min(600px, 90vw)" : "200px",
        height: isExpanded ? "min(700px, 85vh)" : "120px",
        zIndex: isDragging ? 9999 : isExpanded ? 9998 : zIndex,
        cursor: isExpanded ? "default" : isDragging ? "grabbing" : "grab",
        transition: isExpanded || isDragging ? "none" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animationDelay: `${index * 0.1}s`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`w-full h-full sketch-border ${!isExpanded && "drop-in"}`}
        style={{
          background: color.bg,
          borderColor: color.border,
          boxShadow: isDragging
            ? `8px 8px 0 ${color.shadow}`
            : `4px 4px 0 ${color.shadow}`,
          transform: isDragging ? "rotate(5deg) scale(1.05)" : "rotate(0deg)",
          transition: "all 0.2s ease",
          overflow: isExpanded ? "hidden" : "visible",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={handleCardClick}
      >
        {!isExpanded ? (
          // Compact card view
          <div className="flex items-center gap-4 p-4 h-full">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shrink-0 sketch-border"
              style={{
                background: "#ffffff",
                borderColor: color.border,
                color: color.shadow,
              }}
            >
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(person.name)
              )}
            </div>
            <span
              className="text-base font-bold"
              style={{
                color: "#2a2a2a",
                fontFamily: "'Comic Sans MS', cursive",
              }}
            >
              {person.name}
            </span>
          </div>
        ) : (
          // Expanded portfolio view
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                borderBottom: `3px solid ${color.border}`,
                background: color.bg,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 sketch-border"
                  style={{
                    background: "#ffffff",
                    borderColor: color.border,
                    color: color.shadow,
                  }}
                >
                  {getInitials(person.name)}
                </div>
                <h3
                  className="font-black text-xl"
                  style={{
                    color: "#2a2a2a",
                    fontFamily: "'Comic Sans MS', cursive",
                  }}
                >
                  {person.name}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 sketch-border"
                style={{
                  background: "#ff6b9d",
                  borderColor: "#2a2a2a",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                ×
              </button>
            </div>

            {/* Profile toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProfileExpanded(!profileExpanded);
              }}
              className="w-full px-5 py-3 flex items-center justify-between transition-all shrink-0"
              style={{
                background: profileExpanded ? "#fff" : color.bg,
                borderBottom: `2px solid ${color.border}`,
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: "bold",
              }}
            >
              <span style={{ color: "#2a2a2a" }}>
                {profileExpanded ? "🙈" : "🤓"} Profile & Socials
              </span>
              <span style={{ fontSize: "20px" }}>
                {profileExpanded ? "▲" : "▼"}
              </span>
            </button>

            {/* Profile section */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out shrink-0"
              style={{
                maxHeight: profileExpanded ? "300px" : "0px",
                opacity: profileExpanded ? 1 : 0,
                background: "#fff",
                borderBottom: profileExpanded ? `2px solid ${color.border}` : "none",
              }}
            >
              <div className="px-5 py-4">
                <p
                  className="text-sm mb-3 leading-relaxed"
                  style={{
                    color: "#4a4a4a",
                    fontFamily: "'Comic Sans MS', cursive",
                  }}
                >
                  {person.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {person.socials.map((social, i) => (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-110 sketch-border"
                      style={{
                        background: color.bg,
                        color: "#2a2a2a",
                        borderColor: color.border,
                        fontFamily: "'Comic Sans MS', cursive",
                      }}
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="flex px-4 pt-3 gap-2 shrink-0"
              style={{ background: color.bg }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("current");
                }}
                className="px-4 py-2 rounded-t-lg text-sm font-bold transition-all sketch-border"
                style={{
                  background: activeTab === "current" ? "#fff" : "transparent",
                  borderColor: activeTab === "current" ? color.border : "transparent",
                  borderBottom: "none",
                  color: "#2a2a2a",
                  fontFamily: "'Comic Sans MS', cursive",
                  marginBottom: "-2px",
                }}
              >
                ⚡ Current
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("past");
                }}
                className="px-4 py-2 rounded-t-lg text-sm font-bold transition-all sketch-border"
                style={{
                  background: activeTab === "past" ? "#fff" : "transparent",
                  borderColor: activeTab === "past" ? color.border : "transparent",
                  borderBottom: "none",
                  color: "#2a2a2a",
                  fontFamily: "'Comic Sans MS', cursive",
                  marginBottom: "-2px",
                }}
              >
                📚 Past
              </button>
            </div>

            {/* Projects list */}
            <div
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
              style={{ background: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              {projects.length === 0 ? (
                <div
                  className="flex-1 flex items-center justify-center text-sm"
                  style={{
                    color: "#999",
                    fontFamily: "'Comic Sans MS', cursive",
                  }}
                >
                  No {activeTab === "current" ? "current" : "past"} projects yet!
                </div>
              ) : (
                projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isCurrent={activeTab === "current"}
                    color={color}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
