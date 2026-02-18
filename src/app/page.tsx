"use client";

import React, { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import PersonCard from "@/components/PersonCard";
import PortfolioWindow from "@/components/PortfolioWindow";
import AboutPage from "@/components/AboutPage";
import IntroExperience from "@/components/IntroExperience";
import { Person } from "@/lib/types";
import { people } from "@/lib/data";

interface OpenWindow {
  person: Person;
  zIndex: number;
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "about">("projects");
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [maxZ, setMaxZ] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter people based on search query
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return people;
    const query = searchQuery.toLowerCase();
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.bio.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Check if a person matches the search (for highlighting)
  const getMatchScore = useCallback(
    (person: Person) => {
      if (!searchQuery.trim()) return 0;
      const query = searchQuery.toLowerCase();
      const nameMatch = person.name.toLowerCase().includes(query);
      return nameMatch ? 1 : 0.5; // Higher score for name matches
    },
    [searchQuery]
  );

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

  if (showIntro) {
    return <IntroExperience onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {activeTab === "projects" ? (
        <main className="max-w-5xl mx-auto mt-8 px-4">
          {/* Search results info */}
          {searchQuery.trim() && (
            <div className="mb-4 text-center">
              <p style={{ color: "#4a6a8a" }}>
                {filteredPeople.length === 0 ? (
                  <span>No people found matching &quot;{searchQuery}&quot;</span>
                ) : filteredPeople.length === people.length ? (
                  <span>Showing all {people.length} people</span>
                ) : (
                  <span>
                    Found {filteredPeople.length} of {people.length} people
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPeople.map((person, index) => {
              const matchScore = getMatchScore(person);
              const isHighlighted = matchScore > 0;

              return (
                <div
                  key={person.id}
                  className="transition-all duration-300"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s backwards`,
                    transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <PersonCard
                    person={person}
                    onClick={handlePersonClick}
                    isHighlighted={isHighlighted}
                  />
                </div>
              );
            })}
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

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
