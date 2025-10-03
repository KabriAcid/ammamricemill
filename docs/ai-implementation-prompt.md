# AI Implementation Prompt for Frontend Components

You are a React/TypeScript expert tasked with implementing frontend components for a business management system. Follow these specific patterns and requirements carefully to edit the components.

## Core Requirements

### Component Architecture

- Use TypeScript for all components
- Implement as functional components with proper type definitions
- Follow established project structure
- Maintain clean separation of concerns

### State Management Pattern

Always implement these state variables:

```typescript
const [data, setData] = useState<EntityType[]>([]);
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(25);
const [searchQuery, setSearchQuery] = useState("");
const [showModal, setShowModal] = useState(false);
const [editingItem, setEditingItem] = useState<EntityType | null>(null);
const [loading, setLoading] = useState(false);
const [initialLoading, setInitialLoading] = useState(true);
```

### Required Features

1. **Data Fetching**

   - Implement initial data load in useEffect
   - Show loading states during fetch
   - Handle errors with toast notifications
   - Provide refresh functionality

2. **Search and Filtering**

   - Implement client-side filtering
   - Support multiple filter criteria
   - Update results instantly
   - Preserve filter state

3. **Keyboard Shortcuts**

   - Ctrl/Cmd + F for search focus
   - Ctrl/Cmd + R for data refresh
   - Register/unregister in useEffect

4. **Loading States**

   - Show skeleton cards during initial load
   - Animate refresh icon during updates
   - Disable interactions during operations
   - Provide visual feedback for all operations

5. **Error Handling**
   - Use try-catch blocks for async operations
   - Show user-friendly error messages
   - Log technical details to console
   - Handle network errors gracefully

### Component Structure

Always implement this layout hierarchy:

```jsx
<div className="animate-fade-in">
  {/* Header Section */}
  <Header />

  {/* Stats Cards */}
  <StatsSection />

  {/* Main Content */}
  <MainContent />

  {/* Modal Forms */}
  <Modals />
</div>
```

### Visual Requirements

1. **Header Section**

```jsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
  <RefreshButton />
</div>
```

2. **Stats Cards**

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  {loading ? <SkeletonCards /> : <StatsCards data={statsData} />}
</div>
```

3. **Filter Bar**

```jsx
<FilterBar
  onSearch={setSearchQuery}
  placeholder="Search... (Ctrl+F)"
  value={searchQuery}
>
  <FilterControls />
  <ActionButtons />
</FilterBar>
```

### Implementation Requirements

1. **API Integration**

```typescript
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get<ApiResponse<EntityType[]>>("/api/endpoint");
    if (response.success) {
      setData(response.data);
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("Failed to load data", "error");
  } finally {
    setLoading(false);
    setInitialLoading(false);
  }
};
```

2. **CRUD Operations**

- Implement create/edit in modals
- Handle deletions without confirmation
- Show loading states during operations
- Refresh data after successful operations

3. **Form Handling**

- Validate required fields
- Show validation feedback
- Handle form submission
- Reset form after submission

### Style Guidelines

1. **Use These Tailwind Patterns**

- Containers: `animate-fade-in`
- Cards: `bg-white shadow-sm rounded-lg p-6`
- Buttons: `btn-primary`, `btn-outline`
- Text: Standard color scales (gray-900, gray-500)

2. **Loading States**

- Skeleton components for initial load
- Spinner animation for operations
- Disabled states for buttons
- Loading overlay for modals

### Error Handling Pattern

1. **API Errors**

```typescript
try {
  // API call
} catch (error) {
  console.error("Error context:", error);
  showToast(
    error instanceof Error ? error.message : "An unexpected error occurred",
    "error"
  );
} finally {
  setLoading(false);
}
```

2. **Form Validation**

```typescript
const validateForm = () => {
  const requiredFields = ["field1", "field2"];
  const missingFields = requiredFields.filter((field) => !formData[field]);

  if (missingFields.length > 0) {
    showToast("Please fill in all required fields", "error");
    return false;
  }
  return true;
};
```

### Performance Considerations

1. **Optimization Requirements**

- Memoize callbacks with useCallback
- Memoize heavy computations with useMemo
- Use proper key props in lists
- Implement proper cleanup in useEffect

2. **Data Handling**

- Handle null/undefined cases
- Format dates consistently
- Format numbers with proper decimals
- Handle currency values properly


### Documentation Requirements

1. **Code Documentation**

- Document complex logic
- Document component props
- Document type definitions
- Document utility functions

## Critical Reminders

1. **Never**

- Use server-side filtering for search
- Show confirmation dialogs for delete
- Use mock data
- Make unnecessary API calls

2. **Always**

- Show loading states
- Handle errors gracefully
- Provide user feedback
- Follow established patterns

3. **Maintain Consistency**

- Follow established naming conventions
- Use consistent spacing
- Follow component structure
- Use established type definitions

## Example Component Template

```typescript
import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, FilterBar, Modal } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import type { EntityType } from "../../types";

const ComponentName: React.FC = () => {
  // State management
  const [data, setData] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(false);

  // Implementation...

  return <div className="animate-fade-in">{/* Component structure... */}</div>;
};

export default ComponentName;
```

Follow these guidelines precisely when implementing new components. This will ensure consistency across the application and maintain the established patterns and best practices.
