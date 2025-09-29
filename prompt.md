# AMMAM Rice Mill Dashboard Rewrite Prompt

## Project Goal

Rebuild the AMMAM Rice Mill dashboard page as a modern, production-grade, mobile-responsive web app. The new implementation must support a scalable directory structure, reusable components, context-based state management, authentication, and robust API integration. The UI should be visually appealing, premium, with multi-layer card shadows, smooth transitions, skeleton loaders, and a loading spinner.

---

## Favicon

Use `/assets/img/favicon.png` as the favicon for the new project.

## 1. Directory Structure

Organize the project as follows:

```
src/
  components/         # Reusable UI components (Card, Sidebar, Navbar, Spinner, Skeleton, etc.)
  pages/              # Page-level components (Dashboard, Login, etc.)
  ui/                 # Design system (buttons, inputs, typography, shadows, etc.)
  types/              # TypeScript types and interfaces
  contexts/           # React Contexts (Auth, UI, Data, etc.)
  hooks/              # Custom React hooks (useFetch, useAuth, etc.)
  utils/              # Utility functions (fetch wrapper, helpers)
  assets/             # Static assets (images, icons, etc.)
  styles/             # Global and theme styles (if not using Tailwind)
  App.tsx
  main.tsx

  - All config files e.g packages.json, vite, tailwindconfig, tsconfig and all.
```

---

## 2. UI/UX Requirements

- **Mobile Responsive:**
  - Mobile-first approach. Sidebar collapses into a hamburger menu on small screens. All dashboard cards and navigation adapt to mobile layouts.
- **Sidebar Navigation:**
  - Multi-level (sub-navigation) sidebar, reflecting the structure in the original HTML.
  - Highlight active routes.
  - Smooth expand/collapse animations for submenus.
- **Top Navbar:**
  - User profile dropdown with logout, profile, and password change.
  - Branding/logo.
- **Dashboard Cards:**
  - Each card (e.g., "Total Party", "Total Products", etc.) is a component.
  - Cards have multi-layer shadows, hover effects, and smooth transitions.
  - Use a grid layout that adapts to screen size.
  - Each card links to its respective details page.
- **Skeleton Loaders & Spinner:**
  - Show skeleton loaders while fetching dashboard data.
  - Show a centered loading spinner for full-page loads or blocking actions.
- **Alerts & Notifications:**
  - Toast or alert component for notifications (e.g., errors, success).
  - Tables should be fully responsive with scrolls and not scrollbar.
  - Clicking on table items routes to the details page with the id

---

## 3. State Management & Contexts

- **Auth Context:**
  - Handles login state, user info, and logout.
  - Protects routes that require authentication.
- **UI Context:**
  - Manages sidebar open/close, theme, and global UI state.
- **Data Context:**
  - Optionally, for dashboard and shared data.

---

## 4. TypeScript Types

Define types/interfaces for:

- User
- DashboardCard (title, value, link, color, icon, etc.)
- API responses
- Auth state

---

## 5. API Integration

- **Fetch Utility:**
  - Create a `fetcher` utility (e.g., `utils/fetcher.ts`) that wraps `fetch` or Axios.
  - Handles base URL, headers (including CSRF token), error handling, and JSON parsing.
  - Proper error handling for empty or null data: display skeletons or fallback UI, and show a user-friendly error message if data cannot be loaded.
- **Endpoints:**
  - Use the backend endpoints as in the original app (e.g., `/api/dashboard`, `/api/logout`, etc.).
  - Fetch dashboard stats, user info, and navigation data dynamically.

---

## 6. Componentization

- **Sidebar:**
  - Recursive rendering for submenus.
  - Collapsible sections.
  - Active state highlighting.
- **Navbar:**
  - User menu, branding.
- **DashboardCard:**
  - Props: title, value, icon, color, link.
  - Shadow and animation on hover.
- **Spinner & Skeleton:**
  - Reusable loading indicators.

---

## 7. Styling

- Use Tailwind CSS or Material UI for rapid, consistent styling.
- **Primary color:** `#AF792F`
- **Secondary color:** `#C8D1BB`
- Set these as custom colors in your Tailwind config and use them throughout the app for 
buttons, highlights, backgrounds, etc.
- Lucide icons and the use of Framer motions.
- Structured app routes.
- Dropdowns disappear on esc or onmouseaway.
- Multi-layer shadows for cards (provide the means to just change it in one place, e.g., tailwind.config).
- Smooth transitions for hover, sidebar, and card animations.
- Responsive grid for dashboard cards.

---

## 8. Accessibility

- Keyboard navigation for sidebar and navbar.
- ARIA attributes for menus and alerts.

---

## 9. Sample Fetch Utility (TypeScript)

```typescript
// utils/fetcher.ts
export async function fetcher<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = await res.json();
  if (!data || Object.keys(data).length === 0) {
    throw new Error("No data returned from server.");
  }
  return data;
}
```

---

## 10. Sample Dashboard Card Component

```tsx
// components/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link: string;
  loading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  link,
  loading,
}) => (
  <a
    href={link}
    className={`block rounded-xl p-4 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${color}`}
  >
    <div className="flex flex-col items-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold text-lg">{title}</div>
      <div className="text-2xl">
        {loading ? <Skeleton width={80} /> : value}
      </div>
    </div>
  </a>
);
```

---

## 11. Deliverables

- Fully functional, mobile-responsive dashboard page.
- Sidebar with sub-navigation, top navbar, and dashboard cards.
- Skeleton loaders and spinner for loading states.
- All code in TypeScript, using the directory structure above.
- All UI/UX and accessibility requirements met.
- Full SQL schema matching the project design.

---

**Reference:**
The original home.html contains the full navigation and dashboard card structure. All navigation and dashboard data should be dynamic and easily maintainable.

---

**Note:**
This is a live, production project. Code quality, performance, and maintainability are critical. Avoid MVP shortcuts; use best practices throughout.
