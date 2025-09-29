// Mock data for AMMAM Rice Mill Dashboard
export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  joiningDate?: string;
}

export interface MockEmployee {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: 'active' | 'inactive';
}

export interface MockDesignation {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface MockParty {
  id: number;
  name: string;
  type: string;
  phone: string;
  address: string;
  balance: number;
  status: 'active' | 'inactive';
}

export interface MockProduct {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
}

export interface MockTransaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  head: string;
  amount: number;
  description: string;
  party?: string;
}

export interface MockStock {
  id: number;
  product: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@ammam.com',
    role: 'Administrator',
    phone: '+88012345678',
    address: 'Dhaka, Bangladesh',
    joiningDate: '2023-01-01'
  }
];

// Mock Employees
export const mockEmployees: MockEmployee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@ammam.com',
    phone: '+88012345679',
    designation: 'Manager',
    salary: 50000,
    joiningDate: '2023-02-01',
    status: 'active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@ammam.com',
    phone: '+88012345680',
    designation: 'Accountant',
    salary: 35000,
    joiningDate: '2023-03-01',
    status: 'active'
  },
  {
    id: 3,
    name: 'Bob Wilson',
    email: 'bob@ammam.com',
    phone: '+88012345681',
    designation: 'Operator',
    salary: 25000,
    joiningDate: '2023-04-01',
    status: 'active'
  }
];

// Mock Designations
export const mockDesignations: MockDesignation[] = [
  { id: 1, name: 'Manager', description: 'Rice Mill Manager', status: 'active' },
  { id: 2, name: 'Accountant', description: 'Finance Manager', status: 'active' },
  { id: 3, name: 'Operator', description: 'Machine Operator', status: 'active' },
  { id: 4, name: 'Security Guard', description: 'Security Personnel', status: 'active' },
  { id: 5, name: 'Cleaner', description: 'Cleaning Staff', status: 'active' }
];

// Mock Parties
export const mockParties: MockParty[] = [
  {
    id: 1,
    name: 'ABC Traders',
    type: 'Supplier',
    phone: '+88012345682',
    address: 'Chittagong, Bangladesh',
    balance: 125000,
    status: 'active'
  },
  {
    id: 2,
    name: 'XYZ Corporation',
    type: 'Customer',
    phone: '+88012345683',
    address: 'Sylhet, Bangladesh',
    balance: -85000,
    status: 'active'
  },
  {
    id: 3,
    name: 'Rice Wholesale',
    type: 'Customer',
    phone: '+88012345684',
    address: 'Rajshahi, Bangladesh',
    balance: 45000,
    status: 'active'
  }
];

// Mock Products
export const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: 'Basmati Rice',
    category: 'Premium Rice',
    unit: 'kg',
    price: 120,
    stock: 5000
  },
  {
    id: 2,
    name: 'Jasmine Rice',
    category: 'Premium Rice',
    unit: 'kg',
    price: 100,
    stock: 3500
  },
  {
    id: 3,
    name: 'Regular Rice',
    category: 'Standard Rice',
    unit: 'kg',
    price: 55,
    stock: 12000
  },
  {
    id: 4,
    name: 'Broken Rice',
    category: 'By-product',
    unit: 'kg',
    price: 35,
    stock: 2500
  }
];

// Mock Transactions
export const mockTransactions: MockTransaction[] = [
  {
    id: 1,
    date: '2025-01-15',
    type: 'income',
    head: 'Rice Sales',
    amount: 150000,
    description: 'Basmati rice sale to ABC Traders',
    party: 'ABC Traders'
  },
  {
    id: 2,
    date: '2025-01-14',
    type: 'expense',
    head: 'Paddy Purchase',
    amount: 80000,
    description: 'Raw paddy purchase from farmers',
    party: 'Local Farmers'
  },
  {
    id: 3,
    date: '2025-01-13',
    type: 'expense',
    head: 'Electricity',
    amount: 25000,
    description: 'Monthly electricity bill payment'
  },
  {
    id: 4,
    date: '2025-01-12',
    type: 'income',
    head: 'Rice Sales',
    amount: 95000,
    description: 'Regular rice bulk sale',
    party: 'XYZ Corporation'
  }
];

// Mock Stocks
export const mockStocks: MockStock[] = [
  {
    id: 1,
    product: 'Basmati Rice',
    category: 'Premium Rice',
    quantity: 5000,
    unit: 'kg',
    location: 'Main Godown',
    lastUpdated: '2025-01-15'
  },
  {
    id: 2,
    product: 'Jasmine Rice',
    category: 'Premium Rice',
    quantity: 3500,
    unit: 'kg',
    location: 'Main Godown',
    lastUpdated: '2025-01-14'
  },
  {
    id: 3,
    product: 'Regular Rice',
    category: 'Standard Rice',
    quantity: 12000,
    unit: 'kg',
    location: 'Storage A',
    lastUpdated: '2025-01-15'
  },
  {
    id: 4,
    product: 'Raw Paddy',
    category: 'Raw Material',
    quantity: 8500,
    unit: 'kg',
    location: 'Silo 1',
    lastUpdated: '2025-01-13'
  }
];

