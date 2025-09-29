# BoltAI Prompt: AMMAM Rice Mill Dashboard – Missing Pages & Components

## Objective

Generate only the missing pages and components for the AMMAM Rice Mill dashboard project. Do NOT recreate any existing pages or components (such as Dashboard, Login, Layout, Sidebar, etc.)—only generate what is not already present in the codebase. All output must be ready to embed, matching the project’s design philosophy, structure, and UI/UX standards. Use only the markup, logic, and data needed for seamless integration—no extra boilerplate, placeholder text, or unrelated setup. Do not include any other boilerplate; focus only on creating the required directories and the contents within them.

## Design Philosophy & Guidelines

- **Modern, clean, and minimal:** Mobile-first, production-grade, and visually premium.
- **Color palette:**
  - Primary: `#AF792F`
  - Secondary: `#C8D1BB`
  - Use these as Tailwind custom colors for buttons, highlights, backgrounds, etc.
- **Typography:** Plus Jakarta Sans (or system sans-serif fallback).
- **Components:** Multi-layer card shadows, smooth transitions, skeleton loaders, loading spinner, Lucide icons, Framer Motion for animation.
- **Responsiveness:** All pages/components must be fully responsive and accessible.
- **Sidebar:** Multi-level, collapsible, highlights active route, smooth expand/collapse.
- **Navbar:** User profile dropdown (profile, change password, logout), branding/logo.
- **Breadcrumbs:** Every page should include a breadcrumb navigation at the top, matching the style and structure of the dashboard page (e.g., 'Dashboard / Overview').
- **Tables:** Responsive, horizontal scroll, no visible scrollbar.
- **Cards:** Grid layout, hover/active states, link to details page.
- **Accessibility:** Keyboard navigation, ARIA attributes for menus/alerts.

## Project Structure & Usage

- The admin dashboard layout consists of a persistent Sidebar (see Sidebar.tsx) on the left and a main content area on the right. All pages/routes should render their content inside the main content area, not outside the layout.
- The main content area uses a Layout component that wraps all page content (see Dashboard.tsx for example usage).
- Route protection is handled by a ProtectedRoute component. All authenticated pages must be children of ProtectedRoute and Layout, as in:
  ```tsx
  <ProtectedRoute>
    <Layout>
      <PageComponent />
    </Layout>
  </ProtectedRoute>
  ```
- Only the login page is outside the protected layout.

- Use the following structure for all new code:
  - `src/pages/` for pages
  - `src/components/`
  - `src/ui/` for reusable UI elements (Table, Toast, Modal, etc.)
  - `src/types/` for TypeScript types/interfaces
  - `src/hooks/` for custom hooks
  - `src/utils/` for utilities (e.g., fetcher)
  - `src/contexts/` for React Contexts
  - `src/assets/` for images/icons
- Use and import existing hooks, components, types, and utils as needed. Example imports:
  - `import { fetcher } from '../utils/fetcher'`
  - `import { useAuth } from '../contexts/AuthContext'`
  - `import { User } from '../types/user'`
  - `import { Spinner } from '../components/Spinner'`
- All mock/demo data must be placed in `src/mock.ts` and imported into pages/components.

## Data & API

- Use mock data from `mock.ts` for all lists, tables, and forms.
- In every page, use a `useEffect` to fetch from the relevant PHP endpoint (e.g., via `fetch`).
- Display mock data by default; when the endpoint returns data, show the real data instead.
- Example fetch:
  ```tsx
  useEffect(() => {
    fetch("/api/endpoint")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(mockData));
  }, []);
  ```

## Pages to Create (with details)

### 1. Profile Page (`/profile`)

- Show user profile info (name, email, etc.)
- Editable fields with save/cancel
- “Change Password” tab/section (see below)

### 2. Change Password Page (`/change-password`)

- Form for current password, new password, confirm new password
- Also accessible as a tab/section in Profile

### 3. All Sidebar Pages (by route)

Create a page for each sidebar route, with the following details:

- **Dashboard (`/dashboard`)**: Dashboard cards grid, each card links to details page.
- **Settings**
  - General Setting (`/setting`): Form for general settings.
  - Silo Setting (`/dayar`): Form for silo settings.
  - Godown Setting (`/godown`): Form for godown settings.
