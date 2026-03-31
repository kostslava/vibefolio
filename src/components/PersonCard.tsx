"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Person } from "@/lib/types";

interface PersonCardProps {
  person: Person;
  onClick: (person: Person, cardRect: DOMRect) => void;
  isHighlighted?: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function PersonCard({ person, onClick, isHighlighted = false, cardRef }: PersonCardProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = cardRef || internalRef;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ref.current) return;
    
    setIsResizing(true);
    const rect = ref.current.getBoundingClientRect();
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };
  }, [ref]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        width: Math.max(200, resizeStart.current.width + dx),
        height: Math.max(80, resizeStart.current.height + dy),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleClick = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      onClick(person, rect);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="group flex items-center gap-5 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer text-left relative overflow-hidden"
      style={{
        background: "#c8d8e8",
        border: isHighlighted ? "3px solid #4a8ab8" : "2px solid #a0b4c8",
        boxShadow: isHighlighted ? "0 0 20px rgba(74, 138, 184, 0.3)" : "none",
        width: size.width > 0 ? `${size.width}px` : "100%",
        height: size.height > 0 ? `${size.height}px` : "auto",
        minHeight: "96px",
      }}
    >
      {/* Highlight pulse effect */}
      {isHighlighted && (
        <div
          className="absolute inset-0 animate-pulse pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(74, 138, 184, 0.1), transparent)",
          }}
        />
      )}
      {/* Photo circle */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-shadow duration-300 group-hover:shadow-md relative z-10"
        style={{
          background: "#ffffff",
          border: "2px solid #8aa0b8",
          color: "#4a6a8a",
        }}
      >
        {person.photo ? (
          <Image
            src={person.photo}
            alt={person.name}
            width={64}
            height={64}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(person.name)
        )}
      </div>
      {/* Name */}
      <span className="text-lg font-medium relative z-10" style={{ color: "#2a4a6a" }}>
        {person.name}
      </span>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onMouseDown={handleMouseDownResize}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="absolute bottom-1 right-1"
          style={{ color: "#8aa0b8" }}
        >
          <path
            d="M10 0L0 10M10 4L4 10M10 8L8 10"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
