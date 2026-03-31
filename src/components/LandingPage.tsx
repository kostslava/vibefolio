"use client";

import React from "react";

interface LandingPageProps {
  onBegin: () => void;
}

export default function LandingPage({ onBegin }: LandingPageProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center doodle-bg">
      <div className="text-center bounce-in">
        {/* Large VIBEFOLIO title */}
        <h1
          className="text-8xl font-black mb-8 scribble-line inline-block"
          style={{
            fontFamily: "'Comic Sans MS', cursive",
            color: "#2a2a2a",
            textShadow:
              "4px 4px 0 #ff6b9d, 8px 8px 0 #ffa56b, 12px 12px 0 #6b9dff",
            transform: "rotate(-2deg)",
            letterSpacing: "-0.02em",
          }}
        >
          VIBEFOLIO
        </h1>

        {/* Subtitle/motto */}
        <p
          className="text-2xl mb-12 floating"
          style={{
            fontFamily: "'Comic Sans MS', cursive",
            color: "#4a4a4a",
            fontWeight: "600",
            transform: "rotate(1deg)",
          }}
        >
          ✨ begin the experience ✨
        </p>

        {/* CTA Button */}
        <button onClick={onBegin} className="blob-button wiggle">
          Let's Go! 🚀
        </button>

        {/* Decorative doodles */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            fontSize: "60px",
            opacity: 0.3,
            transform: "rotate(-15deg)",
          }}
        >
          ⭐
        </div>
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "20%",
            fontSize: "50px",
            opacity: 0.3,
            transform: "rotate(20deg)",
          }}
        >
          ✨
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            left: "25%",
            fontSize: "45px",
            opacity: 0.3,
            transform: "rotate(10deg)",
          }}
        >
          💫
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            fontSize: "55px",
            opacity: 0.3,
            transform: "rotate(-25deg)",
          }}
        >
          🌟
        </div>
      </div>
    </div>
  );
}
