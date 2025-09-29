**Prompt for BoltAI:**

You are working on a modern React + TypeScript + Tailwind CSS project for a rice mill management system. The project already has a layout, sidebar, dashboard, and some core components. Your task is to generate all missing pages and their basic frontend functionalities, so that only backend wiring will be needed later. Use demo/mock data for all lists, tables, and forms. Place all mock data in a single mock.ts file and import from there. In every page, use a useEffect hook to fetch from the relevant PHP endpoint (e.g., via fetch()). Display mock data by default, but when the endpoint is wired and returns data, show the real data instead. This ensures the UI is ready for backend integration with no extra markup needed.

**Requirements:**

- Use React functional components with TypeScript.
- Use Tailwind CSS for all styling.
- Each page should have a clear, minimal structure and all necessary UI elements (forms, tables, tabs, etc.) for its purpose.
- Include API calls and endpoints targeting the backend (PHP).
- Use the existing layout and navigation structure.

**Pages to create:**

1. **Profile Page**

   - Show user profile info (name, email, etc.).
   - Include a “Change Password” tab/section (see below).
   - Allow editing of profile fields (with save/cancel).
   - Route: `/profile`

2. **Change Password Page**

   - Can be accessed directly or as a tab/section in the profile page.
   - Form for current password, new password, confirm new password.
   - Route: `/change-password` (and as a tab in `/profile`)

3. **Any other missing pages referenced in the sidebar navigation**
   - For each, create a minimal page with the correct route and all basic UI elements (forms, tables, etc.) as implied by the page name.
   - Example: “Employee List” should have a table for employees, “Add Stocks” should have a form, etc.

**General:**

- All pages must be fully responsive.
- Use only the markup and components necessary for the page’s function.
- No extra comments, placeholder text, or demo data.
- Use the existing navigation and layout.
