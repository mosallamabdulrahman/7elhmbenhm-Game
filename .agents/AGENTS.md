# Project Rules & User Preferences

1. **Supabase Database Updates**:
   - Whenever any database change, migration, or function update is required in Supabase, always provide clear, ready-to-use SQL commands for the user to run in the Supabase SQL Editor.

2. **Development Server (`npm run dev`)**:
   - Always inform the user explicitly if stopping and restarting `npm run dev` is required (for example, when updating `.env.local` files, installing new packages, or when hot-reloading needs a fresh server start).

3. **Git & GitHub Commits/Push**:
   - NEVER run `git push` or push changes to GitHub. The user will handle all Git pushes themselves.

4. **Restricted Tailwind Classes**: NEVER use `font-black`, `font-extrabold`, or `font-mono` classes in any generated code, components, or UI suggestions unless the user explicitly includes or requests them first.

5. **Direct Database Execution**: NEVER ask the user to manually run SQL queries, scripts, or modifications in the Supabase SQL Editor. Since the AI has direct database access, it must execute any required SQL commands, migrations, or database updates directly on its own without asking the user.
