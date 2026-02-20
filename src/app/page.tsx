"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import PersonCard from "@/components/PersonCard";
import AboutPage from "@/components/AboutPage";
import IntroExperience from "@/components/IntroExperience";
import { people } from "@/lib/data";

// Compute initial grid positions for person cards (3-column layout, below header)
const COLS = 3;
const CARD_WIDTH = 240;
const CARD_GAP = 28;
const START_X = 40;
const START_Y = 96;

const initialPositions = people.map((_, i) => ({
  x: START_X + (i % COLS) * (CARD_WIDTH + CARD_GAP),
  y: START_Y + Math.floor(i / COLS) * 110,
}));

const BASE_Z = 100;

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "about">("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [zIndexes, setZIndexes] = useState<Record<string, number>>(() =>
    Object.fromEntries(people.map((p, i) => [p.id, BASE_Z + i]))
  );

  const visibleIds = useMemo(() => {
    if (!searchQuery.trim()) return null; // null means show all
    const q = searchQuery.toLowerCase();
    return new Set(
      people
        .filter((p) => p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q))
        .map((p) => p.id)
    );
  }, [searchQuery]);

  const handleFocus = (personId: string) => {
    setZIndexes((prev) => {
      const max = Math.max(...Object.values(prev));
      return { ...prev, [personId]: max + 1 };
    });
  };

  if (showIntro) {
    return <IntroExperience onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {activeTab === "projects" ? (
        <>
          {/* Search results notice */}
          {searchQuery.trim() && visibleIds && (
            <div
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-xl text-sm shadow"
              style={{
                background: "#c8d8e8",
                border: "1.5px solid #a0b4c8",
                color: "#4a6a8a",
              }}
            >
              {visibleIds.size === 0
                ? `No people found for "${searchQuery}"`
                : `Showing ${visibleIds.size} of ${people.length} people`}
            </div>
          )}

          {people.map((person, index) => (
            <PersonCard
              key={person.id}
              person={person}
              initialX={initialPositions[index].x}
              initialY={initialPositions[index].y}
              zIndex={zIndexes[person.id]}
              onFocus={() => handleFocus(person.id)}
              isHidden={visibleIds !== null && !visibleIds.has(person.id)}
            />
          ))}
        </>
      ) : (
        <AboutPage />
      )}
    </div>
  );
}
