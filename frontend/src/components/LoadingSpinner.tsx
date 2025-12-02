import { Shield } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <Shield className="h-16 w-16 text-purple-500 animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 text-purple-500 blur-xl opacity-50">
            <Shield className="h-16 w-16 animate-spin" />
          </div>
        </div>
        <p className="mt-4 text-lg text-purple-400 animate-pulse">
          Loading threat intelligence...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

