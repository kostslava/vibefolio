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
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return { x: 120, y: 120 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(20, (vw - 800) / 2 + (Math.random() - 0.5) * 100),
      y: Math.max(20, (vh - 560) / 2 + (Math.random() - 0.5) * 80),
    };
  });
  const [size, setSize] = useState({ width: 800, height: 560 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Animation state
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [dockTranslate, setDockTranslate] = useState({ x: 0, y: 0 });
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMinimizedRef = useRef(minimized);

  useEffect(() => {
    if (prevMinimizedRef.current === true && minimized === false) {
      setAnimState("init-restore");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimState("restoring");
        animTimerRef.current = setTimeout(() => setAnimState("idle"), 500);
      }));
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
      prevRectRef.current = { x: position.x, y: position.y, width: size.width, height: size.height };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  }, [isMaximized, position, size]);

  const computeDockTranslate = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return { x: window.innerWidth / 2 - (position.x + size.width / 2), y: window.innerHeight - 48 - (position.y + size.height / 2) };
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
      if ((e.target as HTMLElement).closest("button")) return;
      onFocus();
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position, onFocus]
  );

  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFocus();
      setIsResizing(true);
      dragOffset.current = { x: e.clientX, y: e.clientY };
    },
    [onFocus]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
      if (isResizing) {
        const dx = e.clientX - dragOffset.current.x;
        const dy = e.clientY - dragOffset.current.y;
        setSize((prev) => ({
          width: Math.max(400, prev.width + dx),
          height: Math.max(300, prev.height + dy),
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
  }, [isDragging, isResizing]);

  let displayUrl = url;
  try { displayUrl = new URL(url).hostname; } catch { /* keep */ }

  return (
    <div
      className="fixed shadow-2xl flex flex-col overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        background: "#dce6f0",
        border: "2px solid #8aa0b8",
        userSelect: isDragging || isResizing ? "none" : "auto",
        visibility: (minimized && animState === "idle") ? "hidden" : "visible",
        pointerEvents: (minimized && animState === "idle") ? "none" : "auto",
        borderRadius: isMaximized ? 0 : 16,
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
        className="flex items-center gap-3 px-4 py-3 cursor-move shrink-0"
        style={{
          background: "#c0d0e0",
          borderBottom: "1.5px solid #a0b4c8",
        }}
        onMouseDown={handleMouseDownDrag}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Red — close */}
          <button
            onClick={handleCloseClick}
            className="group w-3.5 h-3.5 rounded-full flex items-center justify-center transition-opacity duration-150 cursor-pointer"
            style={{ background: "#ff5f57", cursor: redCursor }}
            title="Close"
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
          <button
            onClick={handleMinimizeClick}
            className="group w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: "#febc2e", cursor: yellowCursor }}
            title="Minimize"
          >
            <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="6" height="6" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5h7" stroke="#7a5000" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          {/* Green — maximize / restore */}
          <button
            onClick={handleToggleMaximize}
            className="group w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: "#28c840", cursor: greenCursor }}
            title={isMaximized ? "Restore" : "Maximise"}
          >
            <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="6" height="6" viewBox="0 0 10 10" fill="none">
              {isMaximized
                ? <path d="M3 1L9 1M9 1V7M1 9L7 3" stroke="#0a4a0a" strokeWidth="1.5" strokeLinecap="round" />
                : <path d="M1 1h3.5M1 1v3.5M9 9H5.5M9 9V5.5" stroke="#0a4a0a" strokeWidth="1.5" strokeLinecap="round" />
              }
            </svg>
          </button>
        </div>

        {/* Address bar */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg overflow-hidden"
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
          className="text-sm font-medium truncate shrink-0 max-w-[160px]"
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
    </div>
  );
}
