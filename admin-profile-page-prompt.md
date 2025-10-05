# Admin Profile Page Prompt

## Overview

Design and implement an **Admin Profile Page** for the application. The page should follow the design patterns and component structure of the `GeneralSettings` page, using the same design system, props, and UI conventions. You will be provided with a sample of the `GeneralSettings` component to use as inspiration for props and design.

## Requirements

### Frontend (React)

- The page must use the existing design system (cards, tabs, buttons, forms, etc.).
- Follow the structure and prop patterns of the `GeneralSettings` component (sample will be provided).
- Include editable fields for admin profile information (e.g., name, email, password, avatar, contact info, etc.).
- Avatar preview and multer functionality. file max size aand all other possible scenario handling.
- Provide UI for updating profile details and changing the password.
- Show success/error toasts on API actions.
- Use skeleton loaders and proper loading states.
- Integrate with the backend API for fetching and updating admin profile data.
- Use the `fetcher` utility or similar for API calls.

### Backend (Express)

- Create a new Express route file for admin profile management (e.g., `backend/routes/settings/admin-profile.js`).
- The backend should provide endpoints for:
  - GET `/api/admin/profile` — fetch current admin profile
  - PUT `/api/admin/profile` — update admin profile details
  - PUT `/api/admin/profile/password` — change admin password
  - POST `/api/settings/admin-profile` — create a new admin (sign up another admin)
- When creating a new admin, use the `argon2` hashing algorithm for passwords, utilizing the already available `backend/utils/hash.js` utility for hashing and verifying passwords. All setup for argon2 is already in place.
- Use the structure and conventions from an existing backend route file (e.g., `backend/routes/settings/general.js`) as a reference for middleware, validation, and response format.
- Ensure proper authentication middleware is applied.
- Return appropriate success/error responses.

### Additional Notes

- You will be given a sample of the `GeneralSettings` component to guide the frontend implementation, especially for props and design system usage.
- The backend file should follow the same structure as other settings route files for consistency.

---

**Paste the sample `GeneralSettings` component below for reference and inspiration.**
