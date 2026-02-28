"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Person, Project } from "@/lib/types";
import { people as seedPeople } from "@/lib/data";

/* ─── helpers ──────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2);
}

function blankProject(isCurrent: boolean): Project {
  return {
    id: uid(),
    name: "",
    dateStarted: "",
    dateEnded: isCurrent ? undefined : "",
    description: "",
    links: [],
  };
}

function blankPerson(): Person {
  return {
    id: uid(),
    name: "",
    photo: "",
    bio: "",
    socials: [],
    currentProjects: [],
    pastProjects: [],
  };
}

/* ─── sub-components ───────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400";
  const style = { background: "#f0f5fa", border: "1.5px solid #b4c8dc", color: "#1a3a5a" };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: "#4a6a8a" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          className={cls}
          style={{ ...style, minHeight: 72, resize: "vertical" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={cls}
          style={style}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-bold uppercase tracking-wider pt-4 pb-1"
      style={{ color: "#4a6a8a", borderBottom: "1px solid #b4c8dc" }}
    >
      {children}
    </h3>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2 py-0.5 rounded"
      style={{ background: "#fce8e8", color: "#b02020", border: "1px solid #eababa" }}
    >
      Remove
    </button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
      style={{ background: "#e4f0fa", color: "#2a6aaa", border: "1px solid #a4c4e0" }}
    >
      + {label}
    </button>
  );
}

/* ─── ProjectEditor ────────────────────────────────────────────────────── */

