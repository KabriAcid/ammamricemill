### Amam Rice Mill System — Backend & Frontend Synchronization Blueprint

#### Core Context

* The project is a **Node.js (Express) + MySQL** backend and a **React (Vite + Tailwind)** frontend.
* Architecture prioritizes **API-driven UI**, **plural REST routes**, and **modular domain separation**.
* No shared hooks are allowed. Each frontend component handles its own data fetching via lifecycle hooks.

#### Backend Overview

* Backend root: `/backend/index.js` handles global setup (Express, CORS, dotenv, cookie-parser, error handling).
* Routes are grouped modularly inside `/backend/routes/` by domain (HR, Accounts, Sales, etc.).
* A global router (`routes/index.js`) consolidates all submodules for clean API routing.

#### Route Naming Convention

* All route paths must use **plural nouns** to maintain REST consistency.

  * `/hr/employees`, `/accounts/bank-heads`, `/products/categories`, `/settings/uploads`, etc.
* Routes mounted directly in `backend/index.js`:

  * `/api/auth` (authentication)
  * `/api/dashboard` (analytics)
  * `/api/production` (production order and details)
  * `/api` → for global modular router (delegated to `routes/index.js`)

#### Backend Folder & API Consistency

* Directory tree mirrors navigation sections. Examples:

  * `routes/hr/` → employees, attendance, salaries, designations
  * `routes/accounts/` → bank-heads, expense-heads, transactions
  * `routes/products/` → categories, products
  * `routes/settings/` → general, uploads, godown, silo
* Each route file exports an Express router module mapped to `/api/...` endpoints.

#### Frontend Structure Alignment

* Each UI component fetches backend data using **API calls inside lifecycle methods (e.g., useEffect)**.
* The AI implementing UI enhancements should:

  * Follow existing **component structure**, **state handling**, and **Tailwind design patterns**.
  * Use the **same naming conventions** for API endpoints and state variables.
  * Ensure consistent layout, typography, and utility classes.
* No shared data-fetch hooks; logic stays local within the component.

#### Enhancement Goals

1. Align backend API structure with frontend navigation.
2. Ensure route paths and naming reflect DB schema domains.
3. Maintain modular separation between backend domains.
4. Apply consistent frontend design and structure across new and existing components.

#### Next Steps for AI Agents

* **AI #1 (Backend Planner):** Verify Express route structure, pluralize endpoints, and map backend routes to navigation modules.
* **AI #2 (Frontend Consistency Manager):** Analyze 3 reference frontend components, extract design patterns, and apply consistent logic to new components.
* **AI #3 (Integrator):** Connect components to their corresponding backend endpoints via structured useEffect-based API calls, ensuring naming and data flow alignment.

#### Key Constraints

* Do not introduce shared hooks.
* Preserve existing component patterns and UIX flow.
* Any modification must stay consistent with `navigation.ts` once provided.
* System must remain **API-driven** and **schema-aligned**.
