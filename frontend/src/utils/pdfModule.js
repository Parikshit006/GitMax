import client from '../api/axiosClient';

/**
 * Calls the backend to generate a structured, text-based PDF report.
 * 
 * @param {object} analysisData - The complete AnalysisResponse JSON object.
 * @param {string} filename - The name of the downloaded file.
 */
export const exportToPdf = async (analysisData, filename = 'GitMax-Strategic-Report.pdf') => {
  if (!analysisData) {
    console.error(`[PDF_EXPORT] No analysis data provided.`);
    return;
  }

  try {
    const response = await client.post('/api/report/pdf', analysisData, {
      responseType: 'blob', // Important for handling binary data (the PDF)
    });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a hidden anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error('[PDF_EXPORT] Error generating PDF from backend', err);
    // Could add an error toast here if needed
  }
};

