
# Bolt AI Prompt: Rice Mill Management System (General Rules)

## Routes & Directory Structure

- All pages live under a single `pages` directory.
- Each main sidebar nav link is a subdirectory (e.g., `pages/settings`, `pages/hr`, `pages/attendance`).
- Each sub-nav/page is a file in its directory (e.g., `pages/settings/GeneralSettings.tsx`).
- Route paths should mirror this structure (e.g., `/settings/general`, `/hr/employee-list`).
- Use React Router for all navigation.

---

## All Routes (as in Sidebar)

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
- **KPI/Stat Cards:** All KPI/stat cards must use the following layout: left-aligned icon (colored - primary-800), right of icon is a vertically stacked title (small, uppercase) and value (large, bold). Card is white, rounded, with subtle shadow and hover effect. Cards must be responsive, animated, and visually consistent. See `DashboardCard.tsx` for implementation details.
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

## General Modal Props

- **Modal Props (General):** For all create/edit modals, props should follow the pattern: `item: EntityType | null`, `onClose: () => void`, `onSave: (item: EntityType) => void`. Use the correct type for each entity (e.g., Silo, Godown). Also modal should close when 'esc'

---

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

- Table columns: #, Employee Name, Employee ID, Designation, Mobile, Salary, Actions.
- Modal fields: all v1 employee fields (see v1 for full list), including name, empId, designation, mobile, salary, salaryType, joiningDate, grossAmount, bonus, loan, tax, netSalary, absence, email, bankName, accountName, accountNo, address, nationalId, fatherName, motherName, bloodGroup, others, photo. Show photo preview if present.
- Filter by designation.

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
Filter/search bar: page size, search, clear.
Actions: New, Edit (modal), Delete (multi-select).
Modal fields: name (string), description (string).

## Transaction List Page

Table columns: #, Date, Party, Voucher Type, From Head, To Head, Description, Amount, Status, Actions, row selection (checkbox).
Filter/search bar: page size, sort order, voucher type, head, party, date range, search, clear, print.
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
Filter/search bar: page size, search, clear.
Actions: New, Edit (modal), Delete (multi-select).
Modal fields (New/Edit): category name, category unit (dropdown), category description.

## Product List Page

Table columns: #, Category, Product, Unit, Type, Size, Weight, Buy Price, Sale Price, Actions, row selection (checkbox).
Filter/search bar: page size, product search, category dropdown, clear.
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