export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  category: 'planner' | 'spreadsheet' | 'template' | 'bundle' | 'other';
  image: string;
  gallery?: string[];
  features: string[];
  includes: string[];
  format: string;
  fileSize?: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  status: 'active' | 'inactive';
  created: string;
  updated: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'customer';
  created: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  invoiceUrl?: string;
  created: string;
  paidAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  created: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: Order[];
  salesByMonth: { month: string; amount: number }[];
  topProducts: { product: Product; sales: number }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}
