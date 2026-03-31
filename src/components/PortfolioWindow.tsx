"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Person } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import AIChat from "@/components/AIChat";

interface PortfolioWindowProps {
  person: Person;
  onClose: () => void;
  onMinimize: () => void;
  minimized?: boolean;
  zIndex: number;
  onFocus: () => void;
  initialRect?: DOMRect;
  onOpenProject?: (url: string, title: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const redCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='6' cy='6' r='5' fill='%23ff5f57' stroke='%23993b37' stroke-width='1.2'/%3E%3C/svg%3E") 6 6, pointer`;
const yellowCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='6' cy='6' r='5' fill='%23febc2e' stroke='%23a07800' stroke-width='1.2'/%3E%3C/svg%3E") 6 6, pointer`;
const greenCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='6' cy='6' r='5' fill='%2328c840' stroke='%23107a22' stroke-width='1.2'/%3E%3C/svg%3E") 6 6, pointer`;

const MOBILE_BREAKPOINT = 768;
const MOBILE_GUTTER = 0;
const MOBILE_TOP = 0;
const MOBILE_BOTTOM_OFFSET = 0;
const DESKTOP_DEFAULT_WIDTH = 480;
const DESKTOP_DEFAULT_HEIGHT = 580;

export default function PortfolioWindow({
  person,
  onClose,
  onMinimize,
  minimized = false,
  zIndex,
  onFocus,
  initialRect,
  onOpenProject,
}: PortfolioWindowProps) {
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(!!initialRect);
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return { width: 1200, height: 900 };
    return { width: window.innerWidth, height: window.innerHeight };
  });
  const prevRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Window animation state
  type AnimState = "idle" | "pre-close" | "closing" | "minimizing" | "init-restore" | "restoring";
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [dockTranslate, setDockTranslate] = useState({ x: 0, y: 0 });
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMinimizedRef = useRef(minimized);

  // Watch minimized prop: when it flips true→false, play restore animation
  useEffect(() => {
    if (prevMinimizedRef.current === true && minimized === false) {
      requestAnimationFrame(() => {
        setAnimState("init-restore");
        requestAnimationFrame(() => {
          setAnimState("restoring");
          animTimerRef.current = setTimeout(() => setAnimState("idle"), 500);
        });
      });
    }
    prevMinimizedRef.current = minimized;
  }, [minimized]);