// Mock Categories
export const mockCategories = [
  { id: 1, name: 'Premium Rice', description: 'High quality rice varieties', status: 'active' },
  { id: 2, name: 'Standard Rice', description: 'Regular quality rice', status: 'active' },
  { id: 3, name: 'By-product', description: 'Rice processing by-products', status: 'active' },
  { id: 4, name: 'Raw Material', description: 'Raw paddy and materials', status: 'active' }
];

// Mock Party Types
export const mockPartyTypes = [
  { id: 1, name: 'Supplier', description: 'Raw material suppliers', status: 'active' },
  { id: 2, name: 'Customer', description: 'Rice buyers', status: 'active' },
  { id: 3, name: 'Distributor', description: 'Distribution partners', status: 'active' },
  { id: 4, name: 'Contractor', description: 'Service contractors', status: 'active' }
];

// Mock Account Heads
export const mockIncomeHeads = [
  { id: 1, name: 'Rice Sales', description: 'Revenue from rice sales', status: 'active' },
  { id: 2, name: 'By-product Sales', description: 'Revenue from by-products', status: 'active' },
  { id: 3, name: 'Service Income', description: 'Revenue from services', status: 'active' }
];

export const mockExpenseHeads = [
  { id: 1, name: 'Paddy Purchase', description: 'Raw paddy procurement costs', status: 'active' },
  { id: 2, name: 'Electricity', description: 'Power consumption charges', status: 'active' },
  { id: 3, name: 'Labor Cost', description: 'Employee wages and benefits', status: 'active' },
  { id: 4, name: 'Maintenance', description: 'Equipment maintenance costs', status: 'active' }
];

export const mockBankHeads = [
  { id: 1, name: 'Current Account', description: 'Primary business account', status: 'active' },
  { id: 2, name: 'Savings Account', description: 'Reserve savings account', status: 'active' },
  { id: 3, name: 'Loan Account', description: 'Business loan account', status: 'active' }
];

// Mock Attendance
export const mockAttendance = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    date: '2025-01-15',
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'present',
    workingHours: '9.0'
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: 'Jane Smith',
    date: '2025-01-15',
    checkIn: '09:15',
    checkOut: '18:00',
    status: 'present',
    workingHours: '8.75'
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: 'Bob Wilson',
    date: '2025-01-15',
    checkIn: '',
    checkOut: '',
    status: 'absent',
    workingHours: '0'
  }
];

// Mock Purchases
export const mockPurchases = [
  {
    id: 1,
    date: '2025-01-15',
    supplier: 'Local Farmers',
    product: 'Raw Paddy',
    quantity: 2000,
    unit: 'kg',
    rate: 40,
    amount: 80000,
    status: 'completed'
  },
  {
    id: 2,
    date: '2025-01-14',
    supplier: 'ABC Agro',
    product: 'Premium Paddy',
    quantity: 1500,
    unit: 'kg',
    rate: 50,
    amount: 75000,
    status: 'pending'
  }
];

// Mock Sales
export const mockSales = [
  {
    id: 1,
    date: '2025-01-15',
    customer: 'ABC Traders',
    product: 'Basmati Rice',
    quantity: 1000,
    unit: 'kg',
    rate: 120,
    amount: 120000,
    status: 'completed'
  },
  {
    id: 2,
    date: '2025-01-14',
    customer: 'XYZ Corporation',
    product: 'Regular Rice',
    quantity: 2000,
    unit: 'kg',
    rate: 55,
    amount: 110000,
    status: 'delivered'
  }
];

// Mock Productions
export const mockProductions = [
  {
    id: 1,
    date: '2025-01-15',
    rawMaterial: 'Raw Paddy',
    inputQuantity: 1000,
    outputProduct: 'Basmati Rice',
    outputQuantity: 750,
    byProduct: 'Broken Rice',
    byProductQuantity: 150,
    status: 'completed'
  },
  {
    id: 2,
    date: '2025-01-14',
    rawMaterial: 'Premium Paddy',
    inputQuantity: 800,
    outputProduct: 'Jasmine Rice',
    outputQuantity: 600,
    byProduct: 'Rice Bran',
    byProductQuantity: 120,
    status: 'in-progress'
  }
];