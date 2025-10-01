# Amam Rice Mill (Admin Dashboard) — Bolt AI Prompt (Final, Modular, Compact)

## 1. Global Rules & Tech Stack

- **Preserve v1:** All v1 fields, columns, and actions are compulsory; do not remove or rename any required element. v2+ can add optional enhancements.
- **DRY & Maintainable:** Use only shared components/utilities for all UI/UX. All code must be DRY, maintainable, and production-ready.
- **Premium UI/UX:** All pages must use shared UI components (Card, Button, Table, Modal, Tabs, FilterBar, etc.) for every action, stat, and layout. No custom styles for buttons, tables, or modals—always use the shared component and its props (icon, variant, loading, etc.).
- **Config-Driven:** All tables, columns, summary rows, and actions must be config-driven and defined at the top of each page. Navigation and permissions are config-driven.
- **State/Data:** All CRUD/data logic is handled in the page component using useState/useEffect. Table columns, summary logic, and actions are always config-driven and DRY.
- **Card Stat Layout:** All stat/KPI cards use the Card component with a left-aligned Lucide icon, right-stacked title/value, and premium styling (`shadow-card-hover`, responsive, animated). See Card.tsx for implementation details.
- **Accessibility:** All forms must have labels, aria attributes, high-contrast support, and keyboard navigation (modals close on `esc`).
- **Color Palette:** Primary: #AF792F (bg-primary), Secondary: #b8c4a7 (bg-secondary), use only these for accents/highlights/focus.
- **Layout:** Responsive, mobile-first, grid-based, compact, clean, consistent spacing/typography. Avoid excessive gradients/custom styles unless specified.
- **Navigation:** Each main sidebar link is a directory; each sub-nav link is a file in that directory. Use React Router for navigation. Route paths mirror directory structure.
- **Code Quality:** DRY, readable, maintainable. No inline styles unless necessary. Use TypeScript types/interfaces for all data. Centralize types in `types/entities.ts`.
- **UX:** Robust error handling and empty states. All pages must be visually/functionally consistent.

## 2. UI/UX & Shared Components

- **Shared Components:** Button, Spinner, EmptyState, Tabs, Table (DataTable), Card, FormField, Modal, FilterBar, etc. All pages must use these for every action, stat, and layout. Always check and reuse their props (e.g., variant, size, icon, loading for Button) to maximize flexibility and consistency.
- **Tables:** Use shared Table everywhere (pagination, filters, actions as props, summaryRow for totals). All tables/lists must support: pagination (10, 25, 50, 100), search/filter (all relevant fields), row selection (checkboxes), bulk delete, actions (edit, delete, print, new, view as applicable). Table columns and summary logic must be config-driven.
- **Forms:** Use shared FormField utilities (label, error, validation). Input widths should match expected content. All forms use shared input styles and Button for actions.
- **Modals:** All "New"/"Edit" modals use the same fields; Edit pre-fills data. Use shared modal props pattern: `item: EntityType | null`, `onClose`, `onSave`. Modals close on 'esc'. Long modals: scrollable, no visible scrollbars, action buttons fixed at bottom. All forms and modals use the same input and Button styles.
- **Photo Columns:** Any table with photo data must include a photo column.
- **KPI/Stat Cards:** Use Card layout: left icon (primary-800), right stacked title/value, white, rounded, subtle shadow, hover effect, responsive, animated. Use for summary/stat cards where relevant. All stat cards must use the Card component and icon prop as in Card.tsx.
- **Charts:** Use Chart.js for all charts.
- **Micro-interactions:** Fade-in, success toast, error shake, etc.
- **Loading/Empty/Error:** Use Spinner, EmptyState, and skeletons for loading. All tables/lists must be responsive and visually consistent.

## 2a. Implementation Blueprint (Pattern to Follow for All Pages)

- Scaffold new pages with: heading, stat cards (Card), action bar (Button), Table (with summaryRow), and Modal (form).
- Use config-driven columns, summary, and actions for all tables.
- Always use shared UI components and pass Lucide icons as props.
- Add FilterBar and Tabs where needed for filtering and sectioning.
- Keep all state management and CRUD logic in the page component, using useState/useEffect.
- All new pages and features must follow these patterns for maximum maintainability and consistency.

## 3. Directory, Routing & Naming

- All pages live under a single `pages` directory. Each main sidebar nav link is a subdirectory (e.g., `pages/settings`, `pages/hr`). Each sub-nav/page is a file in its directory (e.g., `pages/settings/GeneralSettings.tsx`). Route paths mirror this structure (e.g., `/settings/general`). Use a config-driven `routes.ts` for sidebar, router, and breadcrumbs. Naming: PascalCase for components, kebab-case for routes.

## 4. Do vs Don’t Table