function ProjectEditor({
  project,
  onChange,
  onRemove,
  isCurrent,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onRemove: () => void;
  isCurrent: boolean;
}) {
  const set = (key: keyof Project, val: unknown) => onChange({ ...project, [key]: val });

  return (
    <div
      className="flex flex-col gap-2 p-3 rounded-xl mb-2"
      style={{ background: "#e8f0f8", border: "1px solid #b4c8dc" }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <Field label="Name" value={project.name} onChange={(v) => set("name", v)} />
          <Field label="Started" value={project.dateStarted} onChange={(v) => set("dateStarted", v)} placeholder="e.g. Jan 2025" />
          {!isCurrent && (
            <Field label="Ended" value={project.dateEnded ?? ""} onChange={(v) => set("dateEnded", v)} placeholder="e.g. Jun 2025" />
          )}
        </div>
        <RemoveBtn onClick={onRemove} />
      </div>
      <Field label="Description" value={project.description} onChange={(v) => set("description", v)} multiline />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold" style={{ color: "#4a6a8a" }}>Links</label>
        {project.links.map((link, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <input
              className="rounded px-2 py-1 text-xs flex-1 outline-none"
              style={{ background: "#f0f5fa", border: "1px solid #b4c8dc", color: "#1a3a5a" }}
              placeholder="Label"
              value={link.label}
              onChange={(e) => {
                const links = [...project.links];
                links[i] = { ...links[i], label: e.target.value };
                set("links", links);
              }}
            />
            <input
              className="rounded px-2 py-1 text-xs flex-[2] outline-none"
              style={{ background: "#f0f5fa", border: "1px solid #b4c8dc", color: "#1a3a5a" }}
              placeholder="https://…"
              value={link.url}
              onChange={(e) => {
                const links = [...project.links];
                links[i] = { ...links[i], url: e.target.value };
                set("links", links);
              }}
            />
            <RemoveBtn onClick={() => {
              const links = project.links.filter((_, j) => j !== i);
              set("links", links);
            }} />
          </div>
        ))}
        <AddBtn
          label="Add link"
          onClick={() => set("links", [...project.links, { label: "", url: "" }])}
        />
      </div>
    </div>
  );
}

/* ─── PersonEditor ─────────────────────────────────────────────────────── */

function PersonEditor({
  person,
  onChange,
  onRemove,
}: {
  person: Person;
  onChange: (p: Person) => void;
  onRemove: () => void;
}) {
  const set = (key: keyof Person, val: unknown) => onChange({ ...person, [key]: val });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold" style={{ color: "#1a3a5a" }}>
          {person.name || "New Person"}
        </h2>
        <RemoveBtn onClick={onRemove} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" value={person.name} onChange={(v) => set("name", v)} />
        <Field label="Photo URL" value={person.photo} onChange={(v) => set("photo", v)} placeholder="https://…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Username (URL slug)"
          value={person.username ?? ""}
          onChange={(v) => set("username", v || undefined)}
          placeholder="e.g. daniel-frank"
        />
        <Field
          label="Intro Tagline"
          value={person.introTagline ?? ""}
          onChange={(v) => set("introTagline", v || undefined)}
          placeholder="One-liner shown on their landing page"
        />
      </div>
      <Field label="Bio" value={person.bio} onChange={(v) => set("bio", v)} multiline />

      {/* Socials */}
      <SectionTitle>Socials</SectionTitle>
      {person.socials.map((s, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input
            className="rounded px-2 py-1 text-xs flex-1 outline-none"
            style={{ background: "#f0f5fa", border: "1px solid #b4c8dc", color: "#1a3a5a" }}
            placeholder="Label (e.g. GitHub)"
            value={s.label}
            onChange={(e) => {
              const socials = [...person.socials];
              socials[i] = { ...socials[i], label: e.target.value };
              set("socials", socials);
            }}
          />
          <input
            className="rounded px-2 py-1 text-xs flex-[2] outline-none"
            style={{ background: "#f0f5fa", border: "1px solid #b4c8dc", color: "#1a3a5a" }}
            placeholder="https://…"
            value={s.url}
            onChange={(e) => {
              const socials = [...person.socials];
              socials[i] = { ...socials[i], url: e.target.value };
              set("socials", socials);
            }}
          />
          <input
            className="rounded px-2 py-1 text-xs w-20 outline-none"
            style={{ background: "#f0f5fa", border: "1px solid #b4c8dc", color: "#1a3a5a" }}
            placeholder="icon"
            value={s.icon}
            onChange={(e) => {
              const socials = [...person.socials];
              socials[i] = { ...socials[i], icon: e.target.value };
              set("socials", socials);
            }}
          />
          <RemoveBtn onClick={() => set("socials", person.socials.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn
        label="Add social"
        onClick={() => set("socials", [...person.socials, { label: "", url: "", icon: "" }])}
      />

      {/* Current Projects */}
      <SectionTitle>Current Projects</SectionTitle>
      {person.currentProjects.map((p, i) => (
        <ProjectEditor
          key={p.id}
          project={p}
          isCurrent
          onChange={(updated) => {
            const arr = [...person.currentProjects];
            arr[i] = updated;
            set("currentProjects", arr);
          }}
          onRemove={() => set("currentProjects", person.currentProjects.filter((_, j) => j !== i))}
        />
      ))}
      <AddBtn
        label="Add current project"
        onClick={() => set("currentProjects", [...person.currentProjects, blankProject(true)])}
      />

      {/* Past Projects */}
      <SectionTitle>Past Projects</SectionTitle>
      {person.pastProjects.map((p, i) => (
        <ProjectEditor
          key={p.id}
          project={p}
          isCurrent={false}
          onChange={(updated) => {
            const arr = [...person.pastProjects];
            arr[i] = updated;
            set("pastProjects", arr);
          }}
          onRemove={() => set("pastProjects", person.pastProjects.filter((_, j) => j !== i))}
        />
      ))}
      <AddBtn
        label="Add past project"
        onClick={() => set("pastProjects", [...person.pastProjects, blankProject(false)])}
      />
    </div>
  );
}

/* ─── Main Admin Page ──────────────────────────────────────────────────── */

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch(`/api/admin?pw=${encodeURIComponent(pw)}`);
    if (res.status === 401) {
      setAuthError("Wrong password.");
      return;
    }
    if (!res.ok) {
      setAuthError("Server error. Try again.");
      return;
    }
    const data = await res.json();
    // Auto-fill any missing username / introTagline from seed data (matched by id)
    const merged: Person[] = (Array.isArray(data) ? data : []).map((p: Person) => {
      const seed = seedPeople.find((s) => s.id === p.id);
      return {
        ...p,
        username: p.username ?? seed?.username,
        introTagline: p.introTagline ?? seed?.introTagline,
      };
    });
    setPeople(merged);
    setPassword(pw);
    setAuthed(true);
    setSelectedIdx(0);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, people }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveMsg("Saved successfully!");
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? `Error: ${err.message}` : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updatePerson = (idx: number, updated: Person) => {
    const next = [...people];
    next[idx] = updated;
    setPeople(next);
    setSaveMsg("");
  };

  /* ── Password gate ─── */
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#d0dcea" }}
      >
        <div
          className="flex flex-col gap-4 p-8 rounded-2xl w-80"
          style={{ background: "#e4edf5", border: "2px solid #8aa0b8" }}
        >
          <h1 className="text-xl font-bold text-center" style={{ color: "#1a3a5a" }}>
            Admin Login
          </h1>
          <input
            type="password"
            className="rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "#f0f5fa", border: "1.5px solid #b4c8dc", color: "#1a3a5a" }}
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {authError && (
            <p className="text-xs text-center" style={{ color: "#b02020" }}>
              {authError}
            </p>
          )}
          <button
            onClick={handleLogin}
            className="rounded-xl py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "#3a7ab8", color: "#fff" }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  /* ── Edit UI ─── */
  return (
    <div className="min-h-screen flex" style={{ background: "#d0dcea" }}>
      {/* Sidebar */}
      <div
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 220,
          background: "#c0d0e0",
          borderRight: "2px solid #8aa0b8",
          padding: "16px 12px",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Link href="/" className="text-xs" style={{ color: "#4a6a8a" }}>
            ← Back to site
          </Link>
        </div>
        <h2 className="text-sm font-bold mb-3" style={{ color: "#1a3a5a" }}>
          People
        </h2>
        {people.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setSelectedIdx(i)}
            className="text-left px-3 py-2 rounded-xl mb-1 text-sm font-medium transition-colors"
            style={{
              background: selectedIdx === i ? "#3a7ab8" : "transparent",
              color: selectedIdx === i ? "#fff" : "#2a4a6a",
            }}
          >
            {p.name || `Person ${i + 1}`}
          </button>
        ))}
        <button
          onClick={() => {
            const next = [...people, blankPerson()];
            setPeople(next);
            setSelectedIdx(next.length - 1);
          }}
          className="mt-2 text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: "#e4f0fa", color: "#2a6aaa", border: "1px solid #a4c4e0" }}
        >
          + Add person
        </button>

        {/* Save */}
        <div className="mt-auto pt-6 flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl py-2 text-sm font-semibold transition-colors"
            style={{ background: saving ? "#a0b8cc" : "#3a7ab8", color: "#fff" }}
          >
            {saving ? "Saving…" : "Save All"}
          </button>
          {saveMsg && (
            <p
              className="text-xs text-center"
              style={{
                color: saveMsg.startsWith("Error") ? "#b02020" : "#1a7a3a",
              }}
            >
              {saveMsg}
            </p>
          )}
          {!process.env.NEXT_PUBLIC_BLOB_CONFIGURED && (
            <p className="text-[10px] text-center" style={{ color: "#7a8a9a" }}>
              Note: add Vercel Blob storage to your project for changes to persist across deployments.
            </p>
          )}
        </div>
      </div>

      {/* Edit panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {people.length === 0 ? (
          <p style={{ color: "#4a6a8a" }}>No people yet. Add one!</p>
        ) : (
          <PersonEditor
            key={people[selectedIdx]?.id}
            person={people[selectedIdx]}
            onChange={(updated) => updatePerson(selectedIdx, updated)}
            onRemove={() => {
              const next = people.filter((_, i) => i !== selectedIdx);
              setPeople(next);
              setSelectedIdx(Math.max(0, selectedIdx - 1));
            }}
          />
        )}
      </div>
    </div>
  );
}
