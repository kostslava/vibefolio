"use client";

import React from "react";
import { Person } from "@/lib/types";

interface PersonCardProps {
  person: Person;
  onClick: (person: Person) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function PersonCard({ person, onClick }: PersonCardProps) {
  return (
    <button
      onClick={() => onClick(person)}
      className="group flex items-center gap-5 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer w-full text-left"
      style={{
        background: "#c8d8e8",
        border: "2px solid #a0b4c8",
      }}
    >
      {/* Photo circle */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-shadow duration-300 group-hover:shadow-md"
        style={{
          background: "#ffffff",
          border: "2px solid #8aa0b8",
          color: "#4a6a8a",
        }}
      >
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(person.name)
        )}
      </div>
      {/* Name */}
      <span className="text-lg font-medium" style={{ color: "#2a4a6a" }}>
        {person.name}
      </span>
    </button>
  );
}