  // Clean up timers on unmount
  useEffect(() => () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); }, []);

  // Initialize position - either from card position or centered
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    if (initialRect) {
      return { x: initialRect.left, y: initialRect.top };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw <= MOBILE_BREAKPOINT) {
      return { x: MOBILE_GUTTER, y: MOBILE_TOP };
    }
    const initialX = Math.max(20, (vw - DESKTOP_DEFAULT_WIDTH) / 2 + (Math.random() - 0.5) * 80);
    const initialY = Math.max(20, (vh - DESKTOP_DEFAULT_HEIGHT) / 2 + (Math.random() - 0.5) * 60);
    return { x: initialX, y: initialY };
  });
  
  const [size, setSize] = useState(() => {
    if (initialRect) {
      return { width: initialRect.width, height: initialRect.height };
    }
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT) {
      return {
        width: Math.max(280, window.innerWidth - MOBILE_GUTTER * 2),
        height: Math.max(360, window.innerHeight - MOBILE_BOTTOM_OFFSET),
      };
    }
    return { width: DESKTOP_DEFAULT_WIDTH, height: DESKTOP_DEFAULT_HEIGHT };
  });

  const isMobile = viewport.width <= MOBILE_BREAKPOINT;
  const mobileFrame = {
    x: MOBILE_GUTTER,
    y: MOBILE_TOP,
    width: viewport.width,
    height: Math.max(320, viewport.height - MOBILE_TOP - MOBILE_BOTTOM_OFFSET),
  };
  const effectivePosition = isMobile && !isMaximized ? { x: mobileFrame.x, y: mobileFrame.y } : position;
  const effectiveSize = isMobile && !isMaximized ? { width: mobileFrame.width, height: mobileFrame.height } : size;

  // Animate from card to window
  useEffect(() => {
    if (!initialRect || !isAnimating) return;
    
    const timer = setTimeout(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw <= MOBILE_BREAKPOINT) {
        setPosition({ x: MOBILE_GUTTER, y: MOBILE_TOP });
        setSize({
          width: vw,
          height: Math.max(320, vh - MOBILE_TOP - MOBILE_BOTTOM_OFFSET),
        });
      } else {
        const targetX = Math.max(20, (vw - DESKTOP_DEFAULT_WIDTH) / 2);
        const targetY = Math.max(20, (vh - DESKTOP_DEFAULT_HEIGHT) / 2);
        setPosition({ x: targetX, y: targetY });
        setSize({ width: DESKTOP_DEFAULT_WIDTH, height: DESKTOP_DEFAULT_HEIGHT });
      }
      setIsAnimating(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [initialRect, isAnimating]);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({ width, height });
      if (width <= MOBILE_BREAKPOINT && !isMaximized) {
        setPosition({ x: MOBILE_GUTTER, y: MOBILE_TOP });
        setSize({
          width,
          height: Math.max(320, height - MOBILE_TOP - MOBILE_BOTTOM_OFFSET),
        });
      }
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, [isMaximized]);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Drag handlers
  const handleMouseDownDrag = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isMaximized) return;
      if ((e.target as HTMLElement).closest("button")) return;
      onFocus();
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position, onFocus, isMobile, isMaximized]
  );

  // Resize handlers
  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus();
      setIsResizing(true);
      dragOffset.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [onFocus, isMobile, isMaximized]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const nextX = e.clientX - dragOffset.current.x;
        const nextY = e.clientY - dragOffset.current.y;
        const maxX = Math.max(0, viewport.width - size.width);
        const maxY = Math.max(0, viewport.height - size.height);
        setPosition({
          x: Math.min(Math.max(0, nextX), maxX),
          y: Math.min(Math.max(0, nextY), maxY),
        });
      }
      if (isResizing) {
        const dx = e.clientX - dragOffset.current.x;
        const dy = e.clientY - dragOffset.current.y;
        setSize((prev) => ({
          width: Math.min(Math.max(360, prev.width + dx), viewport.width),
          height: Math.min(Math.max(380, prev.height + dy), viewport.height),
        }));
        dragOffset.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, viewport, size.width, size.height]);

  const projects =
    activeTab === "current" ? person.currentProjects : person.pastProjects;

  const handleToggleMaximize = useCallback(() => {
    if (isMaximized) {
      // Restore
      if (prevRectRef.current) {
        setPosition({ x: prevRectRef.current.x, y: prevRectRef.current.y });
        setSize({ width: prevRectRef.current.width, height: prevRectRef.current.height });
      }
      setIsMaximized(false);
    } else {
      // Save current, then maximize
      prevRectRef.current = { x: effectivePosition.x, y: effectivePosition.y, width: effectiveSize.width, height: effectiveSize.height };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  }, [isMaximized, effectivePosition.x, effectivePosition.y, effectiveSize.width, effectiveSize.height]);

  const computeDockTranslate = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const dockCX = window.innerWidth / 2;
    const dockCY = window.innerHeight - 48;
    return { x: dockCX - (effectivePosition.x + effectiveSize.width / 2), y: dockCY - (effectivePosition.y + effectiveSize.height / 2) };
  };

  const handleCloseClick = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setAnimState("pre-close");
    animTimerRef.current = setTimeout(() => {
      setAnimState("closing");
      animTimerRef.current = setTimeout(() => onClose(), 260);
    }, 70);
  };

  const handleMinimizeClick = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    const t = computeDockTranslate();
    setDockTranslate(t);
    setAnimState("minimizing");
    animTimerRef.current = setTimeout(() => {
      onMinimize();
      setAnimState("idle");
    }, 420);
  };

  const getAnimStyle = (): React.CSSProperties => {
    const { x, y } = dockTranslate;
    switch (animState) {
      case "pre-close":
        return { transform: "scale(1.05)", transition: "transform 0.07s ease-out" };
      case "closing":
        return { transform: "scale(0)", opacity: 0, transition: "transform 0.26s cubic-bezier(0.4,0,1,1), opacity 0.22s ease" };
      case "minimizing":
        return { transform: `translate(${x}px,${y}px) scale(0.1)`, opacity: 0, transition: "transform 0.42s cubic-bezier(0.4,0,1,1), opacity 0.35s ease" };
      case "init-restore":
        return { transform: `translate(${x}px,${y}px) scale(0.1)`, opacity: 0, transition: "none" };
      case "restoring":
        return { transform: "translate(0,0) scale(1)", opacity: 1, transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease" };
      default:
        return {};
    }
  };

  return (
    <div
      ref={windowRef}
      className={`fixed shadow-2xl flex flex-col overflow-hidden ${isMobile && !isMaximized ? "rounded-none" : "rounded-2xl"}`}
      style={{
        left: effectivePosition.x,
        top: effectivePosition.y,
        width: effectiveSize.width,
        height: effectiveSize.height,
        zIndex,
        background: "#dce6f0",
        border: isMobile && !isMaximized ? "none" : "2px solid #8aa0b8",
        userSelect: isDragging || isResizing ? "none" : "auto",
        visibility: (minimized && animState === "idle") ? "hidden" : "visible",
        pointerEvents: (minimized && animState === "idle") ? "none" : "auto",
        transition: animState !== "idle" ? undefined
          : isMaximized
            ? "left 0.32s cubic-bezier(0.4,0,0.2,1), top 0.32s cubic-bezier(0.4,0,0.2,1), width 0.32s cubic-bezier(0.4,0,0.2,1), height 0.32s cubic-bezier(0.4,0,0.2,1), border-radius 0.32s"
            : isAnimating
              ? "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : isDragging || isResizing
                ? "none"
                : "box-shadow 0.2s",
              borderRadius: isMaximized || (isMobile && !isMaximized) ? 0 : undefined,
              boxShadow: isMobile && !isMaximized ? "none" : undefined,
        ...getAnimStyle(),
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar - draggable */}
      <div
        className={`flex items-center px-4 sm:px-5 py-3 shrink-0 relative ${isMobile || isMaximized ? "cursor-default" : "cursor-move"}`}
        style={{
          background: "#c0d0e0",
          borderBottom: "1.5px solid #a0b4c8",
        }}
        onMouseDown={handleMouseDownDrag}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          {/* Red — close */}
          <button
            onClick={handleCloseClick}
            className={`group rounded-full flex items-center justify-center transition-opacity duration-150 ${isMobile ? "w-6 h-6" : "w-3.5 h-3.5"}`}
            style={{ background: "#ff5f57", cursor: redCursor }}
            title="Close"
            aria-label={`Close ${person.name} portfolio`}
          >
            <svg
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              width="6"
              height="6"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path d="M1 1L9 9M9 1L1 9" stroke="#7a1410" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          {/* Yellow — minimize */}
          {!isMobile && (
            <button
              onClick={handleMinimizeClick}
              className="group w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: "#febc2e", cursor: yellowCursor }}
              title="Minimize"
              aria-label={`Minimize ${person.name} portfolio`}
            >
              <svg
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                width="6"
                height="6"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path d="M1.5 5h7" stroke="#7a5000" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {/* Green — maximize / restore */}
          {!isMobile && (
            <button
              onClick={handleToggleMaximize}
              className="group w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: "#28c840", cursor: greenCursor }}
              title={isMaximized ? "Restore" : "Maximise"}
              aria-label={isMaximized ? `Restore ${person.name} portfolio` : `Maximize ${person.name} portfolio`}
            >
              <svg
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                width="6"
                height="6"
                viewBox="0 0 10 10"
                fill="none"
              >
                {isMaximized
                  ? <path d="M3 1L9 1M9 1V7M1 9L7 3" stroke="#0a4a0a" strokeWidth="1.5" strokeLinecap="round" />
                  : <path d="M1 1h3.5M1 1v3.5M9 9H5.5M9 9V5.5" stroke="#0a4a0a" strokeWidth="1.5" strokeLinecap="round" />
                }
              </svg>
            </button>
          )}
        </div>

        {/* Centered name — absolutely positioned so it's truly centred */}
        <div className="absolute inset-x-0 flex justify-center items-center pointer-events-none">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "#ffffff",
                border: "1.5px solid #8aa0b8",
                color: "#4a6a8a",
              }}
            >
              {getInitials(person.name)}
            </div>
            <h3
              className="font-semibold text-xs sm:text-sm"
              style={{ color: "#2a4a6a" }}
            >
              {person.name}
            </h3>
          </div>
        </div>

      </div>

      {/* Profile toggle */}
      <button
        onClick={() => setProfileExpanded(!profileExpanded)}
        className="w-full px-4 sm:px-5 py-2.5 min-h-11 flex items-center justify-between cursor-pointer transition-colors duration-200 shrink-0"
        style={{
          background: profileExpanded ? "#c8d8e8" : "#d4e0ec",
          borderBottom: "1px solid #b8c8d8",
        }}
        aria-expanded={profileExpanded}
      >
        <span className="text-sm font-medium" style={{ color: "#4a6a8a" }}>
          Profile & Socials
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

      {/* Profile expandable section */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out shrink-0"
        style={{
          maxHeight: profileExpanded ? "200px" : "0px",
          opacity: profileExpanded ? 1 : 0,
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: "#e8eff5",
                  color: "#2a4a6a",
                  border: "1px solid #a0b4c8",
                }}
              >
                {social.icon === "github" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                {social.icon === "linkedin" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )}
                {social.icon === "twitter" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {social.icon === "dribbble" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.29zm10.335 3.483c-.218.29-1.89 2.49-5.682 4.012.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.36-6.36z" />
                  </svg>
                )}
                {social.icon === "blog" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                )}
                {social.icon === "instagram" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                )}
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* AI Chat drawer */}
      <AIChat person={person} />

      {/* Tabs */}
      <div
        className="flex px-4 pt-3 pb-0 gap-1 shrink-0"
        style={{ background: "#dce6f0" }}
      >
        <button
          onClick={() => setActiveTab("current")}
          className="px-3 sm:px-4 py-2 min-h-11 rounded-t-lg text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{
            background: activeTab === "current" ? "#ffffff" : "transparent",
            border:
              activeTab === "current"
                ? "1.5px solid #a0b4c8"
                : "1.5px solid transparent",
            borderBottom: activeTab === "current" ? "1.5px solid #ffffff" : "1.5px solid transparent",
            color: activeTab === "current" ? "#2a4a6a" : "#6b8dad",
            marginBottom: "-1.5px",
            position: "relative",
            zIndex: activeTab === "current" ? 1 : 0,
          }}
        >
          Current ({person.currentProjects.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className="px-3 sm:px-4 py-2 min-h-11 rounded-t-lg text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{
            background: activeTab === "past" ? "#ffffff" : "transparent",
            border:
              activeTab === "past"
                ? "1.5px solid #a0b4c8"
                : "1.5px solid transparent",
            borderBottom: activeTab === "past" ? "1.5px solid #ffffff" : "1.5px solid transparent",
            color: activeTab === "past" ? "#2a4a6a" : "#6b8dad",
            marginBottom: "-1.5px",
            position: "relative",
            zIndex: activeTab === "past" ? 1 : 0,
          }}
        >
          Past ({person.pastProjects.length})
        </button>
      </div>

      {/* Divider line */}
      <div
        className="shrink-0"
        style={{ height: "1.5px", background: "#a0b4c8" }}
      />

      {/* Projects list */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3"
        style={{ background: "#dce6f0", paddingBottom: "10px" }}
      >
        {projects.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center text-sm"
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
              onOpenProject={onOpenProject}
            />
          ))
        )}
      </div>

      {/* Resize handle */}
      {!isMobile && !isMaximized && (
      <div
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
        style={{ zIndex: 10 }}
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
      )}
    </div>
  );
}
