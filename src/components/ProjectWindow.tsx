"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ProjectWindowProps {
  url: string;
  title: string;
  onClose: () => void;
  onMinimize: () => void;
  minimized?: boolean;
  zIndex: number;
  onFocus: () => void;
}

type AnimState = "idle" | "pre-close" | "closing" | "minimizing" | "init-restore" | "restoring";

const redCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='6' cy='6' r='5' fill='%23ff5f57' stroke='%23993b37' stroke-width='1.2'/%3E%3C/svg%3E") 6 6, pointer`;
const yellowCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='6' cy='6' r='5' fill='%23febc2e' stroke='%23a07800' stroke-width='1.2'/%3E%3C/svg%3E") 6 6, pointer`;
const greenCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='6' cy='6' r='5' fill='%2328c840' stroke='%23107a22' stroke-width='1.2'/%3E%3C/svg%3E") 6 6, pointer`;

const MOBILE_BREAKPOINT = 768;
const MOBILE_GUTTER = 0;
const MOBILE_TOP = 64;
const MOBILE_BOTTOM_OFFSET = 0;

export function getProjectFaviconUrl(url: string): string {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=48`; } catch { return ""; }
}
export function getProjectDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

export default function ProjectWindow({
  url,
  title,
  onClose,
  onMinimize,
  minimized = false,
  zIndex,
  onFocus,
}: ProjectWindowProps) {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return { width: 1200, height: 900 };
    return { width: window.innerWidth, height: window.innerHeight };
  });
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return { x: 120, y: 120 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw <= MOBILE_BREAKPOINT) {
      return { x: MOBILE_GUTTER, y: MOBILE_TOP };
    }
    return {
      x: Math.max(20, (vw - 800) / 2 + (Math.random() - 0.5) * 100),
      y: Math.max(20, (vh - 560) / 2 + (Math.random() - 0.5) * 80),
    };
  });
  const [size, setSize] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT) {
      return {
        width: Math.max(280, window.innerWidth - MOBILE_GUTTER * 2),
        height: Math.max(360, window.innerHeight - MOBILE_BOTTOM_OFFSET),
      };
    }
    return { width: 800, height: 560 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const isMobile = viewport.width <= MOBILE_BREAKPOINT;
  const mobileFrame = {
    x: MOBILE_GUTTER,
    y: MOBILE_TOP,
    width: viewport.width,
    height: Math.max(320, viewport.height - MOBILE_TOP - MOBILE_BOTTOM_OFFSET),
  };
  const effectivePosition = isMobile && !isMaximized ? { x: mobileFrame.x, y: mobileFrame.y } : position;
  const effectiveSize = isMobile && !isMaximized ? { width: mobileFrame.width, height: mobileFrame.height } : size;

  // Animation state
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [dockTranslate, setDockTranslate] = useState({ x: 0, y: 0 });
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMinimizedRef = useRef(minimized);

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

  useEffect(() => () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); }, []);

  const handleToggleMaximize = useCallback(() => {
    if (isMaximized) {
      if (prevRectRef.current) {
        setPosition({ x: prevRectRef.current.x, y: prevRectRef.current.y });
        setSize({ width: prevRectRef.current.width, height: prevRectRef.current.height });
      }
      setIsMaximized(false);
    } else {
      prevRectRef.current = { x: effectivePosition.x, y: effectivePosition.y, width: effectiveSize.width, height: effectiveSize.height };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  }, [isMaximized, effectivePosition.x, effectivePosition.y, effectiveSize.width, effectiveSize.height]);

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

  const computeDockTranslate = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return { x: window.innerWidth / 2 - (effectivePosition.x + effectiveSize.width / 2), y: window.innerHeight - 48 - (effectivePosition.y + effectiveSize.height / 2) };
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
    animTimerRef.current = setTimeout(() => { onMinimize(); setAnimState("idle"); }, 420);
  };

  const getAnimStyle = (): React.CSSProperties => {
    const { x, y } = dockTranslate;
    switch (animState) {
      case "pre-close": return { transform: "scale(1.05)", transition: "transform 0.07s ease-out" };
      case "closing": return { transform: "scale(0)", opacity: 0, transition: "transform 0.26s cubic-bezier(0.4,0,1,1), opacity 0.22s ease" };
      case "minimizing": return { transform: `translate(${x}px,${y}px) scale(0.1)`, opacity: 0, transition: "transform 0.42s cubic-bezier(0.4,0,1,1), opacity 0.35s ease" };
      case "init-restore": return { transform: `translate(${x}px,${y}px) scale(0.1)`, opacity: 0, transition: "none" };
      case "restoring": return { transform: "translate(0,0) scale(1)", opacity: 1, transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease" };
      default: return {};
    }
  };

  const dragOffset = useRef({ x: 0, y: 0 });

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

  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus();
      setIsResizing(true);
      dragOffset.current = { x: e.clientX, y: e.clientY };
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
          width: Math.min(Math.max(320, prev.width + dx), viewport.width),
          height: Math.min(Math.max(300, prev.height + dy), viewport.height),
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

  let displayUrl = url;
  try { displayUrl = new URL(url).hostname; } catch { /* keep */ }

  return (
    <div
      className={`fixed shadow-2xl flex flex-col overflow-hidden ${isMobile && !isMaximized ? "rounded-none" : ""}`}
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
        borderRadius: isMaximized || (isMobile && !isMaximized) ? 0 : 16,
        boxShadow: isMobile && !isMaximized ? "none" : undefined,
        transition: animState !== "idle" ? undefined
          : isMaximized
            ? "left 0.32s cubic-bezier(0.4,0,0.2,1), top 0.32s cubic-bezier(0.4,0,0.2,1), width 0.32s cubic-bezier(0.4,0,0.2,1), height 0.32s cubic-bezier(0.4,0,0.2,1), border-radius 0.32s"
            : isDragging || isResizing ? "none" : "box-shadow 0.2s",
        ...getAnimStyle(),
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className={`flex items-center gap-3 px-3 sm:px-4 py-3 shrink-0 ${isMobile || isMaximized ? "cursor-default" : "cursor-move"}`}
        style={{
          background: "#c0d0e0",
          borderBottom: "1.5px solid #a0b4c8",
        }}
        onMouseDown={handleMouseDownDrag}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Red — close */}
          <button
            onClick={handleCloseClick}
            className={`group rounded-full flex items-center justify-center transition-opacity duration-150 cursor-pointer ${isMobile ? "w-6 h-6" : "w-3.5 h-3.5"}`}
            style={{ background: "#ff5f57", cursor: redCursor }}
            title="Close"
            aria-label={`Close ${title}`}
          >
            <svg
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              width="6"
              height="6"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M1 1L9 9M9 1L1 9"
                stroke="#7a1410"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {/* Yellow — minimize */}
          {!isMobile && (
            <button
              onClick={handleMinimizeClick}
              className="group w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: "#febc2e", cursor: yellowCursor }}
              title="Minimize"
              aria-label={`Minimize ${title}`}
            >
              <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="6" height="6" viewBox="0 0 10 10" fill="none">
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
              aria-label={isMaximized ? `Restore ${title}` : `Maximize ${title}`}
            >
              <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="6" height="6" viewBox="0 0 10 10" fill="none">
                {isMaximized
                  ? <path d="M3 1L9 1M9 1V7M1 9L7 3" stroke="#0a4a0a" strokeWidth="1.5" strokeLinecap="round" />
                  : <path d="M1 1h3.5M1 1v3.5M9 9H5.5M9 9V5.5" stroke="#0a4a0a" strokeWidth="1.5" strokeLinecap="round" />
                }
              </svg>
            </button>
          )}
        </div>

        {/* Address bar */}
        <div
          className="flex-1 flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg overflow-hidden min-w-0"
          style={{
            background: "#d8e4f0",
            border: "1px solid #b0c4d8",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8aa0b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span
            className="text-xs truncate"
            style={{ color: "#4a6a8a" }}
          >
            {displayUrl}
          </span>
        </div>

        {/* Title */}
        <span
          className="text-xs sm:text-sm font-medium truncate shrink-0 max-w-[110px] sm:max-w-[160px]"
          style={{ color: "#2a4a6a" }}
        >
          {title}
        </span>
      </div>

      {/* iframe area */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "#fff" }}>
        {iframeError ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: "#dce6f0" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8aa0b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#4a6a8a" }}>
              This page can&apos;t be embedded
            </p>
            <p className="text-xs" style={{ color: "#8aa0b8" }}>
              The site blocks iframe embedding
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: "#4a7a9a",
                color: "#fff",
              }}
            >
              Open in new tab
            </a>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-none"
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onError={() => setIframeError(true)}
            style={{ pointerEvents: isDragging || isResizing ? "none" : "auto" }}
          />
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
