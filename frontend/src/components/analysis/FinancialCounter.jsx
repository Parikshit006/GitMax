import { useEffect, useState } from 'react';

export default function FinancialCounter({ target, confidence = 0, formulaLine = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 2000;
    
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplayValue(Math.floor(eased * target));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }, [target]);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(displayValue);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-display text-muted mb-2 uppercase tracking-wider">Expected Loss</h3>
      <div className="text-4xl font-mono text-red font-bold tracking-tight shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        {formatted}
      </div>
      <div className="mt-3 text-xs font-mono text-muted/70 bg-bg-surface px-3 py-1.5 rounded-lg border border-border">
        {formulaLine || `P(${Math.round(confidence * 100)}%) × impact`}
      </div>
    </div>
  );
}
