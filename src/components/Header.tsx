"use client";

import React, { useState, useRef, useEffect } from "react";

interface HeaderProps {
  activeTab: "projects" | "about";
  onTabChange: (tab: "projects" | "about") => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface HeaderElement {
  id: string;
  label: string;
  type: "tab" | "search" | "logo" | "settings";
  slot: number;
  value?: string;
}

// Define available slots (x positions in the header)
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SLOT_WIDTH = 120;

export default function Header({ 
  activeTab, 
  onTabChange, 
  searchQuery = "", 
  onSearchChange 
}: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [elements, setElements] = useState<HeaderElement[]>([
    { id: "logo", label: "VIBEFOLIO", type: "logo", slot: 0 },
    { id: "projects", label: "Projects", type: "tab", slot: 2, value: "projects" },
    { id: "about", label: "About", type: "tab", slot: 3, value: "about" },
    { id: "search", label: "", type: "search", slot: 5 },
    { id: "settings", label: "⚙", type: "settings", slot: 9 },
  ]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [tempPos, setTempPos] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    
    const element = elements.find((el) => el.id === id);
    if (!element || !headerRef.current) return;

    const headerRect = headerRef.current.getBoundingClientRect();
    const elementX = headerRect.left + element.slot * SLOT_WIDTH + 20;
    
    setDragging(id);
    setOffset({
      x: e.clientX - elementX,
      y: e.clientY - (headerRect.top + 12),
    });
    setTempPos({
      x: elementX,
      y: headerRect.top + 12,
    });
  };

  useEffect(() => {
    if (!dragging || !headerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const headerRect = headerRef.current!.getBoundingClientRect();
      setTempPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!headerRef.current) return;
      
      const headerRect = headerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - headerRect.left;
      
      // Calculate nearest slot
      const nearestSlot = Math.round((mouseX - 20) / SLOT_WIDTH);
      const clampedSlot = Math.max(0, Math.min(SLOTS.length - 1, nearestSlot));
      
      setElements((prev) => {
        const newElements = [...prev];
        const draggedIndex = newElements.findIndex((el) => el.id === dragging);
        
        if (draggedIndex !== -1) {
          // Check if slot is occupied
          const slotOccupied = newElements.some(
            (el, idx) => el.slot === clampedSlot && idx !== draggedIndex
          );
          
          if (slotOccupied) {
            // Swap with the element in that slot
            const occupyingIndex = newElements.findIndex(
              (el, idx) => el.slot === clampedSlot && idx !== draggedIndex
            );
            if (occupyingIndex !== -1) {
              const oldSlot = newElements[draggedIndex].slot;
              newElements[draggedIndex].slot = clampedSlot;
              newElements[occupyingIndex].slot = oldSlot;
            }
          } else {
            newElements[draggedIndex].slot = clampedSlot;
          }
        }
        
        return newElements;
      });
      
      setDragging(null);
      setTempPos(null);
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
        Drag to swap positions
      </div>

      {/* Slot indicators (visible during drag) */}
      {dragging && (
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className="absolute top-0 h-full border-l border-dashed opacity-20"
              style={{
                left: slot * SLOT_WIDTH + 20,
                borderColor: "#6b8dad",
              }}
            />
          ))}
        </div>
      )}

      {elements.map((element) => {
        const isDraggingThis = dragging === element.id;
        const x = isDraggingThis && tempPos ? tempPos.x : element.slot * SLOT_WIDTH + 20;
        const y = isDraggingThis && tempPos ? tempPos.y : 12;

        return (
          <div
            key={element.id}
            className="absolute transition-all duration-300"
            style={{
              left: x,
              top: y,
              cursor: isDraggingThis ? "grabbing" : "grab",
              zIndex: isDraggingThis ? 1000 : 1,
              transform: isDraggingThis ? "scale(1.05)" : "scale(1)",
              opacity: isDraggingThis ? 0.8 : 1,
              pointerEvents: dragging && !isDraggingThis ? "none" : "auto",
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
                  pointerEvents: isDraggingThis ? "none" : "auto",
                }}
              >
                {element.label}
              </button>
            )}

            {element.type === "search" && activeTab === "projects" && onSearchChange && (
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
        );
      })}
    </header>
  );
}
