import type { Invoice, Payment, Waiver } from '../types';
import { InvoiceStatus } from '../types';

interface InvoiceCalculations {
  paidAmount: number;
  waiverAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
}

export const getInvoiceCalculations = (
  invoice: Invoice,
  allPayments: Payment[],
  allWaivers: Waiver[]
): InvoiceCalculations => {
  const relevantPayments = allPayments.filter(p => p.invoiceId === invoice.id);
  const paidAmount = relevantPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const relevantWaivers = allWaivers.filter(w => w.invoiceId === invoice.id);
  const waiverAmount = relevantWaivers.reduce((sum, w) => sum + w.amount, 0);

  const dueAmount = invoice.totalAmount - paidAmount - waiverAmount;

  let status: InvoiceStatus;
  if (dueAmount <= 0) {
    status = InvoiceStatus.Paid;
  } else if (paidAmount > 0 || waiverAmount > 0) {
    status = InvoiceStatus.Partial;
  } else {
    status = InvoiceStatus.Unpaid;
  }

  return { status, paidAmount, waiverAmount, dueAmount: Math.max(0, dueAmount) };
};