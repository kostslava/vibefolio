export interface Project {
  id: string;
  name: string;
  dateStarted: string;
  dateEnded?: string; // undefined means current/ongoing
  description: string;
  links: {
    label: string;
    url: string;
  }[];
}

export interface Person {
  id: string;
  name: string;
  photo: string; // URL or initials fallback
  bio: string;
  socials: {
    label: string;
    url: string;
    icon: string;
  }[];
  currentProjects: Project[];
  pastProjects: Project[];
}
