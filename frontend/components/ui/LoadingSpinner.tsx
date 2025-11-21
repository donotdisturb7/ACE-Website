interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  message = 'INITIALISATION DU SYSTÈME...',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`min-h-screen bg-deep-navy flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-neon-rose/30 border-t-neon-rose rounded-full animate-spin" />
        <p className="text-sky-aqua font-mono animate-pulse">{message}</p>
      </div>
    </div>
  );
}

