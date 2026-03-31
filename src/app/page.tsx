"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import SearchLauncher from "@/components/SearchLauncher";
import PortfolioWindow from "@/components/PortfolioWindow";
import ProjectWindow from "@/components/ProjectWindow";
import AboutPage from "@/components/AboutPage";
import IntroExperience from "@/components/IntroExperience";
import { Person } from "@/lib/types";
import { people as defaultPeople } from "@/lib/data";

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
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [openPortfolios, setOpenPortfolios] = useState<PortfolioEntry[]>([]);

  // Admin auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetch("/api/people")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPeople(data); })
      .catch(() => {});
  }, []);

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    setAdminError("");
    try {
      const res = await fetch(`/api/admin?pw=${encodeURIComponent(adminPwInput)}`);
      if (res.status === 401) { setAdminError("Wrong password."); return; }
      if (!res.ok) { setAdminError("Server error."); return; }
      const data = await res.json();
      if (Array.isArray(data)) setPeople(data);
      setAdminPassword(adminPwInput);
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPwInput("");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSavePerson = async (updated: Person) => {
    const newPeople = people.map((p) => (p.id === updated.id ? updated : p));
    setPeople(newPeople);
    setOpenPortfolios((prev) =>
      prev.map((e) => (e.person.id === updated.id ? { ...e, person: updated } : e))
    );
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword, people: newPeople }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Save failed");
    }
  };

  const [openProjects, setOpenProjects] = useState<ProjectEntry[]>([]);
  const [zCounter, setZCounter] = useState(BASE_Z);
  const keyCounter = useRef(0);

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
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onAdminClick={() => setShowAdminModal(true)}
        onAdminLogout={() => { setIsAdmin(false); setAdminPassword(""); }}
      />

      {/* Admin login modal */}
      {showAdminModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => { setShowAdminModal(false); setAdminPwInput(""); setAdminError(""); }}
        >
          <div
            className="flex flex-col gap-4 p-7 rounded-2xl w-72"
            style={{ background: "#e4edf5", border: "2px solid #8aa0b8" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold" style={{ color: "#1a3a5a" }}>Admin Login</h2>
            <input
              type="password"
              autoFocus
              className="rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "#f0f5fa", border: "1.5px solid #b4c8dc", color: "#1a3a5a" }}
              placeholder="Password"
              value={adminPwInput}
              onChange={(e) => setAdminPwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            {adminError && <p className="text-xs" style={{ color: "#b02020" }}>{adminError}</p>}
            <button
              onClick={handleAdminLogin}
              disabled={adminLoading}
              className="rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: "#3a7ab8", color: "#fff", opacity: adminLoading ? 0.7 : 1 }}
            >
              {adminLoading ? "Checking…" : "Enter"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "projects" ? (
        <>
          {/* Central search launcher */}
          <SearchLauncher people={people} onOpenPortfolio={handleOpenPortfolio} />

          {/* Open portfolio windows */}
          {openPortfolios.map((entry) => (
            <PortfolioWindow
              key={entry.key}
              person={entry.person}
              zIndex={entry.zIndex}
              onClose={() => handleClosePortfolio(entry.key)}
              onFocus={() => handleFocusPortfolio(entry.key)}
              onOpenProject={handleOpenProject}
              isAdmin={isAdmin}
              onSavePerson={handleSavePerson}
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

