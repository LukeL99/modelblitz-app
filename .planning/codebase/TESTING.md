# Testing Patterns

**Analysis Date:** 2026-02-11

## Test Framework

**Runner:**
- Not configured
- No test framework installed (Jest, Vitest, etc. not in dependencies)
- No test configuration files present (`jest.config.*`, `vitest.config.*`)

**Assertion Library:**
- Not applicable - no testing setup

**Run Commands:**
- No test commands in `package.json` scripts
- Current scripts: `"dev"`, `"build"`, `"lint"`, `"preview"`
- Testing would need to be added as future capability

## Test File Organization

**Location:**
- No test files found in codebase
- `find . -name "*.test.ts*" -o -name "*.spec.ts*"` returns no results

**Naming:**
- Convention would be: `ComponentName.test.tsx` or `utility.spec.ts`
- Not yet established in this codebase

**Structure:**
- Would follow `src/` directory mirror pattern if added

## Test Structure

**Current State:**
- No existing test suites
- Component testing strategy not established

**Recommended Pattern (for future implementation):**
```typescript
// Example structure for components
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('should render with expected content', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<ComponentName onChange={mockFn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Mocking

**Framework:**
- No mocking library configured
- Would use Jest's `jest.mock()` or Vitest's `vi.mock()` if testing were implemented

**Patterns:**
- Currently, mock data is provided via `src/data/mockBenchmark.ts` and `src/data/models.ts`
- These files contain test/demo data exported as constants:
  - `mockBenchmark.ts`: `benchmarkConfig`, `modelResults`, `topModelRunDetails`, `allModels`, `recommendationText`
  - `models.ts`: `MODELS`, `ERROR_EXAMPLES`, `generateRunData()` function

**What to Mock:**
- API calls to external services (not currently implemented)
- External library behavior (recharts, lucide-react)
- Router state and navigation

**What NOT to Mock:**
- React hooks (useState, useEffect) should be tested with actual implementations
- Mock data utilities (`generateRunData()`) are already pure functions
- Component composition should test integration between components

## Fixtures and Factories

**Test Data:**
- Existing factories in codebase:
  - `generateRunData(model: ModelData, runsPerModel?: number)` in `src/data/models.ts` - generates 50 synthetic runs per model with correct/incorrect results, response times, token counts
  - `benchmarkConfig` object with prompt, example input, expected output, weights
  - `ERROR_EXAMPLES` array with 4 pre-defined failure cases for different models

**Location:**
- `src/data/models.ts`: Main data fixtures
- `src/data/mockBenchmark.ts`: Benchmark configuration fixtures
- Pattern: Export constants directly, no factory directory structure

**Example from `models.ts`:**
```typescript
export function generateRunData(model: ModelData, runsPerModel: number = 50): Array<{
  run: number;
  correct: boolean;
  responseTime: number;
  tokens: number;
}> {
  const correctCount = Math.round((model.correct / 100) * runsPerModel);
  const runs = [];

  for (let i = 0; i < runsPerModel; i++) {
    const isCorrect = i < correctCount;
    const baseTime = model.p95 * 0.8;
    const jitter = (Math.sin(i * 7.3 + model.rank * 2.1) * 0.5 + 0.5) * model.p95 * 0.4;
    const responseTime = parseFloat((baseTime + jitter).toFixed(2));
    const tokens = Math.floor(180 + (Math.sin(i * 3.7 + model.rank) * 0.5 + 0.5) * 120);

    runs.push({
      run: i + 1,
      correct: isCorrect,
      responseTime,
      tokens,
    });
  }

  // Shuffle so incorrect ones aren't all at the end
  for (let i = runs.length - 1; i > 0; i--) {
    const seed = Math.sin(i * 13.7 + model.rank * 5.3) * 0.5 + 0.5;
    const j = Math.floor(seed * (i + 1));
    [runs[i], runs[j]] = [runs[j], runs[i]];
  }

  return runs;
}
```

## Coverage

**Requirements:**
- Not enforced - no coverage configuration
- No pre-commit hooks checking coverage thresholds
- Would require tool configuration (Jest/Vitest + coverage settings)

**View Coverage:**
```bash
# Would use (once testing is set up):
npm run test:coverage  # Not currently available
```

## Test Types

**Unit Tests:**
- Not implemented
- Would test: utility functions, data transformations, helper functions
- Examples to test:
  - `getPriorityText()` in `CriteriaSliders.tsx` - logic for determining priority order
  - `generateRunData()` in `models.ts` - deterministic data generation
  - Data filtering/sorting logic in `ReportPage.tsx`

**Integration Tests:**
- Not implemented
- Would test: component interaction with state, prop passing between components
- Examples to test:
  - `ModelSelector` changing selected models → `CriteriaSliders` responding
  - Sorting in table triggering re-renders with correct order
  - Toast notifications appearing and disappearing

**E2E Tests:**
- Not configured
- Framework: None (would use Playwright, Cypress if added)
- Scope: Would test full user flows from landing page through report generation

## Common Patterns

**Async Testing:**
- React components use `useEffect` for side effects
- No async operations currently in components (all data is mock/synchronous)
- If implemented: Use React Testing Library's `waitFor()` for state updates
- Example pattern would be:
```typescript
it('should display data after loading', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

**Error Testing:**
- No error boundaries or error states in current codebase
- Future pattern for error scenarios:
```typescript
it('should handle missing data gracefully', () => {
  render(<Component data={undefined} />);
  expect(screen.getByText('No data available')).toBeInTheDocument();
});
```

**State Management Testing:**
- All state is local via `useState()` hooks
- Pattern for testing state changes:
```typescript
it('should toggle expanded state on button click', () => {
  render(<Component />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(screen.getByText('Expanded content')).toBeInTheDocument();
});
```

## Setup Recommendations

**To implement testing:**

1. Install test framework:
```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

2. Create test configuration: `vitest.config.ts`

3. Add npm scripts:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

4. Create test file structure mirroring `src/`:
- `src/components/__tests__/ComponentName.test.tsx`
- `src/data/__tests__/models.test.ts`

5. Start with high-value tests:
- `generateRunData()` function (deterministic, pure)
- `CriteriaSliders` component (complex logic in `getPriorityText()`)
- `ReportPage` sorting logic (critical business feature)

---

*Testing analysis: 2026-02-11*
