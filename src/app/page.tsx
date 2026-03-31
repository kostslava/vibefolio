"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import SearchLauncher from "@/components/SearchLauncher";
import PortfolioWindow from "@/components/PortfolioWindow";
import ProjectWindow, { getProjectFaviconUrl, getProjectDomain } from "@/components/ProjectWindow";
import AboutPage from "@/components/AboutPage";
import IntroExperience from "@/components/IntroExperience";
import { Person } from "@/lib/types";
import { people as defaultPeople } from "@/lib/data";

interface PortfolioEntry {
  person: Person;
  key: number;
  zIndex: number;
  minimized: boolean;
}

interface ProjectEntry {
  url: string;
  title: string;
  key: number;
  zIndex: number;
  minimized: boolean;
}

const BASE_Z = 200;

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "about">("projects");
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [openPortfolios, setOpenPortfolios] = useState<PortfolioEntry[]>([]);
  const autoOpenDoneRef = useRef(false);
  // Read ?portfolio= param once on mount to decide whether to skip intro
  const portfolioParamRef = useRef<string | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("portfolio");
    portfolioParamRef.current = p;
    if (p) setShowIntro(false);
  }, []);

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

  // Auto-open portfolio from ?portfolio= query param (used by /[username] pages)
  useEffect(() => {
    const portfolioParam = portfolioParamRef.current;
    if (!portfolioParam || autoOpenDoneRef.current || showIntro) return;
    const match = people.find(
      (p) => p.username === portfolioParam || p.id === portfolioParam
    );
    if (!match) return;
    autoOpenDoneRef.current = true;
    const key = ++keyCounter.current;
    const z = BASE_Z + 1;
    setZCounter(z);
    setOpenPortfolios([{ person: match, key, zIndex: z, minimized: false }]);
  }, [people, showIntro]);

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
    // If already open (even minimized), bring to front / restore
    const existing = openPortfolios.find((p) => p.person.id === person.id);
    if (existing) {
      const z = zCounter + 1;
      setZCounter(z);
      setOpenPortfolios((prev) =>
        prev.map((p) => (p.key === existing.key ? { ...p, zIndex: z, minimized: false } : p))
      );
      return;
    }
    const key = ++keyCounter.current;
    const z = zCounter + 1;
    setZCounter(z);
    setOpenPortfolios((prev) => [...prev, { person, key, zIndex: z, minimized: false }]);
  };

  const handleClosePortfolio = (key: number) => {
    setOpenPortfolios((prev) => prev.filter((p) => p.key !== key));
  };

  const handleMinimizePortfolio = (key: number) => {
    setOpenPortfolios((prev) =>
      prev.map((p) => (p.key === key ? { ...p, minimized: true } : p))
    );
  };

  const handleRestorePortfolio = (key: number) => {
    const z = zCounter + 1;
    setZCounter(z);
    setOpenPortfolios((prev) =>
      prev.map((p) => (p.key === key ? { ...p, minimized: false, zIndex: z } : p))
    );
  };

  const handleFocusPortfolio = (key: number) => {
    const z = zCounter + 1;
    setZCounter(z);
    setOpenPortfolios((prev) =>
      prev.map((p) => (p.key === key ? { ...p, zIndex: z } : p))
    );
  };

  const handleOpenProject = (url: string, title: string) => {
    const existing = openProjects.find((p) => p.url === url);
    if (existing) {
      const z = zCounter + 1;
      setZCounter(z);
      setOpenProjects((prev) => prev.map((p) => p.key === existing.key ? { ...p, zIndex: z, minimized: false } : p));
      return;
    }
    const key = ++keyCounter.current;
    const z = zCounter + 1;
    setZCounter(z);
    setOpenProjects((prev) => [...prev, { url, title, key, zIndex: z, minimized: false }]);
  };

  const handleCloseProject = (key: number) => {
    setOpenProjects((prev) => prev.filter((p) => p.key !== key));
  };

  const handleMinimizeProject = (key: number) => {
    setOpenProjects((prev) => prev.map((p) => p.key === key ? { ...p, minimized: true } : p));
  };

  const handleRestoreProject = (key: number) => {
    const z = zCounter + 1;
    setZCounter(z);
    setOpenProjects((prev) => prev.map((p) => p.key === key ? { ...p, minimized: false, zIndex: z } : p));
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
              minimized={entry.minimized}
              onClose={() => handleClosePortfolio(entry.key)}
              onMinimize={() => handleMinimizePortfolio(entry.key)}
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
              minimized={entry.minimized}
              onClose={() => handleCloseProject(entry.key)}
              onMinimize={() => handleMinimizeProject(entry.key)}
              onFocus={() => handleFocusProject(entry.key)}
            />
          ))}

          {/* macOS-style taskbar for minimized windows */}
          {(openPortfolios.some((e) => e.minimized) || openProjects.some((e) => e.minimized)) && (
            <div
              className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2 px-4 py-2 rounded-2xl z-[9999]"
              style={{
                background: "rgba(200, 216, 232, 0.85)",
                border: "1.5px solid #a0b4c8",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              {/* Minimized portfolio windows */}
              {openPortfolios.filter((e) => e.minimized).map((entry) => {
                const initials = entry.person.name.split(" ").map((n) => n[0]).join("").toUpperCase();
                return (
                  <button
                    key={entry.key}
                    onClick={() => handleRestorePortfolio(entry.key)}
                    title={entry.person.name}
                    className="group flex flex-col items-center gap-1 transition-transform duration-150 hover:scale-110 active:scale-95"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden"
                      style={{ background: entry.person.photo ? "transparent" : "#dce6f0", border: "2px solid #8aa0b8", color: "#2a4a6a", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                    >
                      {entry.person.photo
                        ? <img src={entry.person.photo} alt={entry.person.name} className="w-full h-full object-cover" />
                        : initials}
                    </div>
                    <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ color: "#2a4a6a" }}>
                      {entry.person.name.split(" ")[0]}
                    </span>
                    <div className="w-1 h-1 rounded-full" style={{ background: "#4a8ab8" }} />
                  </button>
                );
              })}
              {/* Minimized project/site windows */}
              {openProjects.filter((e) => e.minimized).map((entry) => {
                const favicon = getProjectFaviconUrl(entry.url);
                const domain = getProjectDomain(entry.url);
                const shortName = domain.replace(/^www\./, "").split(".")[0];
                return (
                  <button
                    key={entry.key}
                    onClick={() => handleRestoreProject(entry.key)}
                    title={entry.title}
                    className="group flex flex-col items-center gap-1 transition-transform duration-150 hover:scale-110 active:scale-95"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden"
                      style={{ background: favicon ? "#fff" : "#dce6f0", border: "2px solid #8aa0b8", color: "#2a4a6a", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                    >
                      {favicon
                        ? <img src={favicon} alt={domain} className="w-7 h-7 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        : shortName.slice(0, 2).toUpperCase()
                      }
                    </div>
                    <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ color: "#2a4a6a" }}>
                      {shortName}
                    </span>
                    <div className="w-1 h-1 rounded-full" style={{ background: "#4a8ab8" }} />
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <AboutPage />
      )}
    </div>
  );
}

