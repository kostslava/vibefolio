"use client";

import React, { useState, useEffect } from "react";

interface IntroExperienceProps {
  onComplete: () => void;
}

export default function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: "#f0f0f0" }}>
      {/* Checkered background pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #e8e8e8 25%, transparent 25%),
            linear-gradient(-45deg, #e8e8e8 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e8e8e8 75%),
            linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-40 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${Math.random() * 40 + 20}px`,
            height: `${Math.random() * 40 + 20}px`,
            background: `linear-gradient(135deg, #c8d8e8, #a0b4c8)`,
            border: "2px solid #8aa0b8",
            animationDelay: `${particle.delay}s`,
            animationDuration: `${Math.random() * 3 + 4}s`,
          }}
        />
      ))}

      {/* Mouse follower effect */}
      <div
        className="pointer-events-none fixed rounded-full transition-all duration-500 ease-out opacity-20"
        style={{
          left: mousePos.x - 100,
          top: mousePos.y - 100,
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, #a0b4c8, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Logo/Title with parallax effect */}
        <div
          className="mb-8 transform transition-transform duration-100"
          style={{
            transform: typeof window !== 'undefined' 
              ? `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`
              : 'translate(0, 0)',
          }}
        >
          <h1
            className="text-7xl font-serif italic font-bold mb-4 animate-slideDown"
            style={{
              color: "#2a4a6a",
              textShadow: "3px 3px 0px #c8d8e8",
            }}
          >
            VIBEFOLIO
          </h1>
          <p
            className="text-xl text-center animate-fadeIn"
            style={{
              color: "#4a6a8a",
              animationDelay: "0.3s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            An interactive portfolio experience
          </p>
        </div>

        {/* Animated cards preview */}
        <div className="flex gap-4 mb-8 animate-fadeIn" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer animate-bounce"
              style={{
                width: "80px",
                height: "80px",
                background: "#c8d8e8",
                border: "2px solid #a0b4c8",
                animationDelay: `${i * 0.2 + 0.8}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>

        {/* Call to action button */}
        <button
          onClick={onComplete}
          className="group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95 animate-fadeIn"
          style={{
            background: "#c8d8e8",
            border: "3px solid #a0b4c8",
            color: "#2a4a6a",
            boxShadow: "0 4px 0 #a0b4c8, 0 8px 20px rgba(0,0,0,0.1)",
            animationDelay: "1s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <span className="relative z-10">Enter Experience</span>
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(45deg, #d8e8f8, #c8d8e8)",
            }}
          />
        </button>

        {/* Hint text */}
        <p
          className="mt-6 text-sm animate-fadeIn"
          style={{
            color: "#6b8dad",
            animationDelay: "1.2s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          Drag, resize, and explore freely
        </p>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(20px) rotate(-5deg);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
