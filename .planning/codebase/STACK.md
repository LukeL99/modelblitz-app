# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript ~5.9.3 - All application code (.tsx, .ts files)

**Secondary:**
- JavaScript - Build configuration and dev tooling

## Runtime

**Environment:**
- Node.js (version not pinned in .nvmrc, uses npm's engines recommendation)

**Package Manager:**
- npm (npm 10+ inferred from package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - Frontend UI framework
- React Router DOM 7.13.0 - Client-side routing (routes: `/`, `/benchmark`, `/benchmark/:id/progress`, `/report/:id`, `/shared/:id`)

**UI & Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/vite 4.1.18 - Vite plugin for Tailwind
- Lucide React 0.563.0 - Icon library (CheckCircle, Loader2, Clock, Target, Zap, DollarSign, etc.)

**Charts & Visualization:**
- Recharts 3.7.0 - React charting library (used for scatter plots, bubble charts, latency charts)

**Build/Dev:**
- Vite 7.3.1 - Frontend build tool and dev server
- @vitejs/plugin-react 5.1.1 - Vite plugin for React fast refresh
- ESLint 9.39.1 - Linting
- @eslint/js 9.39.1 - ESLint base config
- typescript-eslint 8.48.0 - TypeScript ESLint support
- eslint-plugin-react-hooks 7.0.1 - React Hooks linting rules
- eslint-plugin-react-refresh 0.4.24 - React Refresh HMR linting

## Key Dependencies

**Critical:**
- React 19.2.0 - Essential for component rendering
- TypeScript 5.9.3 - Compile-time type safety (strict mode enabled)
- Tailwind CSS 4.1.18 - CSS generation and theming

**Infrastructure:**
- Recharts 3.7.0 - Data visualization for benchmark results
- Lucide React 0.563.0 - Icon rendering throughout UI
- React Router DOM 7.13.0 - Multi-page navigation without backend routing

## Configuration

**Environment:**
- No `.env` files present (frontend-only, no API keys in codebase)
- Vite config: `vite.config.ts` defines React + Tailwind plugins

**Build:**
- `tsconfig.json` - Workspace config (references tsconfig.app.json and tsconfig.node.json)
- `tsconfig.app.json`:
  - Target: ES2022
  - Module: ESNext
  - Strict mode: enabled
  - JSX: react-jsx
  - Compiler flags: skipLibCheck, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch
- `eslint.config.js` - Flat ESLint config with recommended rules for JS, TypeScript, React Hooks, React Refresh
- `vite.config.ts`:
  ```typescript
  defineConfig({
    plugins: [react(), tailwindcss()],
  })
  ```

## Platform Requirements

**Development:**
- Node.js 16+
- npm or yarn
- Modern browser (ES2022 target)

**Production:**
- Static hosting (Vite builds to `dist/`)
- No backend server required (frontend-only static site)
- CDN compatible

---

*Stack analysis: 2026-02-11*
