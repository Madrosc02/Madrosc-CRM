// types.ts
export type CustomerTier = 'Gold' | 'Silver' | 'Bronze' | 'Dead';
export type MonopolyStatus = 'Monopoly' | 'Non-Monopoly';

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
  monopolyStatus: MonopolyStatus; // Monopoly or Non-Monopoly
  state: string;
  district: string;
  salesThisMonth: number;
  avg6MoSales: number;
  outstandingBalance: number;
  daysSinceLastOrder: number;
  lastUpdated: string; // ISO string
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
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
