"use client";

import React, { useState, useRef } from "react";
import Header from "@/components/Header";
import SearchLauncher from "@/components/SearchLauncher";
import PortfolioWindow from "@/components/PortfolioWindow";
import ProjectWindow from "@/components/ProjectWindow";
import AboutPage from "@/components/AboutPage";
import IntroExperience from "@/components/IntroExperience";
import { Person } from "@/lib/types";

interface PortfolioEntry {
  person: Person;
  key: number;
  zIndex: number;
}

interface ProjectEntry {
  url: string;
  title: string;
  key: number;
  zIndex: number;
}

const BASE_Z = 200;

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "about">("projects");
  const [openPortfolios, setOpenPortfolios] = useState<PortfolioEntry[]>([]);
  const [openProjects, setOpenProjects] = useState<ProjectEntry[]>([]);
  const [zCounter, setZCounter] = useState(BASE_Z);
  const keyCounter = useRef(0);

  const nextZ = () => {
    const next = zCounter + 1;
    setZCounter(next);
    return next;
  };

  const handleOpenPortfolio = (person: Person) => {
    // If already open, bring to front
    const existing = openPortfolios.find((p) => p.person.id === person.id);
    if (existing) {
      const z = zCounter + 1;
      setZCounter(z);
      setOpenPortfolios((prev) =>
        prev.map((p) => (p.key === existing.key ? { ...p, zIndex: z } : p))
      );
      return;
    }
    const key = ++keyCounter.current;
    const z = zCounter + 1;
    setZCounter(z);
    setOpenPortfolios((prev) => [...prev, { person, key, zIndex: z }]);
  };

  const handleClosePortfolio = (key: number) => {
    setOpenPortfolios((prev) => prev.filter((p) => p.key !== key));
  };

  const handleFocusPortfolio = (key: number) => {
    const z = zCounter + 1;
    setZCounter(z);
    setOpenPortfolios((prev) =>
      prev.map((p) => (p.key === key ? { ...p, zIndex: z } : p))
    );
  };

  const handleOpenProject = (url: string, title: string) => {
    const key = ++keyCounter.current;
    const z = zCounter + 1;
    setZCounter(z);
    setOpenProjects((prev) => [...prev, { url, title, key, zIndex: z }]);
  };

  const handleCloseProject = (key: number) => {
    setOpenProjects((prev) => prev.filter((p) => p.key !== key));
  };

  const handleFocusProject = (key: number) => {
    const z = zCounter + 1;
    setZCounter(z);
    setOpenProjects((prev) =>
      prev.map((p) => (p.key === key ? { ...p, zIndex: z } : p))
    );
  };

  if (showIntro) {
    return <IntroExperience onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "projects" ? (
        <>
          {/* Central search launcher */}
          <SearchLauncher onOpenPortfolio={handleOpenPortfolio} />

          {/* Open portfolio windows */}
          {openPortfolios.map((entry) => (
            <PortfolioWindow
              key={entry.key}
              person={entry.person}
              zIndex={entry.zIndex}
              onClose={() => handleClosePortfolio(entry.key)}
              onFocus={() => handleFocusPortfolio(entry.key)}
              onOpenProject={handleOpenProject}
            />
          ))}

          {/* Open project windows */}
          {openProjects.map((entry) => (
            <ProjectWindow
              key={entry.key}
              url={entry.url}
              title={entry.title}
              zIndex={entry.zIndex}
              onClose={() => handleCloseProject(entry.key)}
              onFocus={() => handleFocusProject(entry.key)}
            />
          ))}
        </>
      ) : (
        <AboutPage />
      )}
    </div>
  );
}

