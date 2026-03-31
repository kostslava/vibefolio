import { Person } from "./types";

export const people: Person[] = [
  {
    id: "1",
    name: "Slava Kostrubin",
    photo: "",
    bio: "Full-stack builder obsessed with crafting experiences that feel alive. Making the web weird and wonderful.",
    socials: [
      { label: "GitHub", url: "https://github.com/slavakost", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/slavakost", icon: "linkedin" },
      { label: "Twitter", url: "https://twitter.com/slavakost", icon: "twitter" },
    ],
    currentProjects: [
      {
        id: "p1",
        name: "Vibefolio",
        dateStarted: "Feb 2026",
        description: "A playful portfolio platform where creativity meets functionality. Dragging, dropping, and vibing.",
        links: [
          { label: "GitHub", url: "https://github.com/slavakost/vibefolio" },
          { label: "Live Site", url: "https://vibefolio.site" },
        ],
      },
      {
        id: "p2",
        name: "Mood Canvas",
        dateStarted: "Jan 2026",
        description: "Real-time collaborative drawing app with emotion-based color palettes.",
        links: [
          { label: "GitHub", url: "https://github.com/slavakost/moodcanvas" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p3",
        name: "RetroWave FM",
        dateStarted: "Aug 2025",
        dateEnded: "Dec 2025",
        description: "80s-inspired internet radio with WebGL visualizations and nostalgic UI.",
        links: [
          { label: "GitHub", url: "https://github.com/slavakost/retrowavefm" },
          { label: "Listen", url: "https://retrowavefm.com" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Daniel Frank",
    photo: "",
    bio: "Design thinker & code poet. I build interfaces that people actually want to use.",
    socials: [
      { label: "GitHub", url: "https://github.com/danielfrank", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/danielfrank", icon: "linkedin" },
      { label: "Dribbble", url: "https://dribbble.com/danielfrank", icon: "dribbble" },
    ],
    currentProjects: [
      {
        id: "p4",
        name: "SketchKit",
        dateStarted: "Dec 2025",
        description: "Design system for developers who can't design. Component library with personality.",
        links: [
          { label: "GitHub", url: "https://github.com/danielfrank/sketchkit" },
          { label: "Docs", url: "https://sketchkit.design" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p5",
        name: "Type Racer Pro",
        dateStarted: "May 2025",
        dateEnded: "Oct 2025",
        description: "Competitive typing game with live multiplayer and custom themes.",
        links: [
          { label: "GitHub", url: "https://github.com/danielfrank/typeracer" },
          { label: "Play", url: "https://typeracerpro.io" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Isaac Toop",
    photo: "",
    bio: "Backend sorcerer and API architect. Making servers sing and databases dance.",
    socials: [
      { label: "GitHub", url: "https://github.com/isaactoop", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/isaactoop", icon: "linkedin" },
      { label: "Blog", url: "https://isaactoop.dev", icon: "blog" },
    ],
    currentProjects: [
      {
        id: "p6",
        name: "EdgeCache",
        dateStarted: "Jan 2026",
        description: "Distributed caching layer that's ridiculously fast. Redis but make it fun.",
        links: [
          { label: "GitHub", url: "https://github.com/isaactoop/edgecache" },
        ],
      },
      {
        id: "p7",
        name: "DevMetrics",
        dateStarted: "Nov 2025",
        description: "Analytics dashboard for engineering teams. Know your velocity without losing your mind.",
        links: [
          { label: "GitHub", url: "https://github.com/isaactoop/devmetrics" },
          { label: "Demo", url: "https://devmetrics.app" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p8",
        name: "LogHero",
        dateStarted: "Mar 2025",
        dateEnded: "Sep 2025",
        description: "Log aggregation tool with AI-powered insights and beautiful graphs.",
        links: [
          { label: "GitHub", url: "https://github.com/isaactoop/loghero" },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Evan Lazare",
    photo: "",
    bio: "Creative technologist exploring the intersection of art, code, and human experience.",
    socials: [
      { label: "GitHub", url: "https://github.com/evanlazare", icon: "github" },
      { label: "Twitter", url: "https://twitter.com/evanlazare", icon: "twitter" },
      { label: "Instagram", url: "https://instagram.com/evanlazare", icon: "instagram" },
    ],
    currentProjects: [
      {
        id: "p9",
        name: "Sonic Garden",
        dateStarted: "Feb 2026",
        description: "Interactive generative music experience that grows with your interactions.",
        links: [
          { label: "GitHub", url: "https://github.com/evanlazare/sonicgarden" },
          { label: "Experience", url: "https://sonicgarden.art" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p10",
        name: "Pixel Poetry",
        dateStarted: "Jun 2025",
        dateEnded: "Dec 2025",
        description: "AI-generated pixel art from text prompts. Tiny art, big vibes.",
        links: [
          { label: "GitHub", url: "https://github.com/evanlazare/pixelpoetry" },
          { label: "Gallery", url: "https://pixelpoetry.art" },
        ],
      },
      {
        id: "p11",
        name: "Mood Mixer",
        dateStarted: "Jan 2025",
        dateEnded: "May 2025",
        description: "Spotify playlist generator based on your current emotion.",
        links: [
          { label: "GitHub", url: "https://github.com/evanlazare/moodmixer" },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Arman Amerian",
    photo: "",
    bio: "Product engineer with a thing for delightful UX. Building tools that spark joy.",
    socials: [
      { label: "GitHub", url: "https://github.com/armanamerian", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/armanamerian", icon: "linkedin" },
      { label: "Twitter", url: "https://twitter.com/armanamerian", icon: "twitter" },
    ],
    currentProjects: [
      {
        id: "p12",
        name: "QuickNotes",
        dateStarted: "Jan 2026",
        description: "Note-taking app that's actually fast. No bloat, just notes.",
        links: [
          { label: "GitHub", url: "https://github.com/armanamerian/quicknotes" },
          { label: "Try It", url: "https://quicknotes.app" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p13",
        name: "Focus Timer",
        dateStarted: "Aug 2025",
        dateEnded: "Dec 2025",
        description: "Pomodoro timer with ambient sounds and productivity insights.",
        links: [
          { label: "GitHub", url: "https://github.com/armanamerian/focustimer" },
          { label: "Use It", url: "https://focustimer.io" },
        ],
      },
      {
        id: "p14",
        name: "Bookmark Manager",
        dateStarted: "Mar 2025",
        dateEnded: "Jul 2025",
        description: "Visual bookmark manager that doesn't suck.",
        links: [
          { label: "GitHub", url: "https://github.com/armanamerian/bookmarks" },
        ],
      },
    ],
  },
];