- **Human Resource**
  - Designation List (`/designation`): Table of designations.
  - Employee List (`/employee`): Table of employees.
  - Daily Attendance (`/attendance`): Table/form for daily attendance.
  - Monthly Attendance (`/attendance/monthly`): Table for monthly attendance.
  - Salary Sheet (`/salary`): Table for salary.
- **Accounts**
  - Income Head (`/head-income`): Table/form for income heads.
  - Expense Head (`/head-expense`): Table/form for expense heads.
  - Bank Head (`/head-bank`): Table/form for bank heads.
  - Others Head (`/head-others`): Table/form for other heads.
  - All Transactions (`/transactions`): Table of transactions.
- **Party**
  - Party Type (`/party-types`): Table/form for party types.
  - Party List (`/parties`): Table of parties.
  - Party Payments (`/parties/payments`): Table/form for payments.
  - Party Due (`/parties/due`): Table for dues.
  - Party Debts (`/parties/debts`): Table for debts.
- **Products**
  - Category (`/category`): Table/form for categories.
  - Products (`/products`): Table of products.
- **Empty Bags**
  - Purchase (`/emptybag-purchase`): Form/table for purchases.
  - Sales (`/emptybag-sales`): Form/table for sales.
  - Receive (`/emptybag-receive`): Form/table for receives.
  - Payment (`/emptybag-payment`): Form/table for payments.
  - Stocks (`/emptybag-stocks`): Table of stocks.
- **Purchase**
  - Paddy Purchase (`/purchases`): Table/form for paddy purchases.
  - Paddy Purchase Ledger (`/purchase/ledger`): Table for ledger.
  - Rice Purchase (`/rice-purchase`): Table/form for rice purchases.
  - Rice Purchase Ledger (`/ricepurchase/ledger`): Table for ledger.
- **Sales**
  - Sales List (`/sales`): Table of sales.
  - Sales Ledger (`/sale/ledger`): Table for ledger.
- **Production**
  - Production Order (`/productions`): Table/form for orders.
  - Production Details (`/production/details`): Table/details.
- **Stocks**
  - Main Stocks (`/stocks`): Table of stocks.
  - Godown Stocks (`/stocks-godown`): Table of godown stocks.
  - Stock Register (`/stocks/details`): Table of register.
  - Add Stocks (`/addstocks`): Form to add stocks.
  - Production Stocks (`/production-stocks`): Table of production stocks.
  - Production Stocks Details (`/production-stock/details`): Table/details.
  - Empty Bag Stocks (`/emptybag-stocks`): Table of empty bag stocks.
- **Reporting**
  - Daily Report (`/dailyreport`): Table/report.
  - Financial Statement (`/financial-statement`): Table/report.
- **SMS Service**
  - SMS Template (`/sms-templates`): Table/form for templates.
  - Send SMS (`/sendsms`): Form to send SMS.
- **Database Backup**
  - Database Backup (`/backup`): Backup UI.

## Usage of Hooks, Types, Components, Utils

Use and import from existing files as needed:

- `useAuth`, `useUI`, `useFetch`, etc. from `src/hooks/` or `src/contexts/`
- Types/interfaces from `src/types/`
- Utility functions from `src/utils/`
- Components from `src/components/`
- UI elements from `src/ui/`

### Key Contexts, Hooks, and Props

#### AuthContext (`useAuth` from `src/contexts/AuthContext.tsx`)

**Type:**

```ts
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}
```

**Usage:**

```ts
const { user, isAuthenticated, isLoading, login, logout, updateUser } =
  useAuth();
```

**User type:**

```ts
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
```

**AuthState:**

```ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

#### Example: Login

```ts
const { login, isLoading } = useAuth();
const handleLogin = async () => {
  await login(email, password);
};
```

#### Example: Logout

```ts
const { logout } = useAuth();
const handleLogout = async () => {
  await logout();
};
```

#### Example: Update User

```ts
const { updateUser } = useAuth();
updateUser({ name: "New Name" });
```

---

Document and use the props, context values, and types for all other hooks, components, and utils as defined in the project. Always match the expected props and usage for seamless embedding.

## SQL Schema

At the end of your output, provide the full SQL schema for the project. The schema should include all tables, fields, types, and relationships needed to support the data structure and requirements described above (users, employees, products, parties, transactions, stocks, etc.).

---

## General Instructions

- All code must be TypeScript and use Tailwind CSS.
- All pages/components must be fully responsive and accessible.
- No extra markup, placeholder text, or demo data outside of `mock.ts`.
- All output must be ready to drop in and match the project’s design and structure.
