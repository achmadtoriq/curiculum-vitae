export const defaultSeedData = {
  profile: {
    name: "Alex Bimasakti",
    title: "Senior Full-Stack Software Engineer & UI/UX Specialist",
    bio: "Passionate engineer with 6+ years of experience building modern, scalable web applications and intuitive digital experiences. Specialized in Next.js, React, Node.js, and high-performance frontend interfaces.",
    email: "alex.bimasakti@example.com",
    phone: "+62 812-3456-7890",
    location: "Jakarta, Indonesia (Available Remote)",
    avatar_url: "/avatar.jpg",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    website: "https://alexbimasakti.dev",
    resume_url: "#"
  },
  experiences: [
    {
      id: "exp-1",
      role: "Lead Full-Stack Engineer",
      company: "InnovateTech Global",
      location: "Jakarta, Indonesia",
      start_date: "2023",
      end_date: "Present",
      current: 1,
      display_order: 0,
      description: "Leading a core engineering team of 8 developers building real-time cloud collaboration tools, micro-frontend architecture, and AI-assisted workflows.",
      achievements: JSON.stringify([
        "Architected Next.js App Router design system increasing page render performance by 42%",
        "Mentored junior engineers and spearheaded automated CI/CD deployment pipelines",
        "Designed microservice API gateways using Node.js and SQLite/PostgreSQL caching"
      ])
    },
    {
      id: "exp-2",
      role: "Senior Frontend Developer",
      company: "Nexa Digital Studio",
      location: "Bandung, Indonesia",
      start_date: "2021",
      end_date: "2023",
      current: 0,
      display_order: 1,
      description: "Developed enterprise web dashboards and dynamic e-commerce platforms using React, Next.js, and CSS grid layout system.",
      achievements: JSON.stringify([
        "Reduced bundle size by 35% using dynamic lazy loading and image optimization",
        "Built responsive component library used across 12 client products"
      ])
    },
    {
      id: "exp-3",
      role: "Full-Stack Web Developer",
      company: "Creative Byte Solutions",
      location: "Yogyakarta, Indonesia",
      start_date: "2019",
      end_date: "2021",
      current: 0,
      display_order: 2,
      description: "Implemented RESTful APIs and interactive Single-Page Applications for clients in fintech and healthcare.",
      achievements: JSON.stringify([
        "Integrated secure SQLite & PostgreSQL databases handling 100k+ daily queries",
        "Designed responsive mobile-first UI with accessibility WCAG AA compliance"
      ])
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science & Information Technology",
      institution: "Universitas Gadjah Mada (UGM)",
      location: "Yogyakarta, Indonesia",
      start_date: "2015",
      end_date: "2019",
      gpa: "3.85 / 4.00 (Cum Laude)",
      display_order: 0,
      description: "Focus on Software Engineering, Database Systems, and Human-Computer Interaction. Published undergraduate paper on web UI performance metrics."
    },
    {
      id: "edu-2",
      degree: "AWS Certified Solutions Architect & Web Specialist",
      institution: "Amazon Web Services Training",
      location: "Online Certification",
      start_date: "2022",
      end_date: "2022",
      gpa: "Certified",
      display_order: 1,
      description: "Comprehensive training in cloud deployment, serverless web apps, database optimization, and web security."
    }
  ],
  skills: [
    { id: "sk-1", name: "JavaScript / ES6+", category: "Frontend", proficiency: 95, icon: "Code", display_order: 0 },
    { id: "sk-2", name: "Next.js & React", category: "Frontend", proficiency: 92, icon: "Layout", display_order: 1 },
    { id: "sk-3", name: "HTML5 / CSS3 / Glassmorphism", category: "Frontend", proficiency: 98, icon: "Eye", display_order: 2 },
    { id: "sk-4", name: "Node.js / Express", category: "Backend", proficiency: 88, icon: "Server", display_order: 3 },
    { id: "sk-5", name: "SQLite & Relational DBs", category: "Database", proficiency: 85, icon: "Database", display_order: 4 },
    { id: "sk-6", name: "RESTful & GraphQL APIs", category: "Backend", proficiency: 90, icon: "Globe", display_order: 5 },
    { id: "sk-7", name: "Git & Web Performance", category: "Tools", proficiency: 92, icon: "Zap", display_order: 6 },
    { id: "sk-8", name: "UI/UX Design & Prototyping", category: "Design", proficiency: 84, icon: "Figma", display_order: 7 }
  ],
  projects: [
    {
      id: "proj-1",
      title: "OmniFlow Cloud Analytics Dashboard",
      description: "Real-time SaaS analytics platform with customizable widget layouts, dynamic data charts, and dark-mode glassmorphism theme.",
      category: "Full-Stack",
      image_url: "/projects/project1.svg",
      live_url: "https://example.com/omniflow",
      github_url: "https://github.com",
      tags: JSON.stringify(["Next.js", "JavaScript", "SQLite", "CSS Modules"]),
      featured: 1,
      display_order: 0
    },
    {
      id: "proj-2",
      title: "Pulse-UI Design System & Component Kit",
      description: "Modern modular design library featuring accessible components, CSS grid layouts, and zero-runtime dependency utilities.",
      category: "Frontend",
      image_url: "/projects/project2.svg",
      live_url: "https://example.com/pulse-ui",
      github_url: "https://github.com",
      tags: JSON.stringify(["React", "Vanilla CSS", "Design Tokens"]),
      featured: 1,
      display_order: 1
    },
    {
      id: "proj-3",
      title: "CyberDocs Electronic Document Portal",
      description: "High-security digital signature and contract management dashboard with SQLite embedded database storage.",
      category: "Full-Stack",
      image_url: "/projects/project3.svg",
      live_url: "https://example.com/cyberdocs",
      github_url: "https://github.com",
      tags: JSON.stringify(["Node.js", "SQLite", "Next.js"]),
      featured: 0,
      display_order: 2
    }
  ]
};
