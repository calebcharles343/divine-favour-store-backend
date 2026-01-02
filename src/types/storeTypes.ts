// types/index.ts
// Core type definitions for the Nigerian Store App

export interface User {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  data: {
    token: string;
    user: User;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  pricePerUnit: number;
  costPrice: number;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantitySold: number;
  totalAmount: number;
  paymentMethod: "Cash" | "Transfer" | "POS";
  soldBy: string;
  soldAt: string;
}

// Updated interfaces to match actual API responses

export interface SalesStats {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  transactionCount: number;
  lowStockProducts: Product[];
}

export interface ProfitLossReport {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

// types/storeTypes.ts

// User Types
export type UserRole =
  | "SUPER-ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "CUSTOMER";

// Product Types
export type ProductCategory =
  | "protein"
  | "vegetable"
  | "grain"
  | "spice"
  | "other";
export type MeasurementType = "scale" | "container";
export type ContainerSize = "small" | "medium" | "large";

// Sales Types
export type PaymentMethod = "cash" | "transfer" | "card" | "pos" | "credit";

// File Types
export type FileType = "image" | "pdf" | "spreadsheet" | "document" | "other";

// Query Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  search?: string;
  sort?: string;
  category?: ProductCategory;
  measurementType?: MeasurementType;
  lowStock?: boolean;
}

// Sales Statistics
export type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

// Inventory Report
export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: Array<{
    name: string;
    currentStock: number;
    minStockLevel: number;
  }>;
  outOfStockItems: Array<{
    name: string;
  }>;
}

// Profit & Loss Report
export interface ProfitLossReport {
  totalRevenue: number;
  totalCostOfGoods: number;
  grossProfit: number;
  totalTransactions: number;
  startDate: Date;
  endDate: Date;
}

// Sales Statistics
export interface SalesStatistics {
  period: PeriodType;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  transactionCount: number;
  lowStockProducts: Array<{
    name: string;
    currentStock: number;
    minStockLevel: number;
  }>;
}

///////////////////////////////////////////////
///////////////////////////////////////////////
