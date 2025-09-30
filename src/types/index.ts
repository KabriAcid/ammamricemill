// User type for AuthState
export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
}
// Auth State for context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
export interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  loading: boolean;
}
// Common types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Settings
export interface GeneralSettings {
  siteName: string;
  description: string;
  address: string;
  proprietor: string;
  proprietorEmail: string;
  contactNo: string;
  itemsPerPage: number;
  copyrightText: string;
  logoUrl?: string;
  faviconUrl?: string;
}

// HR Types
export interface Designation extends BaseEntity {
  name: string;
  description: string;
}

export interface Employee extends BaseEntity {
  name: string;
  empId: string;
  designation: string;
  mobile: string;
  email?: string;
  salary: number;
  salaryType: "monthly" | "daily";
  joiningDate: string;
  grossAmount: number;
  bonus: number;
  loan: number;
  tax: number;
  netSalary: number;
  absence: number;
  bankName?: string;
  accountName?: string;
  accountNo?: string;
  address?: string;
  nationalId?: string;
  fatherName?: string;
  motherName?: string;
  bloodGroup?: string;
  others?: string;
  photoUrl?: string;
  isActive: boolean;
}

export interface Attendance extends BaseEntity {
  date: string;
  totalEmployee: number;
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
  description?: string;
  employees: AttendanceRecord[];
}

export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  status: "present" | "absent" | "leave";
  overtime?: number;
  notes?: string;
}

export interface MonthlySalary extends BaseEntity {
  date: string;
  year: number;
  month: number;
  description?: string;
  paymentHead: string;
  totalEmployee: number;
  totalSalary: number;
  employeeSalaries: EmployeeSalaryRecord[];
}

export interface EmployeeSalaryRecord {
  employeeId: string;
  designation: string;
  empId: string;
  name: string;
  salary: number;
  bonusOT: number;
  absentFine: number;
  deduction: number;
  payment: number;
  note?: string;
  signature?: string;
}

// Settings Types
export interface Silo extends BaseEntity {
  name: string;
  capacity: number;
  description?: string;
}

export interface Godown extends BaseEntity {
  name: string;
  capacity: number;
  description?: string;
}

// Account Types
export interface IncomeHead extends BaseEntity {
  name: string;
  receives: number;
}

export interface ExpenseHead extends BaseEntity {
  name: string;
  payments: number;
}

export interface BankHead extends BaseEntity {
  name: string;
  receive: number;
  payment: number;
  balance: number;
}

export interface OthersHead extends BaseEntity {
  name: string;
  receive: number;
  payment: number;
  balance: number;
}

// Party Types
export interface PartyType extends BaseEntity {
  name: string;
  description?: string;
}

export interface Party extends BaseEntity {
  name: string;
  typeId: string;
  typeName: string;
  mobile?: string;
  email?: string;
  address?: string;
  balance: number;
}

// Transaction Types
export interface Transaction extends BaseEntity {
  date: string;
  party?: string;
  voucherType: "receive" | "payment" | "invoice";
  fromHead: string;
  toHead: string;
  description: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
  voucherNumber?: string;
  createdBy: string;
}

// Product Types
export interface Category extends BaseEntity {
  name: string;
  description?: string;
}

export interface Product extends BaseEntity {
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  description?: string;
}

// Common UI Types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: any) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  selection?: {
    selectedItems: string[];
    onSelectionChange: (items: string[]) => void;
  };
  actions?: {
    onEdit?: (item: T) => void;
    onDelete?: (items: string[]) => void;
    onView?: (item: T) => void;
    custom?: Array<{
      label: string;
      icon: React.ReactNode;
      onClick: (item: T) => void;
      variant?: "primary" | "secondary" | "danger";
    }>;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export interface FilterBarProps {
  onSearch: (query: string) => void;
  onDateRange?: (start: string, end: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  children?: React.ReactNode;
}
