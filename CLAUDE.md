# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Development server at http://localhost:3000
pnpm build        # Production build
pnpm preview      # Preview production build locally
pnpm lint         # ESLint check
pnpm lint:fix     # Auto-fix ESLint issues
pnpm typecheck    # TypeScript type checking (via vue-tsc)
```

The CI pipeline runs `lint` and `typecheck` on every push (no separate test suite).

## Architecture

**Nuxt 4** portfolio with file-based routing. Content is data-driven via `@nuxt/content` — pages pull from YAML/Markdown files rather than hardcoding data in Vue components.

### Content Layer (`content/`)
All site data lives here and is schema-validated with Zod in `content.config.ts`:
- `index.yml` — homepage hero, about, experience, testimonials, FAQ
- `projects/*.yml` — individual project entries; `projects.yml` controls listing page meta
- `blog/*.md` — blog posts in Markdown; `blog.yml` controls listing page meta
- `speaking.yml` — speaking events
- `about.yml` — about page images and content

To add a new blog post or project, create a new file in the appropriate `content/` subdirectory — routing and listing pages pick it up automatically.

### App Layer (`app/`)
- `pages/` — file-based routes; `blog/[...slug].vue` handles dynamic blog post pages
- `components/landing/` — section components used on the homepage (`index.vue`)
- `layouts/default.vue` — wraps all pages with `AppHeader` + `AppFooter`
- `app.config.ts` — global site config: profile picture, meeting link, email, UI theme colors
- `utils/links.ts` — navigation menu items (update here to add/remove nav links)
- `assets/css/main.css` — custom fonts (Public Sans, Instrument Serif) and global styles

### Key Conventions
- **Package manager**: pnpm (pinned at 10.30.3) — do not use npm or yarn
- **Nuxt auto-imports**: components, composables, and utils in `app/` are auto-imported — no explicit imports needed
- **ESLint style**: no trailing commas, 1TBS brace style (configured in `nuxt.config.ts`)
- **`@typescript-eslint/no-explicit-any`** is disabled (see `eslint.config.mjs`)
- **OG images**: require `NUXT_PUBLIC_SITE_URL` env var (see `.env.example`) when running `nuxt generate`
- **Static output**: Nitro is configured to pre-render `/` and crawl links — the site deploys as a static site
