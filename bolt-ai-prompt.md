# Ammam Rice Mill Frontend Code Standardization Guide

This guide defines the core patterns and interfaces for maintaining consistent React/TypeScript components across the application.

## Component Structure & Patterns

## Core Component Interfaces

### Common Props & Types

````typescript
// Base response type for all API calls
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: { total: number; page: number; pageSize: number; }
}

// UI Component Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

interface CardProps {
  icon?: React.ReactNode;
  hover?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: { key: string; label: string; sortable?: boolean; }[];
  pagination?: { currentPage: number; totalPages: number; };
  selection?: { selectedItems: string[]; };
  actions?: { onEdit?: (item: T) => void; };
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

## Standard Implementation Patterns

### State Management
```typescript
// Required state variables
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(false);
const [initialLoading, setInitialLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [showModal, setShowModal] = useState(false);
const { showToast } = useToast();
````

### Required Features

1. Data Management

- API calls using `api` utility from `utils/fetcher.ts`
- Error handling with toast notifications
- Loading states and skeleton screens
- Refresh functionality with animation

2. UI Components Usage

- `Card`: Metrics and content containers
- `Button`: Actions with variants and loading states
- `Table`: Data display with sorting/pagination
- `Modal`: Forms with validation
- `FilterBar`: Live Search and filtering
- `Toast`: User feedback
- `Skeleton`: Loading states
- `Tabs`: Sectioned content

### Common CSS Classes

```css
/* Layout */
.animate-fade-in
.space-y-6
.grid-cols-1 md:grid-cols-2 gap-6

/* Forms */
.input-base
.form-label
.required:after {
  content: " *";
}

/* Cards */
.metric-card {
  /* for value display cards */
}
.hover:scale-105 {
  transition: transform 0.2s;
}
```

## Implementation Checklist

### Required Setup

1. Import Dependencies

```typescript
import { useState, useEffect } from "react";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";
import { required UI components } from "../../components/ui";
```

2. Initialize State & Load Data

- Setup state variables using standard patterns
- Implement data fetching with loading states
- Add error handling with toast notifications

3. Implement Features

- Add liver search functionality with FilterBar
- Setup refresh button with animation
- Implement client-side filtering
- Add keyboard shortcuts (
- Configure loading states and skeletons

### Quality Standards

1. Use TypeScript for all components
2. Implement error boundaries
3. Add loading states for all operations
4. Include toast notifications for user feedback
5. Ensure responsive design
6. Follow consistent form validation
7. Use proper keyboard shortcuts

Remember to:

- Use provided UI components from `/components/ui`
- Implement loading states with skeletons
- Use client-side filtering for live search
- Add refresh functionality with animation
- Follow form validation patterns
- Include proper error handling

## Enhancing Existing Components

When provided with existing components, analyze and implement missing features:

1. Check for Required Features:

- Refresh functionality with animation
- Loading states with SkeletonCard components
- Client-side live search with FilterBar
- Toast notifications for operations
- Keyboard shortcuts 
- Error handling with TypeScript

2. State Management Audit:

- Loading states (initial and operation)
- Search and filter states
- Selection states for tables
- Modal states for forms

3. UI Component Integration:

- Replace custom implementations with standard UI components
- Add missing loading indicators
- Implement proper form validation
- Add Toast notifications for user feedback

4. Code Structure:

- Follow TypeScript patterns
- Implement error boundaries
- Add proper interfaces
- Follow consistent naming conventions

Example Enhancement Request:
"Please update this component to include missing implementations from the standardization guide, focusing on loading states, error handling, and UI component consistency."

## Reference Components Analysis

The following components serve as reference implementations showcasing the design patterns:

1. `GeneralSettings.tsx`:

   - Form handling with validation
   - File upload handling
   - Tabbed interface
   - API integration patterns

2. `EmployeeList.tsx`:

   - Data table with CRUD operations
   - Live Search and filtering
   - Metric cards implementation
   - Modal form patterns

3. `GodownList.tsx`:
   - Basic CRUD operations
   - Loading states
   - Toast notifications
   - Error handling

When implementing new components, refer to these for consistent patterns and implementations.

## Pending Modules for Implementation

### Purchase Management

- Paddy Purchase
- Rice Purchase
- Paddy Ledger
- Rice Ledger

### Sales Management

- Sales List
- Sales Ledger

### Stock Management

- Main Stocks
- Godown Stocks
- Production Stocks
- Empty Bag Stocks

### Production Module

- Production Orders
- Production Details
- Stock Updates

### HR Management

- Employee Management
- Attendance
- Monthly Attendance
- Salary Management

### Empty Bags Module

- Purchase
- Sales
- Stock Management
- Payments
- Receiving

### Settings

- General Settings
- Godown Management
- Silo Management

### Additional Features

- SMS Templates
- Financial Statements
- Daily Reports
- Database Backup

Each module should follow the standardization guide and implement all required features consistently.

## Special Component Implementations

Some components may require different structures or implementations from the standard patterns. In such cases, specific instructions will be provided for:

1. Custom Data Structures:

- Complex nested data handling
- Special calculation requirements
- Custom state management needs

2. Unique UI Requirements:

- Non-standard layouts
- Special interactive features
- Custom animations or transitions

3. Module-Specific Features:

- Financial calculations
- Stock movement tracking
- Production flow management
- Custom reporting formats

When encountering these cases, I would tell specific instructions about:

- Data structure modifications
- UI layout variations
- Special validation rules
- Custom calculation methods
- Module-specific business logic

Example Special Instruction:
"For this component, implement a custom nested table structure for stock movements, with running balance calculations and color-coded status indicators. The data structure and calculation methods will be provided separately."

```

```