| Do                                           | Don’t                         |
| -------------------------------------------- | ----------------------------- |
| Use shared `Button` and other UIs with props | Create custom styled buttons  |
| Use Chart.js for charts                      | Use random chart libs         |
| Use DataTable everywhere                     | Repeat table logic per page   |
| Use config-driven routes                     | Hardcode routes in many files |
| Use FormField utilities                      | Repeat input markup           |

## 5. Page Prioritization

**Core Pages:** Dashboard, Human Resource (HR), Accounts, Sales, Stocks. **Support Pages:** Backup, SMS, Reporting, Settings

## 6. Code, Docs & Premium Enhancements

- **Centralized Types:** All entity types/interfaces in `types/entities.ts` (Employee, Party, Product, etc.). **Config-Driven:** Sidebar/routes are config-driven. All modals use the same fields for New/Edit; Edit pre-fills data. **Docs:** Add sample table schemas and page mockups (pseudo-code or Figma link). Add glossary (e.g., Godown = warehouse, Emptybag = packaging bag). **Premium Features:** Role-Based Access Control (RBAC) for all modules/pages. Offline-first support (service workers, caching for key pages). Audit logs/activity history for financial & HR operations.

## 7. Tailwind Custom Utilities (Concise)

- Use `shadow-card-hover`, `shadow-card-lg` for cards. Use `animate-fade-in`, `animate-slide-in`, `animate-pulse-slow` for transitions. Prefer these over default Tailwind for a consistent, premium look.

## 8. Modal & Form Rules

- All "New" modals are for creating, and "Edit" modals use the same fields but load existing data for update. Input fields: sensible widths based on expected data length (e.g., invoice no, phone, amounts, names, etc.). All modals must close on 'esc'. Long modals: scrollable, no visible scrollbars (overlay/auto-hide styles). Action buttons fixed and always visible at the bottom.

## 9. Page Blueprints (All Modules)

> All requirements below inherit the global, UI/UX, shared component, and modal/form rules above. Only unique fields/actions are listed per page. All v1 fields/actions are compulsory.

### Dashboard

- Quick Actions: Add Stock, Mark Attendance, New Purchase, Start Production (large buttons, icons). Recent Activities: List of latest actions (purchase, production, attendance, stock, payment) with timestamps. Monthly Revenue Trend: Chart.js line/bar chart. Production Overview: Chart.js chart. Layout: Responsive cards/sections.
- General filter on the top-left for daily, weekly, monthly data

### Settings (GeneralSettings)

- Modal vs. Page: All create/edit = modals; view/details = dedicated page/route. Tabs: General, Others Setting, Logo & Favicon. General: siteName, description, address, proprietor, proprietorEmail, contactNo. Others: itemsPerPage, copyrightText. Logo & Favicon: upload/preview favicon/logo. Tabbed interface, loading/saving states, feedback.

### Silo List

- Table: #, Silo Name, Silo Capacity, Description, Actions. Actions: Edit (modal), Delete (multi-select), Print. Modal: name, capacity, description.

### Sales Ledger

- Table (Invoices): #, Date, Party, Description, Amount. Table (Receives): #, Date, Party, Description, Amount. Filter/search: date range, search, print. Show totals at bottom.

### Designation List

- Table: #, Designation Name, Description, Actions. Modal: name, description.

### Employee List

- Table: #, Photo, Employee Name, Employee ID, Designation, Mobile, Salary, Actions. Modal: all v1 employee fields (see v1 for full list), photo preview if present. Filter by designation.

### Attendance List

- Table: #, Date, Total Employee, Total Present, Total Absent, Total Leave, Description, Actions. Filter/search: date picker, page size, search, new, delete, print.

### Monthly Attendance List

- Table: #, Date, Total Employee, Total Present, Total Absent, Total Leave, Description, Actions. Filter/search: page size, year, month, employee dropdown, search, print.

### Monthly Salary Sheet

- Table: #, Date, Year, Month, Description, Total Employee, Total Salary, Actions. Filter/search: page size, year, month, search, print. Modal: date, year, month, description, payment head, employee table (designation, ID, name, salary, bonus/OT, absent/fine, deduction, payment, note, signature). Show summary at top/bottom.

### Income/Expense/Bank/Others Head Lists & Ledgers

- Table: #, Head Name, Receives/Payments/Balance, Actions. Filter/search: page size, sort order, date range, search, print. Actions: New, Edit, Delete (multi-select), Print, Ledger. Modal: name (string), add multiple heads at once. Show totals at bottom. Ledger Details: #, Date, Description, Party, Amount. Filter/search: date range, search, print. Totals at bottom. Page, not modal.

### Party/Party Type/Party Payment/Due/Debts Lists & Ledgers

- Table: #, Type, Name, Company, Bank Account No, Mobile, Address, Balance/Due/Debts, Actions. Filter/search: page size, party type, name/mobile/address search, print. Actions: New, Edit (modal), Delete (multi-select), Print, Ledger. Modal: party type, name, company name, bank account no, mobile no, address. Show balance/due/debts at bottom. Ledger Details: Receives/Payments tables, filter/search, print, totals/balance at bottom. Page, not modal.

