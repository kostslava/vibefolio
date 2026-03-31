"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { people } from "@/lib/data";
import { Person } from "@/lib/types";

interface Particle {
  id: number; x: number; y: number; size: number; delay: number; duration: number;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function UserIntro({ person }: { person: Person }) {
  const router = useRouter();
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 4,
    }))
  );

  const handleEnter = () => {
    router.push(`/?portfolio=${encodeURIComponent(person.username ?? person.id)}`);
  };

  const tagline = person.introTagline ?? `${person.name}'s interactive portfolio`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: "#f0f0f0" }}>
      {/* Checkered background */}
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
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "linear-gradient(135deg, #c8d8e8, #a0b4c8)",
            border: "2px solid #8aa0b8",
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Avatar */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-6"
          style={{
            background: person.photo ? "transparent" : "#c8d8e8",
            border: "3px solid #8aa0b8",
            color: "#2a4a6a",
            animation: "slideDown 0.7s ease-out forwards",
            overflow: "hidden",
          }}
        >
          {person.photo
            ? <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
            : getInitials(person.name)
          }
        </div>

        {/* Name */}
        <h1
          className="text-5xl font-serif italic font-bold mb-3 text-center"
          style={{
            color: "#2a4a6a",
            textShadow: "3px 3px 0px #c8d8e8",
            animation: "slideDown 0.8s ease-out forwards",
          }}
        >
          {person.name}
        </h1>

        {/* Tagline */}
        <p
          className="text-lg text-center mb-10 max-w-sm"
          style={{
            color: "#4a6a8a",
            animation: "fadeIn 0.6s ease-out 0.3s forwards",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {tagline}
        </p>

        {/* CTA button */}
        <button
          onClick={handleEnter}
          className="group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "#c8d8e8",
            border: "3px solid #a0b4c8",
            color: "#2a4a6a",
            boxShadow: "0 4px 0 #a0b4c8, 0 8px 20px rgba(0,0,0,0.1)",
            animation: "fadeIn 0.6s ease-out 0.8s forwards",
            opacity: 0,
            animationFillMode: "forwards",
            cursor: "pointer",
          }}
        >
          <span className="relative z-10">See Their Work</span>
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(45deg, #d8e8f8, #c8d8e8)" }}
          />
        </button>

        <p
          className="mt-6 text-sm"
          style={{
            color: "#6b8dad",
            animation: "fadeIn 0.6s ease-out 1s forwards",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          Drag, resize, and explore freely
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          75% { transform: translateY(20px) rotate(-5deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function NotFound({ username }: { username: string }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4" style={{ background: "#f0f0f0" }}>
      <h1 className="text-3xl font-serif italic font-bold" style={{ color: "#2a4a6a" }}>Not found</h1>
      <p className="text-base" style={{ color: "#6b8dad" }}>No portfolio found for &quot;{username}&quot;</p>
      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 rounded-xl font-semibold mt-2"
        style={{ background: "#c8d8e8", border: "2px solid #a0b4c8", color: "#2a4a6a", cursor: "pointer" }}
      >
        Go home
      </button>
    </div>
  );
}

export default function UsernamePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const person = people.find(
    (p) => p.username === username || p.id === username
  );

  if (!person) return <NotFound username={username} />;
  return <UserIntro person={person} />;
}
