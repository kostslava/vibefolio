"use client";

import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import PersonCard from "@/components/PersonCard";
import PortfolioWindow from "@/components/PortfolioWindow";
import AboutPage from "@/components/AboutPage";
import { Person } from "@/lib/types";
import { people } from "@/lib/data";

interface OpenWindow {
  person: Person;
  zIndex: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"projects" | "about">("projects");
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [maxZ, setMaxZ] = useState(100);

  const handlePersonClick = useCallback(
    (person: Person) => {
      // Don't open duplicate windows
      if (openWindows.some((w) => w.person.id === person.id)) {
        // Just bring it to front
        setMaxZ((prev) => prev + 1);
        setOpenWindows((prev) =>
          prev.map((w) =>
            w.person.id === person.id ? { ...w, zIndex: maxZ + 1 } : w
          )
        );
        return;
      }
      const newZ = maxZ + 1;
      setMaxZ(newZ);
      setOpenWindows((prev) => [...prev, { person, zIndex: newZ }]);
    },
    [openWindows, maxZ]
  );

  const handleCloseWindow = useCallback((personId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.person.id !== personId));
  }, []);

  const handleFocusWindow = useCallback(
    (personId: string) => {
      const newZ = maxZ + 1;
      setMaxZ(newZ);
      setOpenWindows((prev) =>
        prev.map((w) =>
          w.person.id === personId ? { ...w, zIndex: newZ } : w
        )
      );
    },
    [maxZ]
  );

  return (
    <div className="min-h-screen pb-12">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "projects" ? (
        <main className="max-w-5xl mx-auto mt-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={handlePersonClick}
              />
            ))}
          </div>
        </main>
      ) : (
        <AboutPage />
      )}

      {/* Portfolio Windows */}
      {openWindows.map((win) => (
        <PortfolioWindow
          key={win.person.id}
          person={win.person}
          zIndex={win.zIndex}
          onClose={() => handleCloseWindow(win.person.id)}
          onFocus={() => handleFocusWindow(win.person.id)}
        />
      ))}
    </div>
  );
}
