"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ProjectWindowProps {
  url: string;
  title: string;
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}

export default function ProjectWindow({
  url,
  title,
  onClose,
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

  // Determine display domain for the address bar
  let displayUrl = url;
  try {
    displayUrl = new URL(url).hostname;
  } catch {
    // keep original
  }

  return (
    <div
      className="fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        background: "#dce6f0",
        border: "2px solid #8aa0b8",
        userSelect: isDragging || isResizing ? "none" : "auto",
        transition: isDragging || isResizing ? "none" : "box-shadow 0.2s",
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
            onClick={onClose}
            className="group w-3.5 h-3.5 rounded-full flex items-center justify-center transition-opacity duration-150 cursor-pointer"
            style={{ background: "#ff5f57" }}
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
          {/* Yellow — no-op */}
          <button
            className="group w-3.5 h-3.5 rounded-full flex items-center justify-center transition-opacity duration-150 cursor-default"
            style={{ background: "#febc2e" }}
            title="Minimize (not available)"
          >
            <svg
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              width="6"
              height="6"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M1.5 5h7"
                stroke="#7a5000"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {/* Green — no-op */}
          <button
            className="group w-3.5 h-3.5 rounded-full flex items-center justify-center transition-opacity duration-150 cursor-default"
            style={{ background: "#28c840" }}
            title="Full screen (not available)"
          >
            <svg
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              width="6"
              height="6"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M1 1h3.5M1 1v3.5M9 9H5.5M9 9V5.5"
                stroke="#0a4a0a"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
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