### Category/Product Lists

- Table: #, Category Name, Unit, Description, Actions. Product Table: #, Category, Product, Unit, Type, Size, Weight, Buy Price, Sale Price, Actions. Filter/search: page size, search, category dropdown. Actions: New, Edit (modal), Delete (multi-select), Print. Modal: category, name, unit, type, size, weight, buy price, sale price.

### Emptybag Purchase/Sales/Payment/Stocks

- Table: #, Date, Invoice No, Party, Items, Quantity, Price, Description, Actions. Filter/search: page size, date range, invoice/party search, print. Actions: New, Edit (modal), Delete (multi-select), Print, View (navigates to details print page). Modal: invoice no, date, party, notes, product table (category, product, quantity, rate, price). Show totals at bottom. Print Page: all details, signature/autograph section at bottom.

### Purchase/Production/Stocks (List, Order, Details, Ledger)

- Table: #, Date, Invoice No, Party, Items, Quantity, Total, Discount, Net Price, Actions. Filter/search: page size, date range, invoice/party/product search, print. Actions: New, Edit (modal), Delete (multi-select), Print, View (navigates to details print page). Modal: invoice no, date, challan no, party, transport info, notes, totals, product table (category, product, godown, quantity, net weight, rate, total price). Show totals at bottom. Print Page: all details, signature/autograph section at bottom.

### Daily Report/Financial Statement

- Date picker, search, clear, print. Opening balance at top. Two tables: Receives, Payments. Show totals at bottom. Signature lines for Accountant, Manager, Director, Managing Director at bottom.

### SMS Module (Templates & Send SMS)

- Tabs: Templates, Send SMS. Templates: #, Name, Text, Actions. Filter/search, print. Modal: name, text. Send SMS: template dropdown, text (auto-filled/editable), SMS type, receiver. Action: Send SMS.

### Backup & Restore Database

- Sections: Generate Backup, Restore Backup, Available Backup. Table: #, Created At, Created By, Actions (Download Backup).

## 10. Glossary

- Godown = warehouse. Emptybag = packaging bag.

## 11. Final Project Structure Note

- Single `pages` directory, sidebar navigation as subdirectories, sub-nav/page as files. All code must follow above rules: preserve all v1 fields/features, allow premium UI/UX improvements, use shared components/utilities.

**Dashboard**

- /dashboard

**Settings**

- /settings/general
- /settings/silo
- /settings/godown

**Human Resource**

- /hr/designation
- /hr/employee
- /hr/attendance
- /hr/attendance/monthly
- /hr/salary

**Accounts**

- /head-income
- /head-expense
- /head-bank
- /head-others
- /transactions

**Party**

- /party-types
- /parties
- /parties/payments
- /parties/due
- /parties/debts

**Products**

- /category
- /products

**Empty Bags**

- /emptybag-purchase
- /emptybag-sales
- /emptybag-receive
- /emptybag-payment
- /emptybag-stocks

**Purchase**

- /purchases
- /purchase/ledger
- /rice-purchase
- /ricepurchase/ledger

**Sales**

- /sales
- /sale/ledger

**Production**

- /productions
- /production/details

**Stocks**

- /stocks
- /stocks-godown
- /stocks/details
- /addstocks
- /production-stocks
- /production-stock/details
- /emptybag-stocks

**Reporting**

- /dailyreport
- /financial-statement

**SMS Service**

- /sms-templates
- /sendsms

**Database Backup**

- /backup

## Project Overview

You are generating code for a modern rice mill management system using React, TypeScript, Vite, Tailwind CSS, and Lucide icons. The project is modular, maintainable, and uses reusable UI components.

## General Rules

- **Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Lucide icons.
- **UI Components:** Use only shared components (Button, Spinner, EmptyState, Tabs, etc.) for all actions and controls. Always check and reuse their props (e.g., variant, size, icon, loading for Button) to maximize flexibility and consistency.
- **Preserve Core Details:** All fields, table columns, actions, and features from v1 are compulsory and must be present. Do not remove or rename any required element.
- **Premium Suggestions:** You may suggest or implement a more premium, modern, or user-friendly layout or presentation (e.g., improved tabs, cards, skeletons, animations, feedback), but always keep all required data and actions.
- **Layout Flexibility:** The layout and presentation can be improved, but the core functionality and data must remain unchanged for admin familiarity.
- **Color Palette:**
  - Primary: #AF792F (bg-primary)
  - Secondary: #b8c4a7 (bg-secondary)
  - Use only these for accents, highlights, and focus states.
- **Layout:**
  - Responsive, mobile-first, and grid-based where appropriate.
  - Use compact, clean, and consistent spacing and typography.
  - Avoid excessive gradients or custom styles unless specified.
