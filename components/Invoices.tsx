import React, { useState, useMemo } from 'react';
import type { Student, Invoice, Payment, Waiver, FeeStructureItem, FeeItem } from '../types';
import { InvoiceStatus } from '../types';
import Modal from './Modal';
import InvoiceTemplate from './InvoiceTemplate';
import { getInvoiceCalculations } from '../utils/billing';
import { convertToBS } from '../utils/dateConverter';


interface InvoicesProps {
  students: Student[];
  invoices: Invoice[];
  payments: Payment[];
  waivers: Waiver[];
  feeStructure: FeeStructureItem[];
  onGenerateInvoices: () => Promise<void>;
  onAddPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  onAddWaiver: (waiver: Omit<Waiver, 'id'>) => Promise<void>;
}

const PaymentForm: React.FC<{ invoice: Invoice; onSave: (payment: Omit<Payment, 'id'>) => void; onCancel: () => void }> = ({ invoice, onSave, onCancel }) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ invoiceId: invoice.id, amount: parseFloat(amount), paymentDate });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Payment Amount (रु)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Record Payment</button>
            </div>
        </form>
    );
};

const WaiverForm: React.FC<{ invoice: Invoice; onSave: (waiver: Omit<Waiver, 'id'>) => void; onCancel: () => void }> = ({ invoice, onSave, onCancel }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ invoiceId: invoice.id, amount: parseFloat(amount), reason });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Waiver Amount (रु)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Waiver</label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Grant Waiver</button>
            </div>
        </form>
    );
};

const Invoices: React.FC<InvoicesProps> = ({ students, invoices, payments, waivers, feeStructure, onGenerateInvoices, onAddPayment, onAddWaiver }) => {
    const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
    const [waiverModalInvoice, setWaiverModalInvoice] = useState<Invoice | null>(null);
    const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
    const [activeTab, setActiveTab] = useState('invoices');
    const [selectedReminders, setSelectedReminders] = useState<Set<string>>(new Set());


    const invoicesWithDetails = useMemo(() => {
        return invoices.map(invoice => {
            const student = students.find(s => s.id === invoice.studentId);
            const { status, paidAmount, waiverAmount, dueAmount } = getInvoiceCalculations(invoice, payments, waivers);
            return { ...invoice, studentName: student?.name || 'N/A', studentEmail: student?.guardianEmail, status, paidAmount, waiverAmount, dueAmount };
        }).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }, [invoices, students, payments, waivers]);
    
    const handleRecordPayment = async (paymentData: Omit<Payment, 'id'>) => {
        await onAddPayment(paymentData);
        setPaymentModalInvoice(null);
    };

    const handleGrantWaiver = async (waiverData: Omit<Waiver, 'id'>) => {
        await onAddWaiver(waiverData);
        setWaiverModalInvoice(null);
    };
    
    const handlePrint = (invoice: Invoice) => {
        setPrintInvoice(invoice);
        setTimeout(() => {
            window.print();
            setPrintInvoice(null);
        }, 100);
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (status) {
            case InvoiceStatus.Paid: return `${baseClasses} bg-green-100 text-green-800`;
            case InvoiceStatus.Partial: return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case InvoiceStatus.Unpaid: return `${baseClasses} bg-red-100 text-red-800`;
        }
    };
    
    const toggleReminderSelection = (invoiceId: string) => {
        const newSelection = new Set(selectedReminders);
        if (newSelection.has(invoiceId)) {
            newSelection.delete(invoiceId);
        } else {
            newSelection.add(invoiceId);
        }
        setSelectedReminders(newSelection);
    };
    
    const handleSendReminders = () => {
        if(selectedReminders.size === 0) {
            alert("Please select at least one invoice to send a reminder.");
            return;
        }
        // In a real app, this would be an API call
        alert(`Simulating sending ${selectedReminders.size} email reminders. This requires a backend mailing service.`);
        setSelectedReminders(new Set());
    };

    const TabButton: React.FC<{tabId: string; children: React.ReactNode}> = ({tabId, children}) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabId ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            {children}
        </button>
    );

    const pendingInvoices = invoicesWithDetails.filter(inv => inv.dueAmount > 0);
    
    return (
        <>
        <div className="bg-white p-6 rounded-xl shadow-md print:hidden">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div className="flex items-center space-x-2">
                   <TabButton tabId="invoices">Invoices</TabButton>
                   <TabButton tabId="reminders">Fee Reminders ({pendingInvoices.length})</TabButton>
                </div>
                <button onClick={onGenerateInvoices} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Generate Monthly Invoices</button>
            </div>

            {activeTab === 'invoices' && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inv. ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiver</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoicesWithDetails.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{invoice.studentName}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{invoice.month} {invoice.year}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">रु {invoice.totalAmount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-4 text-sm text-blue-600">रु {invoice.waiverAmount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-4 text-sm font-semibold text-red-600">रु {invoice.dueAmount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-4 text-sm"><span className={getStatusBadge(invoice.status)}>{invoice.status}</span></td>
                                    <td className="px-4 py-4 text-sm space-x-2">
                                        <button onClick={() => handlePrint(invoice)} className="text-gray-500 hover:text-blue-700" title="Print"><PrintIcon/></button>
                                        {invoice.status !== InvoiceStatus.Paid && (
                                            <>
                                            <button onClick={() => setPaymentModalInvoice(invoice)} className="text-gray-500 hover:text-green-700" title="Pay"><PayIcon/></button>
                                            <button onClick={() => setWaiverModalInvoice(invoice)} className="text-gray-500 hover:text-yellow-700" title="Grant Waiver"><WaiverIcon/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'reminders' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={handleSendReminders} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" disabled={selectedReminders.size === 0}>
                            Send {selectedReminders.size} Reminders
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4"><input type="checkbox" onChange={(e) => setSelectedReminders(e.target.checked ? new Set(pendingInvoices.map(i => i.id)) : new Set())}/></th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guardian Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Due</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="p-4"><input type="checkbox" checked={selectedReminders.has(invoice.id)} onChange={() => toggleReminderSelection(invoice.id)} /></td>
                                    <td className="px-4 py-4 text-sm">{invoice.studentName}</td>
                                    <td className="px-4 py-4 text-sm">{invoice.studentEmail}</td>
                                    <td className="px-4 py-4 text-sm font-bold text-red-600">रु {invoice.dueAmount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-4 text-sm">{convertToBS(invoice.dueDate)}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {paymentModalInvoice && (
                <Modal title={`Record Payment for ${paymentModalInvoice.id}`} onClose={() => setPaymentModalInvoice(null)}>
                    <PaymentForm invoice={paymentModalInvoice} onSave={handleRecordPayment} onCancel={() => setPaymentModalInvoice(null)} />
                </Modal>
            )}
             {waiverModalInvoice && (
                <Modal title={`Grant Waiver for ${waiverModalInvoice.id}`} onClose={() => setWaiverModalInvoice(null)}>
                    <WaiverForm invoice={waiverModalInvoice} onSave={handleGrantWaiver} onCancel={() => setWaiverModalInvoice(null)} />
                </Modal>
            )}
        </div>
        {printInvoice && students.find(s => s.id === printInvoice.studentId) &&
            <div className="hidden print:block">
                <InvoiceTemplate invoice={printInvoice} student={students.find(s => s.id === printInvoice.studentId)!} payments={payments.filter(p => p.invoiceId === printInvoice.id)} waivers={waivers.filter(w => w.invoiceId === printInvoice.id)}/>
            </div>
        }
        </>
    );
};
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-14a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const PayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const WaiverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export default Invoices;