import { Person } from "./types";

export const people: Person[] = [
  {
    id: "1",
    name: "Slava Kostrubin",
    username: "slava-kostrubin",
    introTagline: "Full-stack dev making the internet cooler, one project at a time.",
    photo: "",
    bio: "Full-stack developer passionate about building interactive web experiences. I have multiple projects under my belt, including websites, games, ",
    socials: [
      { label: "GitHub", url: "https://github.com/kostslava", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/slavakost", icon: "linkedin" },
      { label: "Twitter", url: "https://twitter.com/slavakost", icon: "twitter" },
    ],
    currentProjects: [
      {
        id: "p1",
        name: "Vibefolio",
        dateStarted: "Feb 2026",
        description: "Interactive portfolio site for developers. A place where people I've connected with can show off what they're building.",
        links: [
          { label: "Live Site", url: "https://vibefolio.site" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p2",
        name: "CasinoDubs",
        dateStarted: "2024",
        dateEnded: "2025",
        description: "A free casino site where you play with credits — no real money, all the fun.",
        links: [
          { label: "Live Site", url: "https://casinodubs.ca" },
        ],
      },
      {
        id: "p3",
        name: "Pontune",
        dateStarted: "2024",
        dateEnded: "2025",
        description: "A coding learning site where people can learn to code through interactive lessons and projects.",
        links: [
          { label: "Live Site", url: "https://pontune.site" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Daniel Frank",
    username: "daniel-frank",
    photo: "",
    bio: "Design thinker & code poet. I build interfaces that people actually want to use.",
    socials: [
      { label: "GitHub", url: "https://github.com/danielfrank", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/danielfrank", icon: "linkedin" },
      { label: "Dribbble", url: "https://dribbble.com/danielfrank", icon: "dribbble" },
    ],
    currentProjects: [],
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
    username: "isaac-toop",
    photo: "",
    bio: "Backend sorcerer and API architect. Making servers sing and databases dance.",
    socials: [
      { label: "GitHub", url: "https://github.com/isaactoop", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/isaactoop", icon: "linkedin" },
      { label: "Blog", url: "https://isaactoop.dev", icon: "blog" },
    ],
    currentProjects: [],
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
    username: "evan-lazare",
    photo: "",
    bio: "Creative technologist exploring the intersection of art, code, and human experience.",
    socials: [
      { label: "GitHub", url: "https://github.com/evanlazare", icon: "github" },
      { label: "Twitter", url: "https://twitter.com/evanlazare", icon: "twitter" },
      { label: "Instagram", url: "https://instagram.com/evanlazare", icon: "instagram" },
    ],
    currentProjects: [],
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
    username: "arman-amerian",
    photo: "",
    bio: "Product engineer with a thing for delightful UX. Building tools that spark joy.",
    socials: [
      { label: "GitHub", url: "https://github.com/armanamerian", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/armanamerian", icon: "linkedin" },
      { label: "Twitter", url: "https://twitter.com/armanamerian", icon: "twitter" },
    ],
    currentProjects: [],
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
