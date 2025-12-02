import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface Alert {
  id: string | number;
  title: string;
  message: string;
  severity?: string;
  details?: string;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (id: string | number) => void;
}

const AlertBanner = ({ alerts, onDismiss }: AlertBannerProps) => {
  const [dismissedIds, setDismissedIds] = useState(new Set());

  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.filter(alert => !dismissedIds.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (id: string | number) => {
    setDismissedIds(prev => new Set([...prev, id]));
    if (onDismiss) onDismiss(id);
  };

  const getSeverityStyles = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'border-red-500 bg-red-500/20 text-red-400';
      case 'high':
        return 'border-orange-500 bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/20 text-yellow-400';
      default:
        return 'border-purple-500 bg-purple-500/20 text-purple-400';
    }
  };

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'relative overflow-hidden rounded-lg border backdrop-blur-sm p-4 animate-pulse-slow',
            getSeverityStyles(alert.severity)
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                {alert.details && (
                  <p className="text-xs opacity-75 mt-2 font-mono">{alert.details}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="ml-4 rounded-full p-1 hover:bg-white/10 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;

