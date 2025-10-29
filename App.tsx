import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Invoices from './components/Invoices';
import Reports from './components/Reports';
import Settings from './components/Settings';
import * as api from './services/apiService';
import type { Student, Invoice, Payment, Role, View, Waiver, FeeStructureItem } from './types';

const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<View>('dashboard');

  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [feeStructure, setFeeStructure] = useState<FeeStructureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getAllData();
      setStudents(data.students || []);
      setInvoices(data.invoices || []);
      setPayments(data.payments || []);
      setWaivers(data.waivers || []);
      setFeeStructure(data.feeStructure || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server. Please ensure the API is running and configured correctly.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role) { // Only fetch data after a role is selected
      fetchData();
    }
  }, [role, fetchData]);
  
  const handleApiCall = async (call: () => Promise<any>, successMessage?: string) => {
    try {
        await call();
        if (successMessage) alert(successMessage);
        await fetchData(); // Refresh all data from the source of truth
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        console.error(err);
    }
  };
  
  const renderView = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Loading Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-700">Connection Error</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button onClick={fetchData} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard students={students} invoices={invoices} payments={payments} waivers={waivers} />;
      case 'students':
        return <Students 
            students={students} 
            onAddStudent={(student) => handleApiCall(() => api.addStudent(student), 'Student added successfully!')}
            onUpdateStatus={(id, status) => handleApiCall(() => api.updateStudentStatus(id, status), 'Student status updated!')}
        />;
      case 'invoices':
        return <Invoices 
            students={students} 
            invoices={invoices} 
            payments={payments}
            waivers={waivers}
            feeStructure={feeStructure}
            onGenerateInvoices={() => handleApiCall(api.generateMonthlyInvoices, 'Monthly invoices generated!')}
            onAddPayment={(payment) => handleApiCall(() => api.addPayment(payment), 'Payment recorded!')}
            onAddWaiver={(waiver) => handleApiCall(() => api.addWaiver(waiver), 'Waiver granted!')}
        />;
      case 'reports':
        return <Reports students={students} invoices={invoices} payments={payments} waivers={waivers}/>;
      case 'settings':
         if (role === 'Admin') {
            return <Settings 
                feeStructure={feeStructure} 
                onAddFee={(fee) => handleApiCall(() => api.addFeeItem(fee), 'Fee item added!')}
                onUpdateFee={(fee) => handleApiCall(() => api.updateFeeItem(fee), 'Fee item updated!')}
                onDeleteFee={(id) => handleApiCall(() => api.deleteFeeItem(id), 'Fee item deleted!')}
            />;
         }
         // Fallback for non-admins trying to access settings
         return <Dashboard students={students} invoices={invoices} payments={payments} waivers={waivers} />;
      default:
        return <Dashboard students={students} invoices={invoices} payments={payments} waivers={waivers} />;
    }
  };
  
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Montessori Billing System</h1>
          <p className="text-gray-600 mb-6">Please select your role to continue.</p>
          <div className="space-y-4">
            <button
              onClick={() => setRole('Admin')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Log in as Admin
            </button>
            <button
              onClick={() => setRole('Accountant')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 transform hover:scale-105"
            >
              Log in as Accountant
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar view={view} setView={setView} role={role} setRole={setRole} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 z-10">
          <h1 className="text-2xl font-semibold text-gray-800 capitalize">{view === 'invoices' ? 'Billing & Invoices' : view}</h1>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;