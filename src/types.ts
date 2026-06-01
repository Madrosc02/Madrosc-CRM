// types.ts
export type CustomerTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Dead';
export type MonopolyStatus = 'Monopoly' | 'Non-Monopoly';

export interface CustomerTerritory {
  id?: string;
  customerId?: string;
  state: string;
  district: string;
  monopolyStatus: MonopolyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string; // Kept for backward compatibility, will be same as firmName
  firmName: string; // Business/Firm name
  personName: string; // Contact person name
  email?: string; // Email address
  contact: string;
  alternateContact?: string;
  avatar: string;
  tier: CustomerTier;
  monopolyStatus: MonopolyStatus; // Monopoly or Non-Monopoly (primary territory)
  state: string; // Primary state
  district: string; // Primary district
  town?: string; // Added for Call Mode
  territories?: CustomerTerritory[]; // All territories (loaded separately)
  salesThisMonth: number;
  avg6MoSales: number;
  totalSales?: number; // Added for Call Mode
  lastOrderDate?: string; // Added for Call Mode
  phone?: string; // Added for Call Mode
  segment?: string; // Added for Call Mode
  outstandingBalance: number;
  daysSinceLastOrder: number;
  lastUpdated: string; // ISO string
  flag?: 'Green' | 'Red'; // Added for Call Mode
  tags?: string[]; // Custom labels
}

export interface Product {
  id: string;
  brandName: string;
  composition: string;
  mrp: number;
  purchaseRate: number;
  packing: string;
  segment?: string;
  hsnCode?: string;
  gstPercentage?: number;
  manufacturer?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  brandName: string;
  composition: string;
  mrp: number;
  purchaseRate: number;
  packing: string;
  segment?: string;
  hsnCode?: string;
  gstPercentage?: number;
  manufacturer?: string;
  status: 'Active' | 'Inactive';
}

export interface Sale {
  id: string;
  customerId: string;
  amount: number;
  date: string; // ISO string
}

export interface Remark {
  id: string;
  customerId: string;
  remark: string;
  timestamp: string; // ISO string
  user: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
}

export interface Task {
  id: string;
  customerId: string;
  customerName?: string;
  task: string;
  dueDate: string; // ISO string
  completed: boolean;
}

export interface Goal {
  id: string;
  customerId: string;
  title: string;
  targetAmount: number;
  currentAmount: number; // This will be calculated from sales
  deadline: string; // ISO string
  status: 'InProgress' | 'Achieved' | 'Missed';
}

export interface Milestone {
  id: string;
  goalId: string;
  description: string;
  targetDate: string; // ISO string
  completed: boolean;
}


export interface CustomerFormData {
  firmName: string;
  personName: string;
  email?: string;
  contact: string;
  alternateContact?: string;
  state: string;
  district: string;
  tier: CustomerTier;
  monopolyStatus: MonopolyStatus;
  territories?: CustomerTerritory[]; // For multi-district support
  tags?: string[];
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UserSettings {
  id?: string;
  userId?: string;
  monthlyRevenueTarget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoricalSnapshot {
  id?: string;
  date: string; // ISO string
  totalCustomers: number;
  activeCustomers: number;
  pendingOrders: number;
  totalOutstanding: number;
  totalSales: number;
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  productName: string;
  pack: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNo: string;
  date: string; // ISO string
  totalAmount: number;
  pdfUrl?: string;
  items: InvoiceItem[];
  createdAt?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: string; // ISO string
  paymentMode: string;
  referenceNo?: string;
  createdAt?: string;
}
