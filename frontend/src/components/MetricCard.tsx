import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  icon?: LucideIcon;
  variant?: 'default' | 'danger' | 'success';
}

const MetricCard = ({ title, value, subtitle, trend, icon: Icon, variant = 'default' }: MetricCardProps) => {
  const getTrendIcon = () => {
    if (trend !== undefined) {
      if (trend > 0) return TrendingUp;
      if (trend < 0) return TrendingDown;
    }
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'border-red-500/20 bg-red-500/5';
      case 'success':
        return 'border-green-500/20 bg-green-500/5';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-white/40';
    if (variant === 'danger') {
      return trend < 0 ? 'text-green-400' : 'text-red-400';
    }
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-white/40';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative p-6 rounded-sm border transition-all duration-200",
        getVariantStyles(),
        "hover:bg-white/10"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-light">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-white/60" />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">
          {subtitle}
        </p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1", getTrendColor())}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs font-medium">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
