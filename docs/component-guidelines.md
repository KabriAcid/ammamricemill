# Frontend Component Implementation Guidelines

## Core Requirements

### Component Structure

- Use TypeScript with proper interface definitions
- Follow React Functional Component pattern with proper type annotations
- Implement proper prop types and state management
- Keep component logic organized and separated from UI

### State Management

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

### Loading States

1. Initial Loading

```typescript
const [initialLoading, setInitialLoading] = useState(true);

// In skeleton loading state
{initialLoading ? (
  <>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </>
) : (
  // Actual content
)}
```

2. Operation Loading

```typescript
const [loading, setLoading] = useState(false);

// Use in buttons and operations
<Button loading={loading} onClick={handleOperation}>
  Save
</Button>;
```

### API Integration

```typescript
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get<ApiResponse<EntityType[]>>("/api/endpoint");
    if (response.success) {
      setData(response.data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    showToast("Failed to load data", "error");
  } finally {
    setLoading(false);
    setInitialLoading(false);
  }
};
```

### Refresh Implementation

```typescript
<button
  onClick={() => fetchData()}
  className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
    loading ? "animate-spin" : ""
  }`}
  disabled={loading}
  title="Refresh data (Ctrl+R)"
>
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
</button>
```

### Keyboard Shortcuts

```typescript
const handleKeyPress = useCallback((event: KeyboardEvent) => {
  // Ctrl/Cmd + F for search
  if ((event.ctrlKey || event.metaKey) && event.key === "f") {
    event.preventDefault();
    document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
  }
  // Ctrl/Cmd + R for refresh
  if ((event.ctrlKey || event.metaKey) && event.key === "r") {
    event.preventDefault();
    fetchData();
  }
}, []);

useEffect(() => {
  document.addEventListener("keydown", handleKeyPress);
  return () => {
    document.removeEventListener("keydown", handleKeyPress);
  };
}, [handleKeyPress]);
```

### Search and Filtering

```typescript
// Client-side filtering
const filteredData = data.filter((item) => {
  const matchesSearch =
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesFilter = !filterValue || item.category === filterValue;
  return matchesSearch && matchesFilter;
});

// Pagination
const totalPages = Math.ceil(filteredData.length / pageSize);
const startIndex = (currentPage - 1) * pageSize;
const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
```

### Component Layout Structure

```typescript
return (
  <div className="animate-fade-in">
    {/* Header Section */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Title</h1>
        <p className="mt-1 text-sm text-gray-500">Description</p>
      </div>
      {/* Refresh Button */}
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {loading ? (
        <SkeletonCards />
      ) : (
        <StatsCards />
      )}
    </div>

    {/* Main Content Card */}
    <Card>
      {/* Filter Bar */}
      <FilterBar>
        <SearchAndFilterControls />
      </FilterBar>

      {/* Data Table */}
      <Table
        data={paginatedData}
        columns={columns}
        loading={loading}
        pagination={{...}}
        selection={{...}}
        actions={{...}}
      />
    </Card>

    {/* Modal */}
    <Modal>
      <FormContent />
    </Modal>
  </div>
);
```

### CRUD Operations

```typescript
// Create/Update
const handleSave = async () => {
  if (!validateForm()) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  setLoading(true);
  try {
    const response = editingItem
      ? await api.put(`/endpoint/${editingItem.id}`, formData)
      : await api.post("/endpoint", formData);

    if (response.success) {
      showToast(response.message || "Saved successfully", "success");
      await fetchData();
      setShowModal(false);
      resetForm();
    }
  } catch (error) {
    console.error("Error saving:", error);
    showToast("Failed to save", "error");
  } finally {
    setLoading(false);
  }
};

// Delete
const handleDelete = async (ids: string[]) => {
  setLoading(true);
  try {
    const response = await api.delete("/endpoint", { ids });
    if (response.success) {
      showToast(response.message || "Deleted successfully", "success");
      await fetchData();
      setSelectedItems([]);
    }
  } catch (error) {
    console.error("Error deleting:", error);
    showToast("Failed to delete", "error");
  } finally {
    setLoading(false);
  }
};
```

### Form Handling

```typescript
const [formData, setFormData] = useState<FormDataType>({
  // Initial state
});

const resetForm = () => {
  setFormData({
    // Reset to initial state
  });
};

const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
```

## Style Guidelines

### CSS Classes

- Use Tailwind CSS utility classes
- Follow consistent spacing patterns
- Use responsive design patterns
- Maintain consistent color scheme
- Use animation classes for transitions

### Component Hierarchy

1. Page Component
2. Layout Components (Cards, Grid)
3. Data Display (Table, Lists)
4. Form Components
5. UI Elements (Buttons, Inputs)

## Best Practices

1. Error Handling

- Use try-catch in async operations
- Show user-friendly error messages
- Log errors to console for debugging
- Handle network errors gracefully

2. Performance

- Use client-side filtering for better UX
- Implement proper loading states
- Use pagination for large datasets
- Memoize callbacks and heavy computations

3. Data Management

- Keep data normalized
- Use proper TypeScript interfaces
- Handle null/undefined cases
- Format data consistently (dates, numbers, currency)

4. User Experience

- Show loading states for all operations
- Provide keyboard shortcuts
- Use toast notifications for feedback
- Maintain consistent UI patterns

5. Code Organization

- Group related state and effects
- Separate business logic from UI
- Use consistent naming conventions
- Comment complex logic
