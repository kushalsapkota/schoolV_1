import React, { useState, useEffect } from 'react';
import type { FeeStructureItem } from '../types';
import Modal from './Modal';

interface SettingsProps {
  feeStructure: FeeStructureItem[];
  onAddFee: (fee: Omit<FeeStructureItem, 'id'>) => Promise<void>;
  onUpdateFee: (fee: FeeStructureItem) => Promise<void>;
  onDeleteFee: (id: string) => Promise<void>;
}

const FeeForm: React.FC<{ onSave: (fee: Omit<FeeStructureItem, 'id' | 'amount'> & { amount: number }) => void; onCancel: () => void; initialData?: FeeStructureItem }> = ({ onSave, onCancel, initialData }) => {
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ description, amount: parseFloat(amount) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Fee Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Amount (रु)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Fee</button>
            </div>
        </form>
    );
};

const Settings: React.FC<SettingsProps> = ({ feeStructure, onAddFee, onUpdateFee, onDeleteFee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructureItem | undefined>(undefined);

  const handleSaveFee = async (feeData: Omit<FeeStructureItem, 'id' | 'amount'> & { amount: number }) => {
    if (editingFee) {
        await onUpdateFee({ ...editingFee, ...feeData });
    } else {
        await onAddFee(feeData);
    }
    closeModal();
  };
  
  const handleDeleteFee = async (feeId: string) => {
    if(window.confirm("Are you sure you want to delete this fee item? This cannot be undone.")) {
        await onDeleteFee(feeId);
    }
  };
  
  const openAddModal = () => {
    setEditingFee(undefined);
    setIsModalOpen(true);
  };
  
  const openEditModal = (fee: FeeStructureItem) => {
    setEditingFee(fee);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFee(undefined);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Fee Structure Management</h3>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Fee Item</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feeStructure.map((fee) => (
              <tr key={fee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">रु {fee.amount.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <button onClick={() => openEditModal(fee)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDeleteFee(fee.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal title={editingFee ? "Edit Fee Item" : "Add New Fee Item"} onClose={closeModal}>
          <FeeForm onSave={handleSaveFee} onCancel={closeModal} initialData={editingFee} />
        </Modal>
      )}
    </div>
  );
};

export default Settings;