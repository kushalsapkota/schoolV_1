import React, { useState, useRef } from 'react';
import type { Student } from '../types';
import Modal from './Modal';

interface StudentsProps {
  students: Student[];
  onAddStudent: (studentData: Omit<Student, 'id' | 'isActive'>) => Promise<void>;
  onUpdateStatus: (studentId: string, newStatus: boolean) => Promise<void>;
}

const StudentForm: React.FC<{ onSave: (student: Omit<Student, 'id' | 'isActive'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [sClass, setSClass] = useState('');
    const [roll, setRoll] = useState('');
    const [guardianContact, setGuardianContact] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, class: sClass, roll: parseInt(roll, 10), guardianContact, guardianEmail, address });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <input type="text" value={sClass} onChange={(e) => setSClass(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Roll No.</label>
                    <input type="number" value={roll} onChange={(e) => setRoll(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Guardian Contact</label>
                    <input type="tel" value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Guardian Email</label>
                    <input type="email" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Student</button>
            </div>
        </form>
    );
};

const Students: React.FC<StudentsProps> = ({ students, onAddStudent, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'isActive'>) => {
    await onAddStudent(studentData);
    setIsModalOpen(false);
  };
  
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Class', 'Roll', 'Guardian Contact', 'Guardian Email', 'Address', 'Status'];
    const rows = students.map(s => 
        [s.id, s.name, s.class, s.roll, s.guardianContact, s.guardianEmail, `"${s.address}"`, s.isActive ? 'Active' : 'Inactive'].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    // This functionality will require a backend endpoint to handle file uploads securely.
    alert("CSV import requires a backend implementation for file handling.");
    // fileInputRef.current?.click();
  };
  
  const handleToggleStatus = async (student: Student) => {
    if (window.confirm(`Are you sure you want to ${student.isActive ? 'deactivate' : 'activate'} ${student.name}?`)) {
      await onUpdateStatus(student.id, !student.isActive);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Student Management</h3>
        <div className="flex items-center space-x-2">
           <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Export CSV</button>
           <button onClick={handleImportClick} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">Import CSV</button>
           <input type="file" ref={fileInputRef} className="hidden" accept=".csv" />
           <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Student</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className={`hover:bg-gray-50 ${!student.isActive ? 'bg-gray-100 opacity-60' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.guardianEmail}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => handleToggleStatus(student)} className={`px-3 py-1 text-xs font-medium rounded-md text-white ${student.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {student.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal title="Add New Student" onClose={() => setIsModalOpen(false)}>
          <StudentForm onSave={handleSaveStudent} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Students;