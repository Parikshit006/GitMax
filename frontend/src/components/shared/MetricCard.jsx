export default function MetricCard({ title, value, type = 'default', children, loading = false }) {
  const getColors = () => {
    switch (type) {
      case 'success': return 'text-green';
      case 'warning': return 'text-amber';
      case 'danger': return 'text-red';
      case 'info': return 'text-cyan';
      default: return 'text-text';
    }
  };

  return (
    <div className="p-6 bg-bg-card border border-border rounded-xl hover:scale-[1.01] transition-transform duration-200">
      <h3 className="text-sm font-display text-muted mb-2">{title}</h3>
      {loading ? (
        <div className="h-8 w-24 bg-border/50 animate-pulse rounded" />
      ) : (
        <div className={`text-2xl font-mono ${getColors()} truncate`} title={value != null ? value.toString() : ''}>
          {value != null ? value : '--'}
        </div>

      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
