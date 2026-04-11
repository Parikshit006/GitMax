export default function EmptyState({ title, description, icon: Icon, actionLabel, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-card border border-border rounded-xl">
      {Icon && <Icon className="w-12 h-12 text-muted mb-4" />}
      <h3 className="text-lg font-display text-text mb-2">{title}</h3>
      <p className="text-muted mb-6 max-w-md">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/90 font-display transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
