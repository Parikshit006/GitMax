import { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [result, setResult] = useState(null);
  const [currentPR, setCurrentPR] = useState(null);

  const startAnalysis = (prInfo) => {
    setCurrentPR(prInfo);
    setResult(null);
  };

  const setAnalysisResult = (data) => setResult(data);
  const clearAnalysis = () => { setResult(null); setCurrentPR(null); };

  return (
    <AnalysisContext.Provider value={{
      result, currentPR,
      startAnalysis, setAnalysisResult, clearAnalysis
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => useContext(AnalysisContext);
