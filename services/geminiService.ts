
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface ReportData {
  totalStudents: number;
  totalCollected: number;
  totalDue: number;
  pendingInvoices: number;
}

export const generateReportSummary = async (data: ReportData): Promise<string> => {
  if (!API_KEY) {
    return "AI service is unavailable. Please configure the API Key.";
  }
  
  try {
    const prompt = `
      You are an expert school administrator analyzing a monthly billing report for a Montessori school.
      Given the following data, provide a concise, insightful summary in a few bullet points.
      Focus on the financial health and key action items for the administration.
      The currency is Nepali Rupees (रु).

      Data:
      - Total Students: ${data.totalStudents}
      - Total Amount Collected this month: रु ${data.totalCollected.toLocaleString('en-IN')}
      - Total Amount Due this month: रु ${data.totalDue.toLocaleString('en-IN')}
      - Number of Invoices with Pending Dues: ${data.pendingInvoices}

      Generate the summary.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating report summary:", error);
    return "An error occurred while generating the AI summary. Please check the console for details.";
  }
};
