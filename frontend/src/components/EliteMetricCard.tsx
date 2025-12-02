import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EliteMetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  icon?: LucideIcon;
  variant?: 'default' | 'danger' | 'success';
  glowColor?: 'purple' | 'red' | 'green' | 'yellow';
}

const EliteMetricCard = ({ title, value, subtitle, trend, icon: Icon, variant = 'default', glowColor = 'purple' }: EliteMetricCardProps) => {
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
        return 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent';
      case 'success':
        return 'border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent';
      default:
        return 'border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent';
    }
  };

  const getGlowStyles = () => {
    switch (glowColor) {
      case 'red':
        return 'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]';
      case 'green':
        return 'hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]';
      case 'yellow':
        return 'hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]';
      default:
        return 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]';
    }
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-white/40';
    if (variant === 'danger') {
      return trend < 0 ? 'text-green-400' : 'text-red-400';
    }
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-white/40';
  };

  const getIconColor = () => {
    switch (glowColor) {
      case 'red':
        return 'text-red-400';
      case 'green':
        return 'text-green-400';
      case 'yellow':
        return 'text-yellow-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "relative p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 overflow-hidden group",
        getVariantStyles(),
        getGlowStyles()
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute inset-0 blur-xl",
          glowColor === 'red' && "bg-gradient-to-br from-red-600/20 to-transparent",
          glowColor === 'green' && "bg-gradient-to-br from-green-600/20 to-transparent",
          glowColor === 'yellow' && "bg-gradient-to-br from-yellow-600/20 to-transparent",
          glowColor === 'purple' && "bg-gradient-to-br from-purple-600/20 to-transparent"
        )} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-4xl font-light tracking-tight">
              {value}
            </p>
          </div>
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center",
              "group-hover:border-white/20 transition-colors"
            )}>
              <Icon className={cn("w-5 h-5", getIconColor())} />
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
      </div>

      {/* Corner accent */}
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 opacity-10",
        glowColor === 'red' && "bg-gradient-to-bl from-red-500 to-transparent",
        glowColor === 'green' && "bg-gradient-to-bl from-green-500 to-transparent",
        glowColor === 'yellow' && "bg-gradient-to-bl from-yellow-500 to-transparent",
        glowColor === 'purple' && "bg-gradient-to-bl from-purple-500 to-transparent"
      )} />
    </motion.div>
  );
};

export default EliteMetricCard;
