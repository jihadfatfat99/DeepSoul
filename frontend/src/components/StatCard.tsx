import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    positive: boolean;
    value: string;
  };
  className?: string;
  glowColor?: 'purple' | 'pink' | 'blue' | 'red' | 'yellow' | 'green';
}

const StatCard = ({ title, value, icon: Icon, trend, className, glowColor = "purple" }: StatCardProps) => {
  const glowColors = {
    purple: "shadow-neon-purple border-purple-500/50",
    pink: "shadow-neon-pink border-pink-500/50",
    blue: "shadow-neon-blue border-blue-500/50",
    red: "shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-500/50",
    yellow: "shadow-[0_0_20px_rgba(234,179,8,0.6)] border-yellow-500/50",
    green: "shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-500/50",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-slate-900/80 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-105",
        glowColors[glowColor],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm font-medium",
              trend.positive ? "text-green-400" : "text-red-400"
            )}>
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-purple-500/20 p-3">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

