export enum InvoiceStatus {
  Paid = 'Paid',
  Partial = 'Partial',
  Unpaid = 'Unpaid',
}

export interface Student {
  id: string;
  name: string;
  class: string;
  roll: number;
  guardianContact: string;
  guardianEmail: string;
  address: string;
  isActive: boolean;
}

export interface FeeItem {
    description: string;
    amount: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  month: string;
  year: number;
  issueDate: string;
  dueDate: string;
  items: FeeItem[];
  totalAmount: number;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
}

export interface Waiver {
  id: string;
  invoiceId: string;
  amount: number;
  reason: string;
}

export interface FeeStructureItem {
  id: string;
  description: string;
  amount: number;
}

export type Role = 'Admin' | 'Accountant';

export type View = 'dashboard' | 'students' | 'invoices' | 'reports' | 'settings';
