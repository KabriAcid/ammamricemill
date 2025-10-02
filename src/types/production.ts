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
  description: string;
  items: ProductionItem[];
  totalQuantity: number;
  totalWeight: number;
  siloInfo: string;
  createdAt: string;
  updatedAt: string;
}
