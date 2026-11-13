# AI Agent Guidelines: React & TypeScript

You are an expert Frontend Developer specializing in React and TypeScript. When generating, refactoring, or modifying code in this project, you must strictly adhere to the following rules to ensure high-quality, scalable, and maintainable code.

## 1. File Size & Modularization (Strict Limits)
- **150-Line Limit:** No single component file should exceed 150 lines of code. If a component approaches this limit, decompose it immediately.
- **Render Block Ceiling:** If a component's `return (...)` statement exceeds 40 lines or contains more than 3 levels of nested DOM elements/components, extract those sections into dedicated child components.
- **No In-File Helper Components:** Never declare non-exported child components at the bottom of the same file. Every component belongs in its own `.tsx` file.
- **Extract Non-JSX Code:** Move large configuration arrays, table columns, dummy data, or complex validation schemas into an adjacent `.constants.ts` or `.helpers.ts` file.

## 2. Directory-Based Decomposition
When a component grows to require sub-components or complex logic, convert it from a single file to a feature-folder structure:
```text
ComponentName/
├── ComponentName.tsx         # Main entry point (strictly layout & prop passing)
├── ComponentNameHeader.tsx   # Extracted sub-component
├── useComponentName.ts       # Extracted state & effect logic
├── ComponentName.types.ts    # Extracted interfaces/types
└── index.ts                  # Clean barrel export (export * from './ComponentName')
```

## 3. Component Architecture & Standards
- **Component Definitions:** Use standard function declarations for components. Do not use arrow functions for top-level component declarations, and never use `React.FC` or `React.StatelessComponent`.
  ```tsx
  // ✅ DO THIS
  export function UserProfile({ userId }: UserProfileProps) { ... }
  ```
- **Exports:** Always use explicit named exports rather than default exports. This ensures consistent naming in auto-imports and makes refactoring safer.
- **Pure Presentational Components:** Main `.tsx` files should focus on UI layout. Keep business logic, data fetching, and state management out of the JSX file by delegating to custom hooks.

## 4. TypeScript & Type Safety
- **Strict Typing:** Never use `any`. Use `unknown` with type guards, precise `interface`/`type` definitions, or generics.
- **Props Typing:** Always define a clear `interface` or `type` directly above the component definition (or in a `.types.ts` file if shared).
- **Event Handler Types:** Use explicit React event types (e.g., `React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`).
- **State Discriminated Unions:** Represent multi-status states with discriminated unions rather than multiple boolean flags (`isLoading`, `isError`, `isSuccess`).
  ```ts
  type FetchState<T> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error };
  ```

## 5. Hooks & State Management
- **Mandatory Custom Hooks:** Extract state logic, asynchronous calls, event handlers, and data transformations into dedicated hooks (`use<Feature>.ts`).
- **Minimize `useEffect`:** Do not use `useEffect` to derive state or handle user event responses. Calculate derived values directly during render.
- **Functional State Updates:** Always use functional updates when new state depends on the previous state: `setCount(prev => prev + 1)`.
- **Dependency Arrays:** Keep `useEffect`, `useCallback`, and `useMemo` dependency arrays complete and accurate. Never disable ESLint `exhaustive-deps` rules without an explicit, documented justification.

## 6. Rendering & Performance
- **Keys:** Always use unique, stable IDs for list item `key` props. Do not use array index `index` unless the list is strictly static, un-ordered, and will never mutate.
- **Pragmatic Memoization:** Apply `useCallback` and `useMemo` only when passing callbacks to heavily memoized children or performing genuinely expensive synchronous calculations.
- **Null Safety:** Rely on optional chaining (`?.`) and nullish coalescing (`??`) over logical AND (`&&`) rendering when evaluating falsy numbers/strings (e.g., use `items.length > 0 && ...` instead of `items.length && ...`).

## 7. Imports & Styling
- **Import Ordering:** Group imports logically with blank lines between groups:
  1. External libraries (React, Third-party packages)
  2. Internal absolute paths (`@/components/...`)
  3. Internal hooks & utilities (`@/hooks/...`)
  4. Types (`@/types/...`)
  5. Relative imports and styles
- **Class Merging:** If using utility-first CSS (like Tailwind), combine classes conditionally using `clsx` and `tailwind-merge` (typically via a `cn()` utility function) rather than inline ternary string concatenation.

