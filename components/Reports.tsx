
import React, { useMemo, useState } from 'react';
import type { Student, Invoice, Payment, Waiver } from '../types';
import { generateReportSummary } from '../services/geminiService';
import { getInvoiceCalculations } from '../utils/billing';

interface ReportsProps {
  students: Student[];
  invoices: Invoice[];
  payments: Payment[];
  waivers: Waiver[];
}

const Reports: React.FC<ReportsProps> = ({ students, invoices, payments, waivers }) => {
    const [aiSummary, setAiSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const reportData = useMemo(() => {
        return students.map(student => {
            const studentInvoices = invoices.filter(i => i.studentId === student.id);
            const totalBilled = studentInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
            
            let totalPaid = 0;
            let totalDue = 0;
            
            studentInvoices.forEach(inv => {
                const { paidAmount, dueAmount } = getInvoiceCalculations(inv, payments, waivers);
                totalPaid += paidAmount;
                totalDue += dueAmount;
            });

            return {
                studentId: student.id,
                studentName: student.name,
                totalBilled,
                totalPaid,
                totalDue,
            };
        });
    }, [students, invoices, payments, waivers]);
    
    const summaryStats = useMemo(() => {
        const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalDue = invoices.reduce((sum, inv) => sum + getInvoiceCalculations(inv, payments, waivers).dueAmount, 0);
        const pendingInvoices = invoices.filter(inv => getInvoiceCalculations(inv, payments, waivers).status !== 'Paid').length;

        return { totalStudents: students.length, totalCollected, totalDue, pendingInvoices };
    }, [students, invoices, payments, waivers]);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setAiSummary('');
        try {
            const summary = await generateReportSummary(summaryStats);
            setAiSummary(summary);
        } catch (error) {
            setAiSummary("Failed to generate summary.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">AI Financial Summary</h3>
                    <button 
                        onClick={handleGenerateSummary} 
                        disabled={isLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center"
                    >
                         {isLoading && <Spinner />}
                         {isLoading ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                </div>
                {aiSummary && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{aiSummary}</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Student-wise Dues Report</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Billed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((row) => (
                                <tr key={row.studentId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.studentId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{row.studentName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">रु {row.totalBilled.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-sm text-green-600">रु {row.totalPaid.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">रु {row.totalDue.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default Reports;
