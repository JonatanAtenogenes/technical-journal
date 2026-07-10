# Case Studies

> A personal platform for documenting software and data analysis projects.

_(Temporary name — may change later)_

## Description

**Case Studies** is a technical library where I document my projects professionally, explaining not only the final result but the entire development process: design decisions, architecture, problems encountered, and lessons learned.

It is not a blog, a CMS, or a second portfolio. It exists to answer one specific question:

> **How do I work as an engineer, and how do I solve problems?**

## Relationship with the main portfolio

This project works alongside my main portfolio (built with Astro), but each one serves a different purpose:

|                       | Portfolio (Astro)                                                  | Case Studies (Next.js)                     |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| **Role**              | Entry point                                                        | Technical documentation                    |
| **Goal**              | Quickly show who I am, my tech stack, experience, and contact info | Explain in depth how I solved each project |
| **Style**             | Fast, clean, simple                                                | Focused on reading and understanding       |
| **Links per project** | Demo, GitHub, Case Study                                           | —                                          |

The visitor decides whether to go deeper only if they're interested.

## Target audience

- Recruiters
- Engineers
- Technical leads
- Anyone interested in how I approach my work

The site should be understandable even to someone who has never seen the original project.

## Philosophy

- **Content** is the protagonist; the interface only exists to support reading.
- Navigation should feel closer to modern technical documentation than to a traditional blog.
- The goal is not to impress with animations. The goal is to explain engineering.

**Design references** (combined, not copied):

- Medium — reading experience
- Vercel Docs — cleanliness
- GitHub Docs — documentation structure
- Stripe Docs — organization

## Architecture

The platform is fully static. It does not use an API to fetch content; everything lives within the project itself.

```
content/
├── employee-training/
│   ├── metadata.ts
│   ├── index.mdx
│   └── images/
│
└── home-server/
    ├── metadata.ts
    ├── index.mdx
    └── images/
```

### Separation of concerns

**`metadata.ts`** — structured information (title, description, technologies, tags, GitHub link, cover image, date, status). Used to automatically build cards, filters, navigation, SEO, and related projects.

**`index.mdx`** — pure content of the Case Study (explanation, images, code, diagrams, conclusions). It never contains site navigation logic.

### Project types

- **Simple project** — a single document (e.g., _Employee Training Analysis_): introduction, problem, development, results, lessons learned.
- **Large project** — a single Case Study with multiple internal sections, even if it combines several technologies (e.g., _Home Server_ with React, .NET, Rust, Docker, Linux). No separate entries are created; the full story belongs to the same project.

## Navigation

There are only two views:

1. **Home** — general hero, site description, list of Case Studies, tag filters, project cards.
2. **Project page** — Hero, then MDX content, then footer. All navigation happens within the same page.

### Project hero

Shows only: name, short description, technologies, estimated reading time (planned for later), and date (optional). It should immediately answer: **what am I about to read?**

### Content structure (MDX)

A consistent structure, although not every project uses exactly the same sections:

```
Introduction
Problem
Objectives
Architecture
Implementation
Results
Lessons learned
Next steps
```

### Table of contents

Automatically generated from the MDX headings. Sticky on desktop, always visible, highlights the current section, and allows quick navigation.

### Reading progress bar

- **Desktop:** a fixed footer, discreet, always visible, shows approximate reading progress.
- **Mobile:** a thin line below the header, no percentage shown, purely a visual reference.

### Filters

Based solely on tags pulled automatically from the metadata (e.g., React, Rust, .NET, SQL, Docker, Linux, Data, Backend, Frontend). There are no separate categories.

## Components

- `ProjectHero`
- `ProjectCard`
- `Tag`
- `TableOfContents`
- `ReadingProgress`
- `ImageGallery`
- `TechStack`
- `CodeBlock`

Every new component should benefit all Case Studies.

## Design

The top priority is readability. Excessive animations, complex backgrounds, and unnecessary decorative elements are avoided.

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- MDX
- next-themes

All content is static.

## Roadmap

- [ ] **MVP** — Render MDX, metadata, project list, individual page.
- [ ] **Stage 2** — Tags, improved design, hero, reusable components.
- [ ] **Stage 3** — Table of contents, progress bar, scroll spy.
- [ ] **Stage 4** — Search, series, related projects.
- [ ] **Future** — Evaluated on a case-by-case basis.

Any new feature must answer one question: **does it help explain a project better?** If the answer is no, it probably doesn't belong in the project.

## Guiding principle

The platform doesn't exist to showcase projects. It exists to tell the story behind them.

Each Case Study should let anyone understand what problem I solved, how I arrived at the solution, what decisions I made, and what I learned along the way. That is the real value of the project, and what sets it apart from a traditional portfolio.

## License

_(To be defined)_
