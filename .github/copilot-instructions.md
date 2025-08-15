# Copilot Instructions for html-playground

This document helps AI coding agents understand the html-playground codebase structure, conventions, and workflows.

## Project Overview

- **Runtime**: Bun all-in-one (see `src/index.tsx`). Uses `serve()` to host static HTML and simple API routes.
- **Frontend**: React + TypeScript + Prism Code Editor (see `src/Editor.tsx`) with Tailwind CSS (via `bun-plugin-tailwind`).
- **Build**: Custom `build.ts` script leveraging `bun build` + Tailwind plugin. Scans `src/**/*.html` for entrypoints.

## Local Development

```bash
bun install               # install dependencies via Bun
bun dev                   # runs `bun --hot src/index.tsx` with HMR + console logging
```  
- Entry file: `src/index.tsx` (serves HTML + API routes).  
- HTML template lives in `src/index.html` (imported by Bun).  

## Production Build & Deployment

```bash
bun run build.ts          # default: outdir=dist, minify, sourcemap=linked
bun run build.ts --outdir=build --minify   # override options
```  
- Output folder: `dist`  
- GitHub Pages workflow: see `.github/workflows/pages.yml`  

## Code Structure & Key Modules

- `src/index.tsx`: Bun server setup, routes for `/*` (all HTML) and `/api/*`.  
- `src/index.html`: HTML entrypoint; any `.html` in `src/` is auto-processed.  
- `build.ts`: CLI argument parsing (`--minify`, `--format`, etc.) and clean build logic.  
- `src/Editor.tsx`, `ConsolePanel.tsx`, `InputWithHistory.tsx`, `ShareModal.tsx`: main interactive panels.  
- `src/components/`: shared UI using Radix + Shadcn conventions (see `components.json`).  
- `src/hooks/`: utility hooks (e.g. `useEncodedState.ts`).  
- `src/lib/utils.ts`: helper functions (e.g. `cn` class merging).  

## Conventions & Patterns

- **Path aliases**: `@/` maps to `src/` (configured in `tsconfig.json` and `bun-env.d.ts`).  
- **Styling**: Tailwind utility classes, `cn(...)` helper in `src/lib/utils.ts`.  
- **UI Kit**: Shadcn components (Radix-based) in `src/components/ui`; consistent `data-slot` attributes.  
- **Editor setup**: Prism grammars imported globally under `prism-code-editor/prism/languages`.  
- **Environment flags**: `development.hmr` and `development.console` toggled by `NODE_ENV` in `src/index.tsx`.

## Adding Features

- **New HTML pages**: drop a `.html` in `src/`; update any `<script>` imports as needed.  
- **New API routes**: register under `routes` in `src/index.tsx`. Supports `GET`, `PUT`, and wildcard segments (`:param`).  
- **Tailwind updates**: adjust `tailwind.config.js` or plugin settings in `build.ts`.  