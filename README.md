# NeN Exams

**A modern online testing platform with role-based access, real-time analytics, and anti-cheat protection.**

<p align="center">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js">
  <img alt="React" src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Drizzle-003B57?logo=sqlite">
</p>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Commands](#commands)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## About the Project

NeN Exams is a full-stack web application for creating, managing, and taking online tests. It supports four distinct user roles — **Student**, **Teacher**, **Organizer**, and **Viewer** — plus a **Superuser** with full access. Built with Next.js 16 and Drizzle ORM on SQLite, it requires no external services to run.

---

## Features

| Feature | Description |
|---------|-------------|
| **Smart Test Creation** | Build tests with multiple question types — multiple choice, true/false, and short answer. Set time limits and customize point values. |
| **Anti-Cheat Protection** | Tab switch detection, clipboard blocking, right-click prevention, and server-side timer enforcement keep tests fair. |
| **Real-Time Analytics** | Track performance with detailed analytics — scores, completion rates, question-level insights, and platform-wide statistics. |
| **Schedule & Organize** | Plan test events with scheduled dates, locations, and automated reminders. |
| **Multi-Role System** | Role-based dashboards for students, teachers, organizers, and viewers — each with tailored views and permissions. |
| **Comments & Feedback** | Discuss and share feedback on tests with a built-in comment system. |
| **Dark / Light Theme** | Toggle between dark and light mode with a single click. |
| **Glass Morphism UI** | Aurora gradients, neon glows, and frosted-glass design language throughout. |
| **Superuser Access** | Bypass role restrictions with full platform visibility and control. |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js](https://nextjs.org/) 16.2.10 |
| UI Library | [React](https://react.dev/) 19.2.4 |
| Language | [TypeScript](https://www.typescriptlang.org/) 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 4 |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team/) 0.45 |
| Database | [SQLite](https://www.sqlite.org/) via better-sqlite3 |
| Auth | Session-based (bcryptjs + HTTP-only cookies) |
| Validation | [Zod](https://zod.dev/) 4 |
| UI Components | Radix UI, shadcn/ui, Base UI |
| Icons | [Lucide React](https://lucide.dev/) |
| Utilities | clsx, tailwind-merge, class-variance-authority |
| Linting | ESLint with `eslint-config-next` |

---

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── actions.ts          # Register, login, logout server actions
│   │   ├── layout.tsx           # Auth layout (aurora background)
│   │   ├── login/
│   │   │   └── page.tsx         # Sign-in page
│   │   └── register/
│   │       └── page.tsx         # Registration page
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Protected dashboard layout (sidebar + header)
│   │   ├── loading.tsx          # Loading state
│   │   ├── comments/            # Test comment pages
│   │   ├── dashboard/           # Main dashboard with role-based stats
│   │   ├── history/             # Test attempt history
│   │   ├── profile/             # User profile
│   │   ├── results/             # Results list + analytics
│   │   ├── schedule/            # Test scheduling for organizers
│   │   ├── tests/               # Test creation, listing, taking, management
│   │   └── upcoming/            # Upcoming scheduled tests
│   ├── globals.css              # Global styles + theme variables
│   ├── layout.tsx               # Root layout (fonts, theme provider)
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # shadcn/ui primitives (button, card, input, etc.)
│   ├── glass-card.tsx           # Glass morphism card wrapper
│   ├── header.tsx               # Dashboard header with mobile sidebar
│   ├── neon-icon.tsx            # Neon icon component
│   ├── role-selector.tsx        # Role picker for landing page
│   ├── sidebar.tsx              # Dashboard sidebar with role-filtered nav
│   ├── theme-provider.tsx       # next-themes provider
│   └── theme-toggle.tsx         # Dark/light toggle button
├── lib/
│   ├── auth/
│   │   ├── password.ts          # bcrypt hash/verify
│   │   └── session.ts           # Session create/get/destroy
│   ├── db/
│   │   ├── index.ts             # SQLite + Drizzle connection
│   │   └── schema.ts            # Database schema (all tables)
│   └── utils.ts                 # cn() helper (clsx + tailwind-merge)
├── data/
│   └── nen-exams.db             # SQLite database file
├── scripts/
│   └── create-superuser.ts      # CLI script to seed a superuser
├── drizzle.config.ts            # Drizzle Kit configuration
├── next.config.ts               # Next.js configuration
├── tsconfig.json
└── package.json
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User accounts with role (student, teacher, organizer, viewer, superuser) |
| `sessions` | Auth session tokens (7-day expiry) |
| `tests` | Test metadata — title, description, time limit, publish status |
| `questions` | Test questions — type (MCQ, true/false, short answer), options, correct answer, points |
| `test_attempts` | User test attempts — status, score, timestamps |
| `answers` | Individual question answers with correctness flag |
| `comments` | User comments on tests |
| `test_schedules` | Scheduled test events with date/time and location |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/Marsh-Edge/NeN-Exams.git
cd NeN-Exams
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed a Superuser

```bash
npm run create-superuser
```

Default credentials:
- **Email:** admin@nen.exams
- **Password:** Super@123

---

## Usage

### Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse available tests, take tests, view results, track history |
| **Teacher** | Create and manage tests, publish tests, review student submissions |
| **Organizer** | Schedule test events with dates, times, and locations |
| **Viewer** | Access platform-wide analytics, view reports and statistics |
| **Superuser** | Full access across all roles |

### Workflow

1. **Choose your role** on the landing page and create an account.
2. **Teachers** create tests by adding questions with types (multiple choice, true/false, short answer), setting time limits and point values.
3. **Teachers** publish tests to make them available to students.
4. **Students** browse and take published tests (with anti-cheat protections active).
5. **Organizers** schedule test events with specific dates and locations.
6. **Results** are calculated automatically — view scores, percentages, and analytics.
7. **Comment** on tests to share feedback and discuss.

---

## API Routes

All server actions are implemented as Next.js Server Actions in `app/(auth)/actions.ts` and within individual feature directories:

| Action | Description |
|--------|-------------|
| `register()` | Create a new user account (validates with Zod) |
| `login()` | Authenticate and create a session |
| `logout()` | Destroy session and clear cookie |
| Create Test | Create test with title, description, time limit |
| Add Question | Add question to a test (MCQ, true/false, short answer) |
| Publish Test | Toggle test visibility for students |
| Take Test | Start/complete test attempts with timer enforcement |
| Schedule Test | Schedule test event with date and location |
| Add Comment | Add comment to a published test |
| Update Profile | Update display name and avatar |

---

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run create-superuser  # Seed a superuser account
```

---

## Roadmap

> **TODO**

Planned features and improvements are tracked in the repository issues. Contributions are welcome.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Edge Quantum

---

## Author

Built by [Marsh-Edge](https://github.com/Marsh-Edge).
