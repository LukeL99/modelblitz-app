# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `ModelSelector.tsx`, `ReportPage.tsx`)
- Utilities and data files: lowercase with hyphens or camelCase (e.g., `mockBenchmark.ts`, `models.ts`)
- Index files use `index.ts` or `index.tsx`

**Functions:**
- React components: PascalCase (e.g., `function Hero()`, `export default function ModelSelector()`)
- Helper functions: camelCase (e.g., `getPriorityText()`, `generateRunData()`, `showToast()`)
- Event handlers: camelCase starting with `handle` (e.g., `handleSort()`)
- Utility functions with side effects: camelCase (e.g., `animate()`)

**Variables:**
- State variables: camelCase (e.g., `expanded`, `sortKey`, `dailyExtractions`, `compareModel`)
- Constants (module-level): UPPERCASE_SNAKE_CASE (e.g., `METRIC_TOOLTIPS`, `MODELS`, `PROVIDER_COLORS`)
- DOM/computed values: camelCase (e.g., `minSize`, `maxSize`, `baseColor`, `opacity`)
- Type narrowing: camelCase (e.g., `isDiff`, `isWinner`, `isExpanded`)

**Types:**
- Interfaces: PascalCase (e.g., `Props`, `ModelData`, `ModelResult`, `RunDetail`)
- Type aliases: PascalCase or descriptive (e.g., `SortKey`)
- Exported data structure constants: UPPERCASE (e.g., `MODELS`, `ERROR_EXAMPLES`)

## Code Style

**Formatting:**
- Indentation: 2 spaces (TypeScript/React standard)
- Line endings: LF (Unix style)
- No formatter configured (Prettier not in dependencies)
- ESLint enforces style automatically on lint

**Linting:**
- Tool: ESLint v9.39.1 (flat config format)
- Config file: `eslint.config.js`
- Extends: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Command: `npm run lint`
- Recommended linting before commit to catch `@typescript-eslint/no-explicit-any` suppressions

## Import Organization

**Order:**
1. React/third-party library imports (e.g., `import React, { useState }`)
2. React Router imports (e.g., `import { Link } from 'react-router-dom'`)
3. Icon/UI library imports (e.g., `import { ChevronDown, Trophy } from 'lucide-react'`)
4. Chart library imports (e.g., `import { ScatterChart, ... } from 'recharts'`)
5. Relative imports (e.g., `import { MODELS } from '../data/models'`)

**Example from `ReportPage.tsx`:**
```typescript
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Share2, FileDown, DollarSign, Target, ArrowUpDown,
  ChevronDown, AlertTriangle, ArrowRight, Info
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  BarChart, Bar
} from 'recharts';
import { MODELS, PROVIDER_COLORS, TIER_COLORS, ERROR_EXAMPLES, generateRunData } from '../data/models';
```

**Path Aliases:**
- Not configured; uses relative paths with `../` navigation

## Error Handling

**Patterns:**
- Null coalescing with `??` operator (e.g., `value ?? 0`, `line ?? ''`)
- Optional chaining with `?.` operator (e.g., `payload[0]?.payload`)
- Conditional returns from helper functions (e.g., `if (!text) return null;`)
- No explicit try/catch blocks observed in components
- Runtime type guards with explicit `any` suppression when needed: `// eslint-disable-next-line @typescript-eslint/no-explicit-any`

**Example from `AccuracyCostScatter.tsx`:**
```typescript
formatter={(value: any, name: any) => {
  if (name === 'Cost') return [`$${value ?? 0}`, name];
  return [value ?? 0, name];
}}
```

## Logging

**Framework:** `console` (native browser API)

**Patterns:**
- No structured logging framework configured
- Uses `console.log`, `console.warn` implicitly through event handlers
- Toast messages for user feedback instead of console logs (e.g., `showToast()` function in `ReportPage.tsx`)
- No log level configuration

## Comments

**When to Comment:**
- Inline comments for non-obvious logic (e.g., chart calculations)
- Comments explaining algorithmic intent (e.g., "Map accuracy to chart Y" with range documentation)
- Comments for React Fragment purpose (e.g., `{/* Left: Copy */}`)
- Comments for TODO/status in data (e.g., `// Shuffle so incorrect ones aren't all at the end`)

**JSDoc/TSDoc:**
- Not observed in codebase
- Function parameters documented via TypeScript interface definitions
- Return types explicitly annotated in TypeScript

**Example from `ReportPage.tsx`:**
```typescript
// Bubble chart helpers
const maxP95 = Math.max(...MODELS.map(m => m.p95));
const maxSpread = Math.max(...MODELS.map(m => m.spread));

// Map accuracy to chart Y. Range: 45% at bottom (0%), 105% at top (100%)
// This gives headroom so 98-100% accuracy bubbles don't clip
const yMin = 45;
const yMax = 105;
```

## Function Design

**Size:**
- Most functions 50-100 lines
- Helper functions extracted for complex calculations (e.g., `getPriorityText()` isolated from `CriteriaSliders`)
- Components can be larger (200+ lines) when they contain UI structure

**Parameters:**
- Destructured props via `Props` interface (e.g., `{ selected, onChange }: Props`)
- Single object parameters for functions with multiple args
- Type annotations on all parameters

**Return Values:**
- Explicit return type annotations on exported functions
- React components return JSX.Element implicitly
- Helper functions return specific types (e.g., `string`, `number`, `React.ReactNode[]`)

**Example from `CriteriaSliders.tsx`:**
```typescript
function getPriorityText(w: Props['weights']) {
  const items = [
    { label: 'accuracy', val: w.accuracy },
    { label: 'speed', val: w.speed },
    { label: 'cost', val: w.cost },
  ].sort((a, b) => b.val - a.val);

  if (items[0].val === items[1].val && items[1].val === items[2].val) {
    return 'Balanced across all criteria';
  }
  const top = items.filter(i => i.val >= items[0].val - 1).map(i => i.label);
  const bottom = items.filter(i => i.val <= items[2].val + 1).map(i => i.label);
  return `Prioritizing ${top.join(' and ')} over ${bottom.join(' and ')}`;
}
```

## Module Design

**Exports:**
- Named exports for utilities and data (e.g., `export const MODELS`, `export interface ModelData`)
- Default export for React components (e.g., `export default function ReportPage()`)
- Barrel files in `src/data/` aggregate constants and types

**Barrel Files:**
- `src/data/models.ts`: Exports `MODELS`, `PROVIDER_COLORS`, `TIER_COLORS`, `ERROR_EXAMPLES`, `generateRunData()`, `ModelData`, `ErrorExample` interfaces
- `src/data/mockBenchmark.ts`: Exports `benchmarkConfig`, `modelResults`, `topModelRunDetails`, `allModels`, `recommendationText`
- No explicit `index.ts` barrel files observed; imports use direct file paths

**Example from `ModelSelector.tsx`:**
```typescript
import { allModels } from '../../data/mockBenchmark';

export default function ModelSelector({ selected, onChange }: Props) {
  // component logic
}
```

## TypeScript Configuration

**Strict Mode:** Enabled (`"strict": true`)

**Enforcement:**
- `noUnusedLocals: true` - Variables must be used
- `noUnusedParameters: true` - Function parameters must be used
- `noFallthroughCasesInSwitch: true` - Switch cases must have break/return
- `noUncheckedSideEffectImports: true` - Side effect imports must be explicit
- `verbatimModuleSyntax: true` - Exact import syntax preserved

---

*Convention analysis: 2026-02-11*
