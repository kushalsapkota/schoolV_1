import React from 'react';
import type { Invoice, Student, Payment, Waiver } from '../types';
import { convertToBS } from '../utils/dateConverter';

interface InvoiceTemplateProps {
    invoice: Invoice;
    student: Student;
    payments: Payment[];
    waivers: Waiver[];
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, student, payments, waivers }) => {
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const waiverAmount = waivers.reduce((sum, w) => sum + w.amount, 0);
    const dueAmount = invoice.totalAmount - paidAmount - waiverAmount;

    return (
        <div className="p-8 bg-white text-gray-900 font-sans">
            <header className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                    <p className="text-sm text-gray-500">Invoice #{invoice.id}</p>
                </div>
                <div className="text-right">
                    {/* Placeholder for logo */}
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center mb-2">
                        <span className="text-xs text-gray-500">School Logo</span>
                    </div>
                    <h2 className="text-lg font-semibold">Montessori School</h2>
                    <p className="text-xs text-gray-600">Kathmandu, Nepal</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-8 mt-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                    <p className="font-bold">{student.name}</p>
                    <p className="text-sm">{student.address}</p>
                    <p className="text-sm">Contact: {student.guardianContact}</p>
                    <p className="text-sm">Class: {student.class} (Roll: {student.roll})</p>
                </div>
                <div className="text-right">
                    <p className="text-sm"><span className="font-semibold text-gray-600">Issue Date:</span> {convertToBS(invoice.issueDate)}</p>
                    <p className="text-sm"><span className="font-semibold text-gray-600">Due Date:</span> {convertToBS(invoice.dueDate)}</p>
                    <p className="text-sm"><span className="font-semibold text-gray-600">For Month:</span> {invoice.month}, {invoice.year}</p>
                </div>
            </section>

            <section className="mt-8">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                            <th className="p-2 text-left font-semibold text-gray-600">Description</th>
                            <th className="p-2 text-right font-semibold text-gray-600">Amount (रु)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="p-2">{item.description}</td>
                                <td className="p-2 text-right">{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Subtotal:</span>
                        <span>रु {invoice.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between text-blue-600">
                        <span className="font-semibold">Discount/Waiver:</span>
                        <span>- रु {waiverAmount.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between text-green-600">
                        <span className="font-semibold">Paid Amount:</span>
                        <span>- रु {paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t-2 border-gray-300">
                        <span>Amount Due:</span>
                        <span>रु {dueAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </section>
            
            {payments.length > 0 && 
            <section className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment History</h3>
                <div className="text-sm border border-gray-200 rounded-lg p-2">
                    {payments.map(p => (
                         <p key={p.id}>Paid रु {p.amount.toLocaleString('en-IN')} on {convertToBS(p.paymentDate)}</p>
                    ))}
                </div>
            </section>}

            <footer className="mt-16 pt-8 border-t-2 border-dashed border-gray-300 flex justify-between text-xs text-gray-500">
                <div>
                    <p>Thank you for your prompt payment.</p>
                    <p>Please note: This is a computer-generated invoice.</p>
                </div>
                <div className="text-center">
                    <div className="w-32 h-12 border-b border-gray-400"></div>
                    <p className="mt-1">Signature</p>
                </div>
            </footer>
        </div>
    );
};

export default InvoiceTemplate;