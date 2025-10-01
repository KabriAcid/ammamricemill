export interface SaleItem {
  id: string;
  categoryId: string;
  productId: string;
  godownId: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  challanNo: string;
  partyId: string;
  transportInfo: string;
  notes: string;
  items: SaleItem[];
  totalQuantity: number;
  totalNetWeight: number;
  invoiceAmount: number;
  discount: number;
  totalAmount: number;
  previousBalance: number;
  netPayable: number;
  paidAmount: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}
