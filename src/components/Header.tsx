"use client";

import React, { useState, useRef, useEffect } from "react";

interface HeaderProps {
  activeTab: "projects" | "about";
  onTabChange: (tab: "projects" | "about") => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface DraggableButton {
  id: string;
  label: string;
  type: "tab" | "search" | "logo" | "settings";
  x: number;
  y: number;
  value?: string;
}

export default function Header({ 
  activeTab, 
  onTabChange, 
  searchQuery = "", 
  onSearchChange 
}: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [elements, setElements] = useState<DraggableButton[]>([
    { id: "logo", label: "VIBEFOLIO", type: "logo", x: 20, y: 12 },
    { id: "projects", label: "Projects", type: "tab", x: 200, y: 10, value: "projects" },
    { id: "about", label: "About", type: "tab", x: 300, y: 10, value: "about" },
    { id: "search", label: "", type: "search", x: 450, y: 8 },
    { id: "settings", label: "⚙", type: "settings", x: 750, y: 8 },
  ]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    
    const element = elements.find((el) => el.id === id);
    if (!element) return;

    setDragging(id);
    setOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!headerRef.current) return;
      const headerRect = headerRef.current.getBoundingClientRect();
      
      setElements((prev) =>
        prev.map((el) =>
          el.id === dragging
            ? {
                ...el,
                x: Math.max(0, Math.min(headerRect.width - 100, e.clientX - headerRect.left - offset.x)),
                y: Math.max(0, Math.min(headerRect.height - 40, e.clientY - headerRect.top - offset.y)),
              }
            : el
        )
      );
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  const handleTabClick = (value: string) => {
    onTabChange(value as "projects" | "about");
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 px-6 py-3 mx-4 mt-4 rounded-xl relative"
      style={{
        background: "#c8d8e8",
        border: "2px solid #a0b4c8",
        minHeight: "70px",
      }}
    >
      {/* Hint text */}
      <div className="absolute top-1 right-2 text-xs opacity-50" style={{ color: "#6b8dad" }}>
        Drag to rearrange
      </div>

      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute transition-shadow duration-200"
          style={{
            left: element.x,
            top: element.y,
            cursor: dragging === element.id ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          {element.type === "logo" && (
            <h1
              className="text-xl font-bold tracking-wide select-none"
              style={{ 
                fontStyle: "italic", 
                fontFamily: "Georgia, serif",
                color: "#2a4a6a",
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {element.label}
            </h1>
          )}

          {element.type === "tab" && (
            <button
              onClick={() => handleTabClick(element.value!)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === element.value ? "#ffffff" : "transparent",
                border:
                  activeTab === element.value
                    ? "1.5px solid #8aa0b8"
                    : "1.5px solid transparent",
                color: "#2a4a6a",
                pointerEvents: dragging === element.id ? "none" : "auto",
              }}
            >
              {element.label}
            </button>
          )}

          {element.type === "search" && activeTab === "projects" && onSearchChange && (
            <div className="relative" style={{ width: "300px" }}>
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
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

          {element.type === "settings" && (
            <button
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/50"
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
          )}
        </div>
      ))}
    </header>
  );
}
