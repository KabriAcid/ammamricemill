export interface ProductionItem {
  id: string;
  categoryId: string;
  productId: string;
  godownId: string;
  siloId: string;
  quantity: number;
  netWeight: number;
}

export interface Production {
  id: string;
  invoiceNo: string;
  date: string;
  description?: string;
  siloInfo?: string;
  items: ProductionItem[];
  totalQuantity: number;
  totalWeight: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}
