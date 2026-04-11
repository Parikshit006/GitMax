export default function RiskBadge({ level, className = '' }) {
  const normalized = (level || 'LOW').toUpperCase();
  
  const getStyles = () => {
    switch (normalized) {
      case 'HIGH':
        return 'bg-red/10 text-red border border-red/20 shadow-[0_0_12px_rgba(239,68,68,0.45)]';
      case 'MEDIUM':
        return 'bg-amber/10 text-amber border border-amber/20 shadow-[0_0_12px_rgba(245,158,11,0.45)]';
      case 'LOW':
        return 'bg-green/10 text-green border border-green/20 shadow-[0_0_12px_rgba(16,185,129,0.45)]';
      default:
        return 'bg-muted/10 text-muted border border-muted/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-display font-medium rounded-md ${getStyles()} ${className}`}>
      {normalized} RISK
    </span>
  );
}