- **Navigation:**
  - Each main sidebar link is a directory.
  - Each sub-nav link is a file in that directory.
  - Use React Router for navigation.
- **Actions:**
  - Use Lucide icons for all action buttons.
  - All buttons must use the shared Button component (no custom button styles).
- **Tables & Cards:**
  - Use consistent table/card structure.
- **Forms & Filters:**
  - Use shared input styles and Button for all form actions.
  - Filters and search bars should be compact and consistent.
- **Code Quality:**
  - DRY, readable, and maintainable code.
  - No inline styles unless absolutely necessary.
  - Use TypeScript types and interfaces for all data.
- **UX:**
  - Robust error handling and empty states.
  - All pages must be visually and functionally consistent.
- **Cards & KPIs:** For any page where summary/stat cards (e.g., totals, KPIs) improve UX (like SalarySheet), include them at the top. The AI should determine and suggest cards for relevant pages, but all required data must be present.
- **KPI/Stat Cards:** All KPI/stat cards must use the following layout: left-aligned icon (colored - primary-800), right of icon is a vertically stacked title (small, uppercase) and value (large, bold). Card is white, rounded, with subtle shadow and hover effect. Cards must be responsive, animated, and visually consistent. See `Card.tsx` for implementation details.
- Deliverables
  - Production ready
  - Premium designs give suggestions or create KPI cards in pages that need it

## Tailwind Custom Utilities (Concise)

- Use `shadow-card-hover`, `shadow-card-lg` for cards.
- Use `animate-fade-in`, `animate-slide-in`, `animate-pulse-slow` for transitions.
- Prefer these over default Tailwind for a consistent, premium look.

---

## Final Project Structure Note

- The final codebase should have a single `pages` directory.
- Each main sidebar navigation link is a subdirectory inside `pages`.
- Each sub-nav/page is a file within its respective directory.
- All code must follow the above rules: preserve all v1 fields/features, allow premium UI/UX improvements, and use shared components/utilities.

## General Modal & Form Rules

- All "New" modals are for creating, and "Edit" modals use the same fields but load existing data for update.
- Input fields should use sensible widths based on expected data length (e.g., invoice no, phone, amounts, names, etc.).
- All modals must close on 'esc'.
- Long modals should be scrollable with no visible scrollbars (use overlay/auto-hide styles).
- Action buttons (submit, save, etc.) must be fixed and always visible at the bottom, even when scrolling.

---

## Dashboard

- Sections:
  - Quick Actions: Add Stock, Mark Attendance, New Purchase, Start Production (large buttons, icons).
  - Recent Activities: List of latest actions (purchase, production, attendance, stock, payment) with timestamps.
  - Monthly Revenue Trend: Chart.js line or bar chart showing revenue trend.
  - Production Overview: Chart.js chart showing production stats/overview.
- Use chart.js for all charts.
- Layout: Responsive cards/sections as shown.

## Settings Page (GeneralSettings)

- **Modal vs. Page Navigation:** All create/edit actions (New, Edit) should use responsive modals with the shared modal props pattern. Actions that require viewing or detailed data (e.g., View, Ledger, Details) must navigate to a dedicated page/route (never a modal), unless otherwise specified.
- Three tabs: General, Others Setting, Logo & Favicon.
- All fields and actions below are compulsory:
  - General: siteName, description, address, proprietor, proprietorEmail, contactNo (editable, save).
  - Others: itemsPerPage (number), copyrightText (text), save.
  - Logo & Favicon: upload/preview favicon and logo images, save.
- Use a tabbed interface for navigation.
- Show loading/saving states and feedback.
- All form fields must be present and functional.
- Layout and presentation can be improved for a premium feel (cards, tabs, skeletons, animation), but do not remove or rename any required field or action.

All tables/lists must support: pagination (page size: 10, 25, 50, 100), search/filter (by all relevant fields), row selection (checkboxes), bulk delete, and actions (edit, delete, print, new, view as applicable).
Show loading, empty, and error states using shared Spinner and EmptyState components. Use skeletons for loading where appropriate.
Use premium UI/UX: cards, transitions, and consistent spacing/typography. All tables/lists must be responsive and visually consistent.
All v1 fields, columns, and actions are compulsory; do not remove or rename any required element.
All modals must use the shared modal props pattern and close on 'esc'.

---

## Silo List Page

- Paginated, searchable table: #, Silo Name, Silo Capacity, Description, Actions.
- Actions: Edit (modal), Delete (multi-select), Print.
- Table: row selection (checkboxes), bulk delete, page size (10, 25, 50, 100), search by name/description.
- Modal: name (string), capacity (number), description (string), Save/Update, Cancel.
- Show loading/empty states.

## Sales Ledger Page

Table columns (Invoices): #, Date, Party, Description, Amount.
Table columns (Receives): #, Date, Party, Description, Amount.
Filter/search bar: date range, search, print.
Show totals at bottom of each table.