## 8. Curated Frontend Libraries (`pick-ui-library`)

When selecting or installing a frontend library for a UI task, follow Emil Kowalski's curated list ([upstream source](https://raw.githubusercontent.com/emilkowalski/skills/refs/heads/main/skills/pick-ui-library/SKILL.md)). Do not substitute alternatives outside this list unless explicitly requested or the task is not covered.

### Selection Protocol
1. **Identify the underlying task**, not the library name mentioned in a prompt (e.g., *"I need a dropdown"* is a UI-primitives task → `base-ui`).
2. **Check `package.json` first.** If the project already uses a listed library, reuse it. If it already uses a competitor (e.g., `react-window` instead of `Virtuoso`), flag the recommendation without churning existing dependencies unless asked.
3. **Pick one clear library** per task rather than presenting a menu of options. If a task is not covered below, explicitly state that it falls outside the curated list before recommending an alternative.

### Curated List

#### UI Components & Primitives
| Task | Library |
| --- | --- |
| Unstyled, accessible UI components (dialogs, popovers, menus, selects…) | [base-ui](https://base-ui.com) |
| Command menus (⌘K palettes) | [cmdk](https://cmdk.paco.me) |
| Toasts / notifications | [Sonner](https://sonner.emilkowal.ski) |
| One-time password / verification code inputs | [input-otp](https://input-otp.rodz.dev) |
| Customizable GUIs / control panels | [Leva](https://github.com/pmndrs/leva) — [dialkit](https://joshpuckett.me/dialkit) is an alternative |

#### Motion & Visuals
| Task | Library |
| --- | --- |
| General-purpose animation (springs, layout animations, enter/exit) | [motion](https://motion.dev) (Framer Motion) |
| Animating numbers (counters, prices, stats) | [NumberFlow](https://number-flow.barvian.me) |
| Animated text components | [torph](https://torph.lochie.me/) |
| 3D globes | [Cobe](https://cobe.vercel.app) |
| Dynamic OG images (HTML/CSS → SVG/PNG) | [Satori](https://github.com/vercel/satori) |
| Syntax highlighting | [shiki](https://shiki.style) |

- **Motion Split:** Reach for `motion` when you need springs, layout animations, exit animations, or gesture-driven values. A simple hover or fade does not need it—use plain CSS transitions instead.

#### Charts
| Task | Library |
| --- | --- |
| Real-time / streaming charts | [Liveline](https://github.com/benjitaylor/liveline) |
| General charts (static or interactive dashboards) | [recharts](https://recharts.org) |

- **Charts Split:** If data points arrive live and the chart scrolls with time, use `Liveline`. Everything else uses `recharts`.

#### Interaction & Performance
| Task | Library |
| --- | --- |
| Drag and drop | [dnd kit](https://dndkit.com) |
| Virtualization (long lists, large tables) | [Virtuoso](https://virtuoso.dev) |

#### State & Styling
| Task | Library |
| --- | --- |
| State management | [zustand](https://zustand.docs.pmnd.rs) |
| Constructing `className` strings conditionally | [clsx](https://github.com/lukeed/clsx) |
| Type-safe, variant-driven styling for Tailwind | [cva](https://cva.style) |
| Theme switching / dark mode (no flash on load) | [next-themes](https://github.com/pacocoursey/next-themes) |

- **Styling Split:** Use `clsx` for ad-hoc conditional classes; use `cva` when a component has real variants (`size`, `intent`, `state`) that deserve a typed API. They compose cleanly (`cva` accepts `clsx`-style inputs).

### Common Mismatches to Catch
- **Toasts built by hand or with a modal library** → Use `Sonner`.
- **A `<div>`-based dropdown/dialog with manual focus handling** → Use `base-ui` for accessibility, focus trapping, and dismissal.
- **Animating a number by re-rendering raw text** → Use `NumberFlow` for proper digit transitions.
- **Rendering a 1,000+ row list directly** → Use `Virtuoso` before reaching for pagination hacks.
- **A `useState`-per-component web of props for shared state** → Use `zustand`.
- **Template-literal `className` ternaries three conditions deep** → Use `clsx` (or `cva` if variant-shaped).
