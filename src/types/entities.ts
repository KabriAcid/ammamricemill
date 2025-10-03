// Party module types
export interface PartyType {
  id: number;
  name: string;
  description: string;
}
// Centralized entity types for Accounts module and others

export interface HeadIncome {
  id: number;
  name: string;
  receives: number;
}

export interface HeadExpense {
  id: number;
  name: string;
  payments: number;
}

export interface HeadBank {
  id: number;
  name: string;
  receive: number;
  payment: number;
  balance: number;
}

export interface HeadOthers {
  id: number;
  name: string;
  receive: number;
  payment: number;
  balance: number;
}

export interface Transaction {
  id: number;
  date: string;
  party: string;
  voucherType: string;
  fromHead: string;
  toHead: string;
  description: string;
  amount: number;
  status: string;
}

export interface Godown {
  id: string;
  name: string;
  capacity: number;
  currentStock: number;
  unit: string;
  location: string;
  manager: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Add more as needed for other modules