- If summary/stat cards (e.g., total silos, total capacity) would improve UX, include them at the top.
- All fields, columns, and actions are compulsory; do not remove or rename.
- Layout, modal, and table can be improved for a premium feel (cards, transitions, skeletons), but core functionality must remain.

## Shared Table/List Page Requirements

- All tables/lists must support: pagination (page size: 10, 25, 50, 100), search/filter (by all relevant fields), row selection (checkboxes), bulk delete, and actions (edit, delete, print, new, view as applicable).
- Show loading, empty, and error states using shared Spinner and EmptyState components. Use skeletons for loading where appropriate.
- Use premium UI/UX: cards, transitions, and consistent spacing/typography. All tables/lists must be responsive and visually consistent.
- All v1 fields, columns, and actions are compulsory; do not remove or rename any required element.
- All modals (for New, Edit, etc.) must use the shared modal props pattern and close on 'esc'.
- Actions that require viewing or detailed data (e.g., View, Ledger) should navigate to a dedicated page/route (not a modal). Only New/Edit should use modals unless otherwise specified.

## Designation List Page

- Table columns: #, Designation Name, Description, Actions.
- Modal fields: name (string), description (string).

## Employee List Page

- Table columns: #, Photo, Employee Name, Employee ID, Designation, Mobile, Salary, Actions.
- Modal fields: all v1 employee fields (see v1 for full list), including name, empId, designation, mobile, salary, salaryType, joiningDate, grossAmount, bonus, loan, tax, netSalary, absence, email, bankName, accountName, accountNo, address, nationalId, fatherName, motherName, bloodGroup, others, photo. Show photo preview if present.
- Filter by designation.
- Any table with photo data (like Employee List) must include a photo column.

## Attendance List Page

- Table columns: #, Date, Total Employee, Total Present, Total Absent, Total Leave, Description, Actions, row selection (checkbox).
- Filter/search bar: date picker, page size, search, new, delete, print.

## Monthly Attendance List Page

- Table columns: #, Date, Total Employee, Total Present, Total Absent, Total Leave, Description, Actions, row selection (checkbox).
- Filter/search bar: page size, year, month, employee dropdown, search, print.

## Monthly Salary Sheet Page

- Table columns: #, Date, Year, Month, Description, Total Employee, Total Salary, Actions, row selection (checkbox).
- Filter/search bar: page size, year, month, search, print.
- Actions: New, Edit, View, Delete (multi-select), Print.
- Modal fields: date, year, month, description, payment head, and a table of employees with: designation, ID, name, salary, bonus/OT, absent/fine, deduction, payment, note, signature. Show summary (total employee, total salary) at top or bottom.

## Income Head List Page

- Table columns: #, Head Name, Receives, Actions, row selection (checkbox).
- Filter/search bar: page size, sort order, date range, search, print.
- Actions: New, Edit, Delete (multi-select), Print, Ledger.
- Modal fields: name (string), add multiple heads at once.
- Show total receives at bottom.

## Sales Ledger Page

- Table columns (Invoices): #, Date, Party, Description, Amount.
- Table columns (Receives): #, Date, Party, Description, Amount.
- Filter/search bar: date range, search, print.
- Show totals at bottom of each table.
- The main ledger view is a page. The View action navigates to `/transactions/:id` (not a modal). New and Edit actions use responsive modals.

## Expense Head List Page

Table columns: #, Head Name, Payments, Actions, row selection (checkbox).
Filter/search bar: page size, sort order, date range, search, print.
Actions: New, Edit, Delete (multi-select), Print, Ledger.
Modal fields: name (string), add multiple heads at once.
Show total payments at bottom.

## Ledger Head Details Page

Table columns: #, Date, Description, Party, Amount.
Filter/search bar: date range, search, print.
Show totals at bottom.
This is a page, not a modal. Navigated to from the Ledger action in Head List.

## Bank Head List Page

Table columns: #, Head Name, Receive, Payment, Balance, Actions, row selection (checkbox).
Filter/search bar: page size, sort order, date range, search, print.
Actions: New, Edit, Delete (multi-select), Print, Ledger.
Modal fields: name (string), add multiple heads at once.
Show total receive, payment, and balance at bottom.

## Banking Head Ledger Details Page

Table columns (Receive): #, Date, Party, Description, Amount.
Table columns (Payments): #, Date, Party, Description, Amount.
Filter/search bar: date range, search, print.
Show totals at bottom of each table.
This is a page, not a modal. Navigated to from the Ledger action in Bank Head List.

## Others Head List Page

Table columns: #, Head Name, Receive, Payment, Balance, Actions, row selection (checkbox).
Filter/search bar: page size, sort order, date range, search, print.
Actions: New, Edit, Delete (multi-select), Print, Ledger.
Modal fields: name (string), add multiple heads at once.
Show total receive, payment, and balance at bottom.

## Ledger Head Details Page (Others)

