import { BaseEntity } from "./index";

// Common interfaces
export interface Category extends BaseEntity {
  name: string;
  unit: string;
  description?: string;
}

export interface Product extends BaseEntity {
  categoryId: string;
  name: string;
  unit: string;
  type: string;
  size: string;
  weight: number;
  buyPrice: number;
  salePrice: number;
}

export interface Party extends BaseEntity {
  typeId: string;
  name: string;
  companyName?: string;
  bankAccountNo?: string;
  mobile: string;
  address?: string;
  balance: number;
}

export interface Godown extends BaseEntity {
  name: string;
  capacity: number;
  description?: string;
}

// Purchase specific interfaces
export interface PurchaseItem {
  id: string;
  categoryId: string;
  category?: string; // For display
  productId: string;
  product?: string; // For display
  godownId: string;
  godown?: string; // For display
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface Purchase extends BaseEntity {
  invoiceNo: string;
  date: string;
  challanNo?: string;
  partyId: string;
  partyName?: string; // For display
  transportInfo?: string;
  notes?: string;
  items: PurchaseItem[];
  totalQuantity: number;
  totalNetWeight: number;
  invoiceAmount: number;
  discount: number;
  totalAmount: number;
  previousBalance: number;
  netPayable: number;
  paidAmount: number;
  currentBalance: number;
}

export interface PaddyPurchaseLedgerEntry extends BaseEntity {
  date: string;
  invoiceNo: string;
  partyId: string;
  partyName?: string;
  productId: string;
  productName?: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

// Stock related interfaces
export interface Stock extends BaseEntity {
  godownId: string;
  productId: string;
  quantity: number;
  netWeight: number;
  avgPrice: number;
  totalPrice: number;
}

export interface StockMovement extends BaseEntity {
  type: "IN" | "OUT";
  date: string;
  referenceId: string;
  referenceType: "PURCHASE" | "PRODUCTION" | "SALES";
  godownId: string;
  productId: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface ProductionItem extends BaseEntity {
  purchaseId: string;
  productId: string;
  godownId: string;
  siloId: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface Production extends BaseEntity {
  invoiceNo: string;
  date: string;
  description?: string;
  items: ProductionItem[];
  totalQuantity: number;
  totalWeight: number;
}

// Form data interfaces for controlled components
export interface PurchaseFormData
  extends Omit<Purchase, "id" | "createdAt" | "updatedAt"> {}

export interface ProductFormData
  extends Omit<Product, "id" | "createdAt" | "updatedAt"> {}

export interface CategoryFormData
  extends Omit<Category, "id" | "createdAt" | "updatedAt"> {}

export interface PartyFormData
  extends Omit<Party, "id" | "createdAt" | "updatedAt"> {}
