import { AlertCircle } from 'lucide-react';

export default function ErrorCard({ message, onRetry }) {
  return (
    <div className="flex items-start p-4 bg-red/10 border border-red/20 rounded-xl">
      <AlertCircle className="w-5 h-5 text-red mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-display text-red mb-1">An error occurred</h4>
        <p className="text-sm text-red/80 mb-3">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-red/20 text-red text-sm font-display rounded-lg hover:bg-red/30 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