Table columns (Receive): #, Date, Party, Description, Amount.
Table columns (Payments): #, Date, Party, Description, Amount.
Filter/search bar: date range, search, print.
Show totals and balance at bottom of each table.
This is a page, not a modal. Navigated to from the Ledger action in Others Head List.

## Party Type List Page

Table columns: #, Name, Description, Actions, row selection (checkbox).
Filter/search bar: page size, search, .
Actions: New, Edit (modal), Delete (multi-select).
Modal fields: name (string), description (string).

## Transaction List Page

Table columns: #, Date, Party, Voucher Type, From Head, To Head, Description, Amount, Status, Actions, row selection (checkbox).
Filter/search bar: page size, sort order, voucher type, head, party, date range, search, , print.
Actions: New (Receive, Payment, Invoice), Edit (modal), Delete (multi-select), Approve, Print, View (navigates to `/transactions/:id`).
Modal fields (for New/Edit): date, description, amount, party, from head, to head, voucher type (for invoice: type radio for receive/payment). Use color-coded backgrounds for different voucher types.
Status column shows transaction state (e.g., Completed).
Show totals at bottom if needed.
Note: Edit is a modal, View navigates to a page/route for printable voucher details.

## Transaction Voucher Print Page

Shows all details of a single transaction in printable format, including: payment from, party, description, amount, date, voucher number, created by, and signature lines. Route: `/transactions/:id`.

## Party List Page

Table columns: #, Type, Name, Company, Bank Account No, Mobile, Address, Balance, Actions, row selection (checkbox).
Filter/search bar: page size, party type, name/mobile/address search, print.
Actions: New, Edit (modal), Delete (multi-select), Print, Ledger.
Modal fields: party type, name, company name, bank account no, mobile no, address.
Show balance at bottom.

## Party Ledger Details Page

Table columns (Receives): #, Date, Description, Amount.
Table columns (Payments): #, Date, Description, Amount.
Filter/search bar: date range, search, print.
Show totals and balance at bottom of each table.
This is a page, not a modal. Navigated to from the Ledger action in Party List.

## Party Payment List Page

Table columns: #, Date, Type, Head, Party, Description, Created By, Amount, Actions, row selection (checkbox).
Filter/search bar: page size, party, voucher type, date range, party search, print.
Actions: Edit (modal), Delete (multi-select), Print, View (navigates to voucher print page).
Modal fields: date, type, head, party, description, amount.
Show totals at bottom if needed.
Note: Edit is a modal, View navigates to a page/route for printable voucher details.

## Party Payment Voucher Print Page

Shows all details of a single party payment in printable format, including: payment to, party, description, amount, date, voucher number, created by, and signature lines. Route: `/parties/payments/:id`.

## Party Due List Page

Table columns: #, Name, Company Name, Mobile, Address, Due, Actions, row selection (checkbox).
Filter/search bar: page size, search, print.
Actions: Print, Ledger (navigates to Party Ledger Details page).
Show due totals at bottom if needed.

## Party Ledger Details Page

Table columns (Receives): #, Date, Description, Amount.
Table columns (Payments): #, Date, Description, Amount.
Filter/search bar: date range, search, print.
Show totals and balance at bottom of each table.
This is a page, not a modal. Navigated to from the Ledger action in Party Due List.

## Party Debts List Page

Table columns: #, Name, Company Name, Mobile, Address, Debts, Actions, row selection (checkbox).
Filter/search bar: page size, search, print.
Actions: Print, Ledger (navigates to Party Ledger Details page).
Show debts totals at bottom if needed.

## Party Debts Ledger Details Page

Table columns (Receives): #, Date, Description, Amount.
Table columns (Payments): #, Date, Description, Amount.
Filter/search bar: date range, search, print.
Show totals and balance at bottom of each table.
This is a page, not a modal. Navigated to from the Ledger action in Party Debts List.

## Category List Page

Table columns: #, Category Name, Unit, Description, Actions, row selection (checkbox).
Filter/search bar: page size, search, .
Actions: New, Edit (modal), Delete (multi-select).
Modal fields (New/Edit): category name, category unit (dropdown), category description.

## Product List Page

Table columns: #, Category, Product, Unit, Type, Size, Weight, Buy Price, Sale Price, Actions, row selection (checkbox).
Filter/search bar: page size, product search, category dropdown, .
Actions: New, Edit (modal), Delete (multi-select), Print.
Modal fields (New/Edit): category (dropdown), name, unit (dropdown), type (dropdown), size, weight, buy price, sale price.

## Emptybag Purchase List Page

Table columns: #, Date, Invoice No, Party, Items, Quantity, Price, Description, Actions, row selection (checkbox).
Filter/search bar: page size, date range, invoice search, party/mobile/address search, print.
Actions: New, Edit (modal), Delete (multi-select), Print.
Modal fields (New/Edit): invoice no, date, party (dropdown), notes, and a table of products with: category, product, quantity, rate, price.
Show totals at bottom if needed.

