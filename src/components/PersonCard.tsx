"use client";

import React from "react";
import Image from "next/image";
import { Person } from "@/lib/types";

interface PersonCardProps {
  person: Person;
  onClick: (person: Person) => void;
  isHighlighted?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function PersonCard({ person, onClick, isHighlighted = false }: PersonCardProps) {
  return (
    <button
      onClick={() => onClick(person)}
      className="group flex items-center gap-5 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer w-full text-left relative overflow-hidden"
      style={{
        background: "#c8d8e8",
        border: isHighlighted ? "3px solid #4a8ab8" : "2px solid #a0b4c8",
        boxShadow: isHighlighted ? "0 0 20px rgba(74, 138, 184, 0.3)" : "none",
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
    </button>
  );
}
