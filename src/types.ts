// types.ts
export type CustomerTier = 'Gold' | 'Silver' | 'Bronze' | 'Dead';
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
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