## Emptybag Sales List Page

Table columns: #, Date, Invoice No, Party, Items, Quantity, Price, Description, Actions, row selection (checkbox).
Filter/search bar: page size, date range, invoice search, party/mobile/address search, print.
Actions: New, Edit (modal), Delete (multi-select), Print, View (navigates to sales details print page).
Modal fields (New/Edit): invoice no, date, party (dropdown), notes, and a table of products with: category, product, quantity, rate, price.
Show totals at bottom if needed.
Note: Edit is a modal, View navigates to a page/route for printable sales details.

## Emptybag Sales Details Print Page

Shows all details of a single emptybag sales in printable format, including: invoice no, date, party, address, mobile, notes, and a table of products with: category, product, unit, size, quantity, rate, price. Include signature/autograph section at the bottom. Route: `/emptybag-sales/:id`.

## Emptybag Payment List Page

- Table columns: #, Date, Invoice No, Party, Items, Quantity, Description, Actions, row selection (checkbox).
- Filter/search bar: page size, date range (from/to), invoice search, party/mobile/address search, Search, Clear, Print.
- Actions: New, Delete (multi-select), Print.
- Modal for New: opens responsive modal (see below).
- Show totals at bottom (e.g., total quantity).
- Use shared table/list requirements: pagination (10, 25, 50, 100), search/filter, row selection, bulk delete, loading/empty/error states, premium UI/UX, responsive, consistent.
- All v1 fields, columns, and actions are compulsory.

## Emptybag Payment Modal (New/Edit)

- Modal fields: invoice no, date, party (dropdown), notes, and a table of products with: category, product, quantity (editable).
- Use shared modal props pattern: `item: EmptybagPayment | null`, `onClose`, `onSave`. Modal closes on 'esc'.
- Show product table with selectable rows and editable quantity.
- Submit button at bottom.
- All fields must be present and functional.

## Emptybag Stocks List Page

- Table columns: #, Category, Product Name, Size, Weight, Opening, Receive, Purchase, Payment, Sales, Stocks.
- Filter/search bar: page size, party (dropdown), product search, Search, Clear, Print.
- Actions: Opening Stock (opens Opening Stock Details form), Print.
- Show company header, address, and current date above the table.
- Show totals row at the bottom for all numeric columns.
- Use shared table/list requirements: pagination (10, 25, 50, 100), search/filter, loading/empty/error states, premium UI/UX, responsive, consistent.
- All v1 fields, columns, and actions are compulsory.

## Emptybag Opening Stock Details Form

- Fields: date, product (dropdown), size, weight, quantity (editable).
- Add Product button to add more rows.
- All fields must be present and functional.
- Use shared form/modal styles and premium UI/UX.

## Purchase List Page

- Table columns: #, Date, Invoice No, Party, Items, Quantity, Total, Discount, Net Price, Actions, row selection (checkbox).
- Filter/search bar: page size, date range (from/to), invoice search, party/mobile/address search, Search, Print.
- Actions: New, Delete (multi-select), Print, View (navigates to purchase details print page), Edit (modal).
- Show totals at bottom for quantity, total, net price.
- Use shared table/list requirements: pagination (10, 25, 50, 100), search/filter, row selection, bulk delete, loading/empty/error states, premium UI/UX, responsive, consistent.
- All v1 fields, columns, and actions are compulsory.

## Purchase Order Modal/Page (New/Edit)

- Fields: invoice no, date, challan no, party (dropdown), transport info, notes, total quantity, total net weight, invoice amount, discount, total, previous balance, net payable, paid amount, current balance.
- Product table: category, product, godown (dropdown), quantity (bag), net weight (kg), rate, total price (all editable).
- Add/remove product rows.
- Submit button at bottom.
- Use shared modal props pattern: `item: Purchase | null`, `onClose`, `onSave`. Modal closes on 'esc'.
- All fields must be present and functional.

## Purchase Details Print Page

- Shows all details of a single purchase in printable format, including: company header, address, invoice no, date, party, address, mobile, created by, and a table of products with: description, quantity (bag), net weight (kg), rate, total price.
- Shows invoice amount, discount, total amount, previous balance, net payable, paid amount, current balance.
- Show details/notes section.
- Route: `/purchases/:id`.
- Include signature/autograph section at the bottom if present in v1.

## Purchase Ledger Page

- Table columns: #, Date, Invoice No, Party, Product, Quantity (Bag), Net Weight (Kg), Rate, Total Price.
- Filter/search bar: page size, date range (from/to), invoice search, party/mobile/address search, product search, Search, Print.
- Actions: New (sam as pur), Print.
- All v1 fields, columns, and actions are compulsory.

## Production List Page

