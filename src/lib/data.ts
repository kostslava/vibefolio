import { Person } from "./types";

export const people: Person[] = [
  {
    id: "1",
    name: "Alex Rivera",
    photo: "",
    bio: "Full-stack developer passionate about building tools that make people's lives easier.",
    socials: [
      { label: "GitHub", url: "https://github.com/alexrivera", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/alexrivera", icon: "linkedin" },
      { label: "Twitter", url: "https://twitter.com/alexrivera", icon: "twitter" },
    ],
    currentProjects: [
      {
        id: "p1",
        name: "TaskFlow",
        dateStarted: "Jan 2026",
        description: "A modern task management app with AI-powered prioritization and team collaboration features.",
        links: [
          { label: "GitHub", url: "https://github.com/alexrivera/taskflow" },
          { label: "Live Demo", url: "https://taskflow.app" },
        ],
      },
      {
        id: "p2",
        name: "DevDash",
        dateStarted: "Dec 2025",
        description: "Developer dashboard aggregating GitHub, Jira, and Slack into one unified interface.",
        links: [
          { label: "GitHub", url: "https://github.com/alexrivera/devdash" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p3",
        name: "PixelArt Studio",
        dateStarted: "Mar 2025",
        dateEnded: "Sep 2025",
        description: "Browser-based pixel art editor with layers, animation support, and export to sprite sheets.",
        links: [
          { label: "GitHub", url: "https://github.com/alexrivera/pixelart" },
          { label: "Live Site", url: "https://pixelart.studio" },
        ],
      },
      {
        id: "p4",
        name: "WeatherWise",
        dateStarted: "Jan 2025",
        dateEnded: "Mar 2025",
        description: "Minimal weather app with beautiful animations and 7-day forecasts.",
        links: [
          { label: "GitHub", url: "https://github.com/alexrivera/weatherwise" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Jordan Chen",
    photo: "",
    bio: "UI/UX designer and frontend engineer. Making the web beautiful, one pixel at a time.",
    socials: [
      { label: "GitHub", url: "https://github.com/jordanchen", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/jordanchen", icon: "linkedin" },
      { label: "Dribbble", url: "https://dribbble.com/jordanchen", icon: "dribbble" },
    ],
    currentProjects: [
      {
        id: "p5",
        name: "DesignSys",
        dateStarted: "Feb 2026",
        description: "Open-source design system with React components, Figma tokens, and comprehensive docs.",
        links: [
          { label: "GitHub", url: "https://github.com/jordanchen/designsys" },
          { label: "Docs", url: "https://designsys.dev" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p6",
        name: "Portfolio v3",
        dateStarted: "Aug 2025",
        dateEnded: "Nov 2025",
        description: "Personal portfolio with 3D WebGL background and smooth page transitions.",
        links: [
          { label: "GitHub", url: "https://github.com/jordanchen/portfolio-v3" },
          { label: "Live Site", url: "https://jordanchen.dev" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Sam Patel",
    photo: "",
    bio: "Backend wizard and data enthusiast. Building scalable systems and crunching numbers.",
    socials: [
      { label: "GitHub", url: "https://github.com/sampatel", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/sampatel", icon: "linkedin" },
      { label: "Blog", url: "https://sampatel.blog", icon: "blog" },
    ],
    currentProjects: [
      {
        id: "p7",
        name: "DataPipe",
        dateStarted: "Nov 2025",
        description: "Real-time data pipeline framework for processing millions of events per second.",
        links: [
          { label: "GitHub", url: "https://github.com/sampatel/datapipe" },
        ],
      },
      {
        id: "p8",
        name: "QueryLab",
        dateStarted: "Jan 2026",
        description: "Interactive SQL playground with AI-assisted query generation and visualization.",
        links: [
          { label: "GitHub", url: "https://github.com/sampatel/querylab" },
          { label: "Live App", url: "https://querylab.io" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p9",
        name: "LogStream",
        dateStarted: "Jun 2025",
        dateEnded: "Oct 2025",
        description: "Centralized logging solution with full-text search and alerting capabilities.",
        links: [
          { label: "GitHub", url: "https://github.com/sampatel/logstream" },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Maya Johnson",
    photo: "",
    bio: "Creative coder and open source contributor. Bridging art and technology.",
    socials: [
      { label: "GitHub", url: "https://github.com/mayajohnson", icon: "github" },
      { label: "Twitter", url: "https://twitter.com/mayajohnson", icon: "twitter" },
      { label: "LinkedIn", url: "https://linkedin.com/in/mayajohnson", icon: "linkedin" },
    ],
    currentProjects: [
      {
        id: "p10",
        name: "ArtGen",
        dateStarted: "Feb 2026",
        description: "Generative art platform using WebGL shaders and mathematical algorithms.",
        links: [
          { label: "GitHub", url: "https://github.com/mayajohnson/artgen" },
          { label: "Gallery", url: "https://artgen.gallery" },
        ],
      },
    ],
    pastProjects: [
      {
        id: "p11",
        name: "SoundScape",
        dateStarted: "Apr 2025",
        dateEnded: "Dec 2025",
        description: "Interactive audio visualization tool that creates landscapes from music.",
        links: [
          { label: "GitHub", url: "https://github.com/mayajohnson/soundscape" },
          { label: "Demo", url: "https://soundscape.app" },
        ],
      },
      {
        id: "p12",
        name: "ColorPal",
        dateStarted: "Jan 2025",
        dateEnded: "Mar 2025",
        description: "AI-powered color palette generator for designers and developers.",
        links: [
          { label: "GitHub", url: "https://github.com/mayajohnson/colorpal" },
          { label: "Live Site", url: "https://colorpal.design" },
        ],
      },
    ],
  },
];
