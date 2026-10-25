export const PROJECTS_DATA = [
  {
    id: "atttc",
    index: "01",
    title: "Agnel Trade Test & Training Portal",
    titleLink: "https://atttc.cloud/",
    badges: [
      { text: "🟢 Live", className: "badge badge-live" }
    ],
    links: [
      {
        text: "Live",
        href: "https://atttc.cloud/",
        icon: "open_in_new",
        className: "project-link",
        external: true
      },
      {
        text: "4iStudios",
        href: "http://4istudios.in/",
        icon: "business",
        className: "project-link",
        external: true
      }
    ],
    desc: "Developed a production-ready candidate assessment portal for Agnel Trade Test Centre under 4iStudios, featuring secure role-based workflows, automated certificate generation, and cloud backup automation.",
    highlights: [
      "Role-based workflow (Office, Assessor, Validator).",
      "AES-256 signature encryption.",
      "Dynamic PDF certificate generation.",
      "Automated SQL/Excel backups to Cloudflare R2 using Celery.",
      "Rate limiting, CAPTCHA, and custom security middleware."
    ],
    tech: ["Django", "PostgreSQL", "Celery", "Redis", "Cloudflare R2", "AES-256"],
    category: "Assessment Portal",
    accent: "#059669"
  },
  {
    id: "mitrai",
    index: "02",
    title: "Mitrai",
    titleLink: "https://mitrai.online/",
    badges: [
      { text: "🟢 Live", className: "badge badge-live" }
    ],
    links: [
      {
        text: "Live",
        href: "https://mitrai.online/",
        icon: "open_in_new",
        className: "project-link",
        external: true
      },
      {
        text: "Pitch Deck",
        href: "https://docs.google.com/presentation/d/1oUYzCvxEDUANjj_x1ySZQb_4EXVojhCn-rn3ca71h50/edit?usp=sharing",
        icon: "slideshow",
        className: "project-link",
        external: true
      }
    ],
    desc: "Built a proactive AI companion that remembers conversations, follows up on user goals, and initiates context-aware conversations instead of waiting for prompts. Designed to create personalized AI personas with long-term memory and natural interactions.",
    highlights: [
      "Proactive AI conversations powered by Celery scheduling.",
      "Persona creation with customizable behavior and personality.",
      "WhatsApp chat import for personalized communication style.",
      "Long-term memory with semantic retrieval for efficient context.",
      "Encrypted message storage for improved privacy.",
      "Django + PostgreSQL + Redis backend with Gemini-powered responses."
    ],
    tech: ["Django", "PostgreSQL", "Celery", "Redis", "Google GenAI", "Telegram"],
    category: "Proactive AI Companion",
    accent: "#6366f1"
  },
  {
    id: "gamified",
    index: "03",
    title: "GamiFied Platform",
    titleLink: "https://youtu.be/sImDXZpd__Q",
    badges: [
      { text: "⭐ SIH 2024 Finalist", className: "badge badge-featured" }
    ],
    links: [
      {
        text: "Demo",
        href: "https://youtu.be/sImDXZpd__Q",
        icon: "play_circle",
        className: "project-link",
        external: true
      },
      {
        text: "PPT",
        href: "https://drive.google.com/file/d/1NKEZPcyvM1BMwsnfGxTPziXDk7wbC9U8/view?usp=sharing",
        icon: "slideshow",
        className: "project-link",
        external: true
      }
    ],
    desc: "Built an AI-powered gamified learning platform that converts uploaded textbooks into personalized games, quizzes, and interactive study experiences across six multiplayer educational games.",
    highlights: [
      "AI-powered textbook ingestion and automated learning content generation.",
      "Six multiplayer educational games with adaptive gameplay.",
      "Dynamic AI-generated question banks and quizzes.",
      "Voice AI companion for interactive learning.",
      "Personalized learning analytics and diagnostic reports.",
      "Backend built with Django, PostgreSQL, Redis, and LLM integration."
    ],
    tech: ["Django", "JavaScript", "PostgreSQL", "Leaderboard"],
    category: "AI Gamified EdTech",
    accent: "#d97706"
  },
  {
    id: "mentorconnect",
    index: "04",
    title: "MentorConnect",
    titleLink: "https://youtu.be/K0wMbqKav3Q",
    badges: [
      { text: "⭐ YUKTI 2025–26 Finalist", className: "badge badge-featured" }
    ],
    links: [
      {
        text: "Demo",
        href: "https://youtu.be/K0wMbqKav3Q",
        icon: "play_circle",
        className: "project-link",
        external: true
      },
      {
        text: "PPT",
        href: "https://docs.google.com/presentation/d/18gZvTnmns7fKk7o_HeOOsrgzzXewCXnX/edit?usp=sharing&ouid=116282146601498084420&rtpof=true&sd=true",
        icon: "slideshow",
        className: "project-link",
        external: true
      },
      {
        text: "Photos",
        href: "#gallery",
        icon: "photo_library",
        className: "project-link",
        external: false
      }
    ],
    desc: "Built a mentoring platform that digitized mentor-student interactions for the Computer Engineering Department at Fr. CRCE. The system replaces manual paperwork while helping mentors track student performance.",
    highlights: [
      "Selected as Finalist for YUKTI Innovation Challenge 2025–26 & awarded AICTE Productization Fellowship.",
      "Eliminated offline mentoring paperwork.",
      "Student performance dashboards and analytics.",
      "RAG-powered AI assistant for contextual student insights.",
      "Django REST backend with PostgreSQL.",
      "Currently serving approximately 300 students."
    ],
    tech: ["Django", "PostgreSQL"],
    thumbs: [
      {
        img: "./images/mentorconnect1.jpg",
        title: "MentorConnect — Live Faculty & Student Demo",
        alt: "MentorConnect Demo"
      },
      {
        img: "./images/mentorconnect2.jpg",
        title: "MentorConnect — Computer Lab Portal Demonstration",
        alt: "MentorConnect Lab Walkthrough"
      },
      {
        img: "./images/mentorconnect4.jpg",
        title: "MentorConnect — Department Mentoring Session at Fr. CRCE",
        alt: "MentorConnect Session"
      }
    ],
    category: "Mentorship & RAG",
    accent: "#0284c7"
  },
  {
    id: "twist-tac-toe",
    index: "05",
    title: "Twist-Tac-Toe",
    titleLink: "https://twist-tac-toe.web.app/",
    badges: [
      { text: "🟢 Live", className: "badge badge-live" }
    ],
    links: [
      {
        text: "Web",
        href: "https://twist-tac-toe.web.app/",
        icon: "open_in_new",
        className: "project-link",
        external: true
      },
      {
        text: "Demo",
        href: "#",
        icon: "play_circle",
        className: "project-link video-trigger",
        dataVideo: "videos/ttt_ad%20(1).mp4",
        dataTitle: "Twist-Tac-Toe Demo",
        external: false
      },
      {
        text: "App",
        href: "https://drive.google.com/file/d/1eSmbyehbxXnMRZWyNsOvNXNgAcqYpdos/view?usp=drive_link",
        icon: "download",
        className: "project-link",
        external: true
      }
    ],
    desc: "A modern, highly strategic, and AI-powered adaptation of the classic Tic-Tac-Toe game. Built as a multi-platform Flutter application backed by an administrative Python AIOHTTP/Flask server with Google Gemini-driven personalized notifications.",
    highlights: [
      "Hidden cards, sabotage, and hand-building mechanics that resolve solved-game draws.",
      "Multi-platform support (iOS, Android, Web, Desktop) built using Flutter.",
      "Python AIOHTTP/Flask server with real-time leaderboard listener.",
      "Google Gemini-powered push notifications generating personalized Gen Z-style notifications.",
      "Dynamic game modes: Classic, Arranger 1.0 (hand sabotage), and Arranger 2.0 (Last-In-First-Out play with Center Trap rules).",
      "Social features including QR-code matchmaking and Firebase Realtime Database lobbies."
    ],
    tech: ["Flutter", "AIOHTTP", "Flask", "Firebase", "Google Gemini", "Provider"],
    category: "AI Multi-Platform Game",
    accent: "#db2777"
  },
  {
    id: "splitkar",
    index: "06",
    title: "SplitKar",
    titleLink: "https://github.com/NISHANTTMAURYA/SplitKar/blob/main/README-TECHNICAL.md",
    badges: [
      { text: "🚀 Full-Stack App", className: "badge badge-featured" }
    ],
    links: [
      {
        text: "GitHub",
        href: "https://github.com/NISHANTTMAURYA/SplitKar/blob/main/README-TECHNICAL.md",
        icon: "code",
        className: "project-link",
        external: true
      },
      {
        text: "App",
        href: "https://drive.google.com/file/d/1YkRqrnl84ojWFfHxBdZ5lG7WEnfVPO2a/view?usp=drive_link",
        icon: "download",
        className: "project-link",
        external: true
      }
    ],
    desc: "Built a full-stack expense management platform with secure authentication, group collaboration, and scalable backend APIs for managing shared expenses. Designed as a modern Flutter application backed by Django REST Framework, with a strong foundation for future expense splitting, shared wallets, and payment integration.",
    highlights: [
      "Google Sign-In with secure JWT-based authentication and automatic session management.",
      "Friends, groups, invitations, and notification system for collaborative expense management.",
      "Scalable REST APIs built using Django REST Framework.",
      "Flutter mobile application with Provider state management and local caching.",
      "Modular backend architecture designed for future expense tracking, shared wallets, and payment integration."
    ],
    tech: ["Flutter", "Django REST Framework", "PostgreSQL", "JWT Authentication", "Google Sign-In", "Provider"],
    category: "Expense Management",
    accent: "#7c3aed"
  }
];
