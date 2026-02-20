"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Person } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";

interface PersonCardProps {
  person: Person;
  initialX: number;
  initialY: number;
  zIndex: number;
  onFocus: () => void;
  isHidden?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function PersonCard({
  person,
  initialX,
  initialY,
  zIndex,
  onFocus,
  isHidden = false,
}: PersonCardProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    )
      return;
    onFocus();
    didDrag.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        didDrag.current = true;
      }
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleHeaderClick = () => {
    if (didDrag.current) return;
    setIsExpanded((prev) => !prev);
  };

  const projects =
    activeTab === "current" ? person.currentProjects : person.pastProjects;

  return (
    <div
      className="fixed rounded-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        zIndex,
        display: isHidden ? "none" : undefined,
        width: isExpanded ? 480 : "auto",
        minWidth: 220,
        background: "#dce6f0",
        border: "2px solid #8aa0b8",
        userSelect: isDragging ? "none" : "auto",
        boxShadow: isDragging
          ? "0 20px 60px rgba(0,0,0,0.25)"
          : isExpanded
          ? "0 8px 32px rgba(0,0,0,0.15)"
          : "0 4px 16px rgba(0,0,0,0.1)",
        transition: isDragging
          ? "none"
          : "width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
      }}
      onMouseDown={onFocus}
    >
      {/* Header / Drag Handle */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-move select-none"
        style={{
          background: "#c0d0e0",
          borderBottom: isExpanded ? "1.5px solid #a0b4c8" : "none",
        }}
        onMouseDown={handleMouseDownDrag}
        onClick={handleHeaderClick}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: "#ffffff",
            border: "1.5px solid #8aa0b8",
            color: "#4a6a8a",
          }}
        >
          {person.photo ? (
            <Image
              src={person.photo}
              alt={person.name}
              width={36}
              height={36}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(person.name)
          )}
        </div>

        {/* Name */}
        <span
          className="font-semibold text-sm whitespace-nowrap"
          style={{ color: "#2a4a6a" }}
        >
          {person.name}
        </span>

        {/* Expand arrow */}
        <svg
          className="ml-auto shrink-0 transition-transform duration-300"
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            color: "#6b8dad",
          }}
          width="16"
          height="16"
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

      {/* Expanded content – animates open/close */}
      <div
        style={{
          maxHeight: isExpanded ? "600px" : "0px",
          opacity: isExpanded ? 1 : 0,
          overflow: "hidden",
          transition: isDragging
            ? "none"
            : "max-height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
        }}
      >
        {/* Profile & Socials toggle */}
        <button
          onClick={() => setProfileExpanded((p) => !p)}
          className="w-full px-5 py-2.5 flex items-center justify-between transition-colors duration-200"
          style={{
            background: profileExpanded ? "#c8d8e8" : "#d4e0ec",
            borderBottom: "1px solid #b8c8d8",
          }}
        >
          <span className="text-sm font-medium" style={{ color: "#4a6a8a" }}>
            Profile &amp; Socials
          </span>
          <svg
            className="transition-transform duration-300"
            style={{
              transform: profileExpanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "#6b8dad",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Bio & Socials expandable */}
        <div
          style={{
            maxHeight: profileExpanded ? "200px" : "0px",
            opacity: profileExpanded ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease, opacity 0.2s ease",
          }}
        >
          <div
            className="px-5 py-3"
            style={{
              background: "#c8d8e8",
              borderBottom: "1px solid #b8c8d8",
            }}
          >
            <p className="text-sm mb-3" style={{ color: "#3a5a7a" }}>
              {person.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {person.socials.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-transform hover:scale-105"
                  style={{
                    background: "#e8eff5",
                    color: "#2a4a6a",
                    border: "1px solid #a0b4c8",
                  }}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Project tabs */}
        <div
          className="flex px-4 pt-3 pb-0 gap-1"
          style={{ background: "#dce6f0" }}
        >
          {(["current", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: activeTab === tab ? "#ffffff" : "transparent",
                border:
                  activeTab === tab
                    ? "1.5px solid #a0b4c8"
                    : "1.5px solid transparent",
                borderBottom:
                  activeTab === tab
                    ? "1.5px solid #ffffff"
                    : "1.5px solid transparent",
                color: activeTab === tab ? "#2a4a6a" : "#6b8dad",
                marginBottom: "-1.5px",
                position: "relative",
                zIndex: activeTab === tab ? 1 : 0,
              }}
            >
              {tab === "current" ? "Current Projects" : "Old Projects"}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1.5px", background: "#a0b4c8" }} />

        {/* Projects list */}
        <div
          className="overflow-y-auto p-4 flex flex-col gap-3"
          style={{ background: "#dce6f0", maxHeight: "340px" }}
        >
          {projects.length === 0 ? (
            <div
              className="flex items-center justify-center py-8 text-sm"
              style={{ color: "#8aa0b8" }}
            >
              No {activeTab === "current" ? "current" : "past"} projects
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isCurrent={activeTab === "current"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
