
// ===================================================================================
//
//  API URL Configuration
//  This is now pointing to your live server.
//
// ===================================================================================
const API_BASE_URL = 'https://school.sapkotakushal.com.np/api.php';


const get = async (action: string) => {
    const response = await fetch(`${API_BASE_URL}?action=${action}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok for action: ${action}. Server response: ${errorText}`);
    }
    return response.json();
}

const post = async (action: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}?action=${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
     if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to perform action: ${action}. Server responded with: ${errorText}`);
    }
    return response.json();
}


export const getAllData = () => get('getAllData');
export const addStudent = (studentData: any) => post('addStudent', studentData);
export const updateStudentStatus = (studentId: string, isActive: boolean) => post('updateStudentStatus', { studentId, isActive });
export const generateMonthlyInvoices = () => get('generateInvoices');
export const addPayment = (paymentData: any) => post('addPayment', paymentData);
export const addWaiver = (waiverData: any) => post('addWaiver', waiverData);
export const addFeeItem = (feeData: any) => post('addFeeItem', feeData);
export const updateFeeItem = (feeData: any) => post('updateFeeItem', feeData);
export const deleteFeeItem = (feeId: string) => post('deleteFeeItem', { id: feeId });

// Note: CSV import requires more complex backend logic (file handling)
// This function is a placeholder for how you might send the parsed data
export const importStudents = (students: any[]) => post('importStudents', students);