- Table columns: #, Date, Invoice No, Silo Info, Items, Quantity, Weight, Actions, row selection (checkbox).
- Filter/search bar: page size, date range (from/to), invoice search, Search, Print.
- Actions: New, Delete (multi-select), Print, View, Edit.
- Show totals at bottom for quantity and weight.
- All v1 fields, columns, and actions are compulsory.

## Production Order (New/Edit)

- Fields: invoice no, date, description.
- Product table: category, product, godown, silo, quantity (bag), net weight (all editable).
- Add/remove product rows.
- Submit button.
- All fields must be present and functional.

## Production Details Print Page

- Shows all details of a single production in printable format: company header, invoice no, date, product table (category, product, godown, silo, quantity, weight).
- Includes authorized seal and signature section at the bottom.
- All v1 fields and layout are compulsory.

## Production Stocks List Page

- Table columns: #, Date, Invoice No, Production No, Items, Quantity, Net Weight, Actions, row selection (checkbox).
- Filter/search bar: page size, date range (from/to), invoice search, Search, Print.
- Actions: New, Delete (multi-select), Print.
- Show totals at bottom for quantity and net weight.
- All v1 fields, columns, and actions are compulsory.

## Production Stocks Order (New/Edit)

- Fields: invoice no, date, production order (dropdown), description.
- Product table: category, product, size, weight, godown, quantity, net weight (all editable).
- Add/remove product rows.
- Submit button.
- All fields must be present and functional.

## Production Stocks Details Page

- Table columns: #, Date, Invoice No, Production No, Product, Size, Weight, Godown, Quantity, Net Weight.
- Filter/search bar: page size, date range (from/to), invoice search, product search, Search, Print.
- Actions: New, Print.
- Show totals at bottom for quantity and net weight.
- All v1 fields, columns, and actions are compulsory.

## Stocks Details Page

- Table columns: #, Category, Product, Opening, Add, Purchase, Sales, Production, Production Stocks, Stock, Avg Price, Total Price.
- Filter/search bar: page size, category dropdown, godown dropdown, product search, Search, Print.
- Actions: Opening Stock, Print.
- Show company header, address, and current date above the table.
- Show totals at bottom for all numeric columns.
- All v1 fields, columns, and actions are compulsory.

## Opening Stock Details Page

- Fields: date, godown, category, product, size, weight, quantity, net weight, rate, price.
- Add Product button to add more rows.
- Table of opening items with: date, category, product, size, weight, quantity, net weight, rate, price, action (delete).
- Show totals at bottom for quantity and net weight.
- All fields must be present and functional.

## Add Stocks List Page

- Table columns: #, Date, Product, Quantity (Bag), Net Weight (Kg), Rate, Total Price, Actions, row selection (checkbox).
- Filter/search bar: page size, date range (from/to), product dropdown, Search, Print.
- Actions: New, Delete (multi-select), Print, Edit.
- Show totals at bottom for quantity, net weight, total price.
- All v1 fields, columns, and actions are compulsory.

## Add Stocks Order (New/Edit)

- Fields: date, product (dropdown), godown (dropdown), quantity (bag), net weight (kg), rate, price, notes.
- Submit button.
- All fields must be present and functional.

## Stock Register Page

- Filter/search bar: page size, category dropdown, product dropdown, product search, date range (from/to), Search, Print.
- All v1 fields, columns, and actions are compulsory.

## Daily Report Page

- Date picker, Search, Clear, Print.
- Show opening balance at top.
- Two tables: Receives (SL, Party, From Head, To Head, Description, Amount), Payments (SL, Party, From Head, To Head, Description, Amount).
- Show totals at bottom of each table.
- Show opening balance, total receives, total payments, and closing balance below tables.
- Signature lines for Accountant, Manager, Director, Managing Director at bottom.
- All v1 fields, columns, and layout are compulsory.

## Financial Statement Page

- Filter/search bar: date range (from/to), Search, Clear, Print.
- Show opening balance at top.
- Two tables: Receives (SL, Head, Amount), Payments (SL, Head, Amount).
- Show totals at bottom of each table.
- All v1 fields, columns, and layout are compulsory.

## SMS Module (Templates & Send SMS)

- Suggestion: Combine SMS Templates and Send SMS into a single module with tabs: "Templates" and "Send SMS".

### Templates Tab

- Table columns: #, Name, Text, Actions, row selection (checkbox).
- Filter/search bar: page size, sort order, search, Search, Print.
- Actions: New, Delete (multi-select), Print, Edit.
- Modal fields: name, text.

### Send SMS Tab

- Fields: SMS template (dropdown), text (auto-filled or editable), SMS type (text/unicode), receiver.
- Actions: Send SMS.
- Selecting a template auto-fills the text field.

## Backup and Restore Database Page

- Sections: Generate Backup, Restore Backup, Available Backup.
- Generate Backup: button to create a new backup.
- Restore Backup: file input and button to restore from backup file.
- Available Backup table: #, Created At, Created By, Actions (Download Backup).
- All v1 fields, actions, and layout are compulsory.
