# Project Rules & Development Standards

## 1. Core Development & Architecture Rules

- **Caveman Skill Rules**: Always enforce caveman communication rules by default in all responses without waiting for triggers.
- **Next.js**: Used as the core framework (App Router) to ensure high performance, server-side optimization, and seamless routing.
- **TypeScript**: Enforced across the entire codebase to maintain strict type safety, prevent runtime errors, and prohibit the use of `any`.
- **Zustand**: Used for lightweight, high-performance global state management. Always leverage atomic selectors to avoid unnecessary component re-renders.
- **React & React-Core-Architecture**: Ensures a modular, clean component structure with proper separation of concerns and optimal local vs. global state placement.
- **UI-UX-Pro-Max (UI Design Only)**: Applied exclusively when designing interfaces to ensure elite, modern, and user-friendly UI standards.
- **API-Endpoint**: Guides the creation of secure, structured, and efficient backend API routes and database communication.
- **Brand**: Guarantees strict adherence to the project's custom color palette and official visual identity.
- **Forms**: Ensures form handling is optimized, clean, and properly validated.

## 2. Project Execution & Operational Preferences

- **Direct Database Execution**: NEVER ask the user to manually run SQL queries, scripts, or modifications in the Supabase SQL Editor. Since the AI has direct database access, it must execute any required SQL commands, migrations, or database updates directly on its own without asking the user.
- **Development Server (`npm run dev`)**: Always inform the user explicitly if stopping and restarting `npm run dev` is required (for example, when updating `.env.local` files, installing new packages, or when hot-reloading needs a fresh server start).
- **Git & GitHub Commits/Push**: NEVER run `git push` or push changes to GitHub. The user will handle all Git pushes themselves.
- **Restricted Tailwind Classes**: NEVER use `font-black`, `font-extrabold`, or `font-mono` classes in any generated code, components, or UI suggestions unless the user explicitly includes or requests them first.
- **Mandatory Post-Execution Testing**: After implementing a new feature, fixing a bug, or executing any task, you must proactively test and verify the functionality of that specific game area or logic. Never submit unverified code; ensure it works flawlessly so the user does not have to discover broken features during manual testing.
