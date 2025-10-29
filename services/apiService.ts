// ===================================================================================
//
//  CRITICAL: FIX THE "Failed to fetch" ERROR HERE
//
//  You must replace the placeholder URL below with the actual, live URL 
//  of the `api.php` file on your hosting server.
//
//  EXAMPLE:
//  If your website is `https://www.myschool.edu` and you uploaded `api.php` to a
//  folder named `billing`, your URL would be:
//  
//  const API_BASE_URL = 'https://www.myschool.edu/billing/api.php';
//
// ===================================================================================
const API_BASE_URL = 'http://your-domain.com/path/to/api.php';


const get = async (action: string) => {
    if (API_BASE_URL.includes('your-domain.com')) {
        throw new Error('API URL is not configured. Please edit services/apiService.ts');
    }
    const response = await fetch(`${API_BASE_URL}?action=${action}`);
    if (!response.ok) {
        throw new Error(`Network response was not ok for action: ${action}`);
    }
    return response.json();
}

const post = async (action: string, data: any) => {
    if (API_BASE_URL.includes('your-domain.com')) {
        throw new Error('API URL is not configured. Please edit services/apiService.ts');
    }
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