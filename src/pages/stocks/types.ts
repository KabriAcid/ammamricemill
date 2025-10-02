export interface Stock {
  id: string;
  category: string;
  product: string;
  opening: number;
  add: number;
  purchase: number;
  sales: number;
  production: number;
  productionStocks: number;
  stock: number;
  avgPrice: number;
  totalPrice: number;
}

export interface OpeningStock {
  id: string;
  date: string;
  godown: string;
  category: string;
  product: string;
  size: string;
  weight: number;
  quantity: number;
  netWeight: number;
  rate: number;
  price: number;
}

export interface AddStock {
  id: string;
  date: string;
  product: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
  godown: string;
  notes?: string;
}

export interface StockFormData {
  date: string;
  product: string;
  godown: string;
  quantity: number;
  netWeight: number;
  rate: number;
  price: number;
  notes?: string;
}

export interface OpeningStockItem {
  id: string;
  date: string;
  category: string;
  product: string;
  size: string;
  weight: number;
  quantity: number;
  netWeight: number;
  rate: number;
  price: number;
}
