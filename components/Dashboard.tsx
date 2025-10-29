import React, { useMemo } from 'react';
import type { Student, Invoice, Payment, Waiver } from '../types';
import { InvoiceStatus } from '../types';
import { getInvoiceCalculations } from '../utils/billing';
import { convertToBS } from '../utils/dateConverter';

interface DashboardProps {
  students: Student[];
  invoices: Invoice[];
  payments: Payment[];
  waivers: Waiver[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ students, invoices, payments, waivers }) => {
    
  const stats = useMemo(() => {
    const totalStudents = students.filter(s => s.isActive).length;
    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalDue = invoices.reduce((sum, inv) => {
        const student = students.find(s => s.id === inv.studentId);
        if(!student || !student.isActive) return sum;
        const { dueAmount } = getInvoiceCalculations(inv, payments, waivers);
        return sum + dueAmount;
    }, 0);

    return { totalStudents, totalCollected, totalDue };
  }, [students, invoices, payments, waivers]);


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Active Students" 
          value={stats.totalStudents.toString()} 
          icon={<UsersIcon />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Total Collected" 
          value={`रु ${stats.totalCollected.toLocaleString('en-IN')}`} 
          icon={<CashIcon />}
          color="bg-green-100 text-green-600"
        />
        <StatCard 
          title="Outstanding Dues" 
          value={`रु ${stats.totalDue.toLocaleString('en-IN')}`} 
          icon={<WarningIcon />}
          color="bg-red-100 text-red-600"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Recent Payments</h4>
            {payments.slice(-3).reverse().map(p => {
                const invoice = invoices.find(i => i.id === p.invoiceId);
                const student = students.find(s => s.id === invoice?.studentId);
                return (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <p>Payment of <span className="font-bold text-green-600">रु {p.amount.toLocaleString('en-IN')}</span> received from {student?.name || 'N/A'} for invoice {p.invoiceId}.</p>
                        <span className="text-sm text-gray-500">{convertToBS(p.paymentDate)}</span>
                    </div>
                );
            })}
             <h4 className="font-semibold text-gray-700 mt-6">Unpaid Invoices</h4>
             {invoices.filter(i => getInvoiceCalculations(i, payments, waivers).status !== InvoiceStatus.Paid).slice(-3).reverse().map(i => {
                const student = students.find(s => s.id === i.studentId);
                const { status } = getInvoiceCalculations(i, payments, waivers);
                return (
                    <div key={i.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <p>Invoice <span className="font-bold">{i.id}</span> for {student?.name || 'N/A'} is <span className="font-semibold text-red-600">{status}</span>.</p>
                        <span className="text-sm text-gray-500">Due: {convertToBS(i.dueDate)}</span>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};


const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default Dashboard;