import { 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Line, Legend, ComposedChart, Brush, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Activity, Shield, AlertTriangle, TrendingUp, TrendingDown, Clock, 
  Network, Server, Database, Eye, Download, Zap,
  Target, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import type { ThreatData } from '../types/threat-analysis';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface EliteChartsProps {
  data: ThreatData[];
}

interface TimelineEntry {
  date: string;
  count: number;
  critical: number;
  medium: number;
  low: number;
  hour?: string;
}

interface PortAnalysis {
  port: string;
  count: number;
  risk: number;
}

const EliteCharts = ({ data }: EliteChartsProps) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [showLegend, setShowLegend] = useState(true);

  // Advanced data processing with memoization
  const processedData = useMemo(() => {
    // Severity distribution
    const severityData = Object.entries(
      data.reduce((acc: Record<string, number>, item: ThreatData) => {
        const severity = item['Severity Level'] || 'Unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ 
      name, 
      value: value as number,
      percentage: ((value as number) / data.length * 100).toFixed(1)
    }));

    // Enhanced timeline with all severity levels
    const timelineData = data.reduce((acc: Record<string, TimelineEntry>, item: ThreatData) => {
      const date = item.Timestamp?.split(' ')[0] || 'Unknown';
      if (!acc[date]) {
        acc[date] = { date, count: 0, critical: 0, medium: 0, low: 0 };
      }
      acc[date].count += 1;
      const severity = item['Severity Level']?.toLowerCase();
      if (severity === 'high') acc[date].critical += 1;
      else if (severity === 'medium') acc[date].medium += 1;
      else if (severity === 'low') acc[date].low += 1;
      return acc;
    }, {});

    const chartData = Object.values(timelineData)
      .sort((a: TimelineEntry, b: TimelineEntry) => a.date.localeCompare(b.date))
      .slice(timeRange === '24h' ? -1 : timeRange === '7d' ? -7 : -30);

    // Hourly distribution
    const hourlyData = data.reduce((acc: Record<string, number>, item: ThreatData) => {
      const hour = new Date(item.Timestamp).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      acc[hourKey] = (acc[hourKey] || 0) + 1;
      return acc;
    }, {});

    const hourlyChartData = Object.entries(hourlyData)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Attack type analysis
    const attackTypeData = Object.entries(
      data.reduce((acc: Record<string, number>, item: ThreatData) => {
        const type = item['Attack Type'] || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);

    // Port analysis
    const portData = data.reduce((acc: Record<string, PortAnalysis>, item: ThreatData) => {
      const port = item['Destination Port'] || 'Unknown';
      if (!acc[port]) {
        acc[port] = { port, count: 0, risk: 0 };
      }
      acc[port].count += 1;
      acc[port].risk += item.final_risk_score || 0;
      return acc;
    }, {});

    const topPorts = Object.values(portData)
      .map(p => ({ ...p, avgRisk: p.risk / p.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Protocol distribution
    const protocolData = Object.entries(
      data.reduce((acc: Record<string, number>, item: ThreatData) => {
        const protocol = item.Protocol || 'Unknown';
        acc[protocol] = (acc[protocol] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    // Network segment analysis
    const segmentData = Object.entries(
      data.reduce((acc: Record<string, number>, item: ThreatData) => {
        const segment = item['Network Segment'] || 'Unknown';
        acc[segment] = (acc[segment] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    // Top source IPs
    const topSourceIPs = Object.entries(
      data.reduce((acc: Record<string, number>, item: ThreatData) => {
        const ip = item['Source IP Address'] || 'Unknown';
        acc[ip] = (acc[ip] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([ip, count]) => ({ ip, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Action distribution
    const actionData = Object.entries(
      data.reduce((acc: Record<string, number>, item: ThreatData) => {
        const action = item['Action Taken'] || 'Unknown';
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    // Risk score distribution
    const riskBuckets = data.reduce((acc: Record<string, number>, item: ThreatData) => {
      const score = item.final_risk_score || 0;
      let bucket = '0-20';
      if (score > 80) bucket = '80-100';
      else if (score > 60) bucket = '60-80';
      else if (score > 40) bucket = '40-60';
      else if (score > 20) bucket = '20-40';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    const riskDistribution = Object.entries(riskBuckets)
      .map(([range, count]) => ({ range, count: count as number }))
      .sort((a, b) => a.range.localeCompare(b.range));

    // Trends calculation
    const recentData = chartData.slice(-3);
    const olderData = chartData.slice(0, 3);
    const recentAvg = recentData.reduce((sum, d) => sum + d.count, 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + d.count, 0) / olderData.length;
    const trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';
    const trendPercentage = olderAvg > 0 ? Math.abs(((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1) : 0;

    return {
      severityData,
      chartData,
      hourlyChartData,
      attackTypeData,
      topPorts,
      protocolData,
      segmentData,
      topSourceIPs,
      actionData,
      riskDistribution,
      trend,
      trendPercentage
    };
  }, [data, timeRange]);

  const radarData = processedData.attackTypeData.slice(0, 6).map((item) => ({
    subject: item.name,
    value: item.value,
    fullMark: Math.max(...processedData.attackTypeData.map((d) => d.value))
  }));

  const COLORS: Record<string, string> = {
    high: '#ef4444',
    medium: '#eab308',
    low: '#22c55e',
    default: '#a855f7'
  };

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      name?: string;
      value?: number;
      color?: string;
      payload?: TimelineEntry | { name: string; value: number };
    }>;
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length && payload[0]) {
      const firstPayload = payload[0];
      const dateValue = firstPayload?.payload && typeof firstPayload.payload === 'object' && 'date' in firstPayload.payload ? (firstPayload.payload as TimelineEntry).date : undefined;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f0f14]/95 border border-purple-500/30 p-3 rounded-lg backdrop-blur-sm shadow-lg"
        >
          <p className="text-xs text-purple-300/70 mb-2">{firstPayload?.name || dateValue || 'N/A'}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry?.color || '#fff' }}>
              {entry.name}: {entry.value ?? 'N/A'}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    if (processedData.trend === 'up') return <ArrowUpRight className="w-4 h-4" />;
    if (processedData.trend === 'down') return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (processedData.trend === 'up') return 'text-red-400';
    if (processedData.trend === 'down') return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
              showLegend 
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                : "bg-purple-500/5 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
            )}
          >
            <Eye className="w-4 h-4" />
            Legend
          </button>
          
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/20 bg-purple-500/5 text-white/60 hover:bg-purple-500/10 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-all",
                timeRange === range
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-white/60 hover:bg-purple-500/5"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { 
            label: 'Active Threats', 
            value: data.length, 
            icon: Activity, 
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
          },
          { 
            label: 'Critical', 
            value: processedData.severityData.find(d => d.name === 'High')?.value || 0, 
            icon: AlertTriangle, 
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
          },
          { 
            label: 'Blocked', 
            value: data.filter((t: ThreatData) => t['Action Taken'] === 'Blocked').length, 
            icon: Shield, 
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
          },
          { 
            label: 'Avg Risk', 
            value: Math.round(data.reduce((sum: number, t: ThreatData) => sum + parseFloat(String(t.final_risk_score || 0)), 0) / data.length), 
            icon: TrendingUp, 
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20'
          },
          { 
            label: 'Trend', 
            value: `${processedData.trend === 'up' ? '+' : processedData.trend === 'down' ? '-' : ''}${processedData.trendPercentage}%`, 
            icon: processedData.trend === 'up' ? TrendingUp : processedData.trend === 'down' ? TrendingDown : Minus, 
            color: getTrendColor(),
            bgColor: processedData.trend === 'up' ? 'bg-red-500/10' : processedData.trend === 'down' ? 'bg-green-500/10' : 'bg-yellow-500/10',
            borderColor: processedData.trend === 'up' ? 'border-red-500/20' : processedData.trend === 'down' ? 'border-green-500/20' : 'border-yellow-500/20'
          }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              "rounded-lg p-4 border backdrop-blur-sm hover:shadow-lg transition-all",
              stat.bgColor,
              stat.borderColor
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              {stat.label === 'Trend' && (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {getTrendIcon()}
                </motion.div>
              )}
            </div>
            <p className={cn("text-2xl font-bold mb-1", stat.color)}>{stat.value}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Threat Timeline with Brush */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">Threat Timeline Analysis</h3>
            <Clock className="w-5 h-5 text-purple-400/60" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={processedData.chartData}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
                tickFormatter={(value) => value.split('-').slice(1).join('/')}
              />
              <YAxis 
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
              <Area 
                type="monotone" 
                dataKey="critical" 
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#redGradient)"
                name="Critical"
                stackId="1"
              />
              <Area 
                type="monotone" 
                dataKey="medium" 
                stroke="#eab308"
                strokeWidth={2}
                fill="url(#yellowGradient)"
                name="Medium"
                stackId="1"
              />
              <Area 
                type="monotone" 
                dataKey="low" 
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#purpleGradient)"
                name="Low"
                stackId="1"
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#a855f7" 
                strokeWidth={3}
                dot={{ fill: '#a855f7', r: 4 }}
                name="Total"
              />
              <Brush 
                dataKey="date" 
                height={20} 
                stroke="#a855f7"
                fill="rgba(168, 85, 247, 0.1)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Enhanced Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">Severity Distribution</h3>
            <Target className="w-5 h-5 text-purple-400/60" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={processedData.severityData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                label={(props: any) => `${props.name}: ${props.percent ? (props.percent * 100).toFixed(1) : 0}%`}
                labelLine={{ stroke: 'rgba(168, 85, 247, 0.3)' }}
              >
                {processedData.severityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase()] || COLORS.default}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    stroke="rgba(15, 15, 20, 1)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {processedData.severityData.map((item) => (
              <motion.div 
                key={item.name} 
                className="flex items-center justify-between text-sm p-2 rounded hover:bg-purple-500/5 transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ 
                      backgroundColor: COLORS[item.name.toLowerCase()] || COLORS.default,
                      boxShadow: `0 0 10px ${COLORS[item.name.toLowerCase()] || COLORS.default}50`
                    }}
                  />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-purple-300">{item.value}</span>
                  <span className="text-xs text-white/40">{item.percentage}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hourly Distribution & Port Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Attack Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">24h Attack Pattern</h3>
            <Clock className="w-5 h-5 text-purple-400/60" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processedData.hourlyChartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                dataKey="hour" 
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 10, fill: 'rgba(168, 85, 247, 0.6)' }}
              />
              <YAxis 
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                name="Attacks"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Ports Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">Top Targeted Ports</h3>
            <Server className="w-5 h-5 text-purple-400/60" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processedData.topPorts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                type="number"
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
              />
              <YAxis 
                dataKey="port" 
                type="category"
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]}
                name="Attacks"
              >
                {processedData.topPorts.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`rgba(168, 85, 247, ${0.4 + (index * 0.05)})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Network & Protocol Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Pattern Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">Attack Vector Analysis</h3>
            <Zap className="w-5 h-5 text-purple-400/60" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid 
                  stroke="rgba(168, 85, 247, 0.2)" 
                  radialLines={false}
                />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke="rgba(168, 85, 247, 0.4)"
                  tick={{ fontSize: 10, fill: 'rgba(168, 85, 247, 0.8)' }}
                />
                <PolarRadiusAxis 
                  stroke="rgba(168, 85, 247, 0.2)"
                  tick={{ fontSize: 9, fill: 'rgba(168, 85, 247, 0.4)' }}
                  axisLine={false}
                />
                <Radar 
                  name="Attacks" 
                  dataKey="value" 
                  stroke="#a855f7" 
                  fill="#a855f7" 
                  fillOpacity={0.4}
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 4 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {processedData.attackTypeData.slice(0, 10).map((item, idx) => (
                <motion.div 
                  key={item.name} 
                  className="space-y-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80 truncate">{item.name}</span>
                    <span className="font-mono text-purple-300 ml-2">{item.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${COLORS[idx % 3 === 0 ? 'high' : idx % 3 === 1 ? 'medium' : 'low']}, ${COLORS.default})`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${processedData.attackTypeData[0] ? (item.value / processedData.attackTypeData[0].value) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Protocol & Network Segment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all space-y-6"
        >
          {/* Protocol Distribution */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-medium text-purple-300">Protocol Distribution</h4>
            </div>
            <div className="space-y-2">
              {processedData.protocolData.map((item, idx) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 rounded hover:bg-purple-500/5 transition-all"
                >
                  <span className="text-xs text-white/70">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-black/50 rounded overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / data.length) * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-purple-300 w-8 text-right">{item.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Network Segments */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-medium text-purple-300">Network Segments</h4>
            </div>
            <div className="space-y-2">
              {processedData.segmentData.map((item, idx) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 rounded hover:bg-purple-500/5 transition-all"
                >
                  <span className="text-xs text-white/70">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-black/50 rounded overflow-hidden">
                      <motion.div
                        className="h-full bg-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / data.length) * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-cyan-300 w-8 text-right">{item.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Risk Score & Action Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">Risk Score Distribution</h3>
            <TrendingUp className="w-5 h-5 text-purple-400/60" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processedData.riskDistribution}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                dataKey="range" 
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
              />
              <YAxis 
                stroke="rgba(168, 85, 247, 0.4)"
                tick={{ fontSize: 11, fill: 'rgba(168, 85, 247, 0.6)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#riskGradient)"
                radius={[8, 8, 0, 0]}
                name="Threats"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Action Distribution & Top IPs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-[#0f0f14]/50 rounded-lg p-6 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-purple-300">Actions & Top Sources</h3>
            <Shield className="w-5 h-5 text-purple-400/60" />
          </div>
          
          {/* Actions Pie Chart */}
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={processedData.actionData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={4}
                dataKey="value"
              >
                {processedData.actionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Blocked' ? '#ef4444' : 
                      entry.name === 'Logged' ? '#3b82f6' : 
                      '#6b7280'
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Top Source IPs */}
          <div className="mt-4">
            <h4 className="text-xs text-purple-300/70 uppercase tracking-wider mb-3">Top Attack Sources</h4>
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
              {processedData.topSourceIPs.slice(0, 5).map((item, idx) => (
                <motion.div 
                  key={item.ip}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-purple-500/5 transition-all"
                >
                  <span className="font-mono text-cyan-400 truncate">{item.ip}</span>
                  <span className="font-mono text-purple-300">{item.count}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(168, 85, 247, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default EliteCharts;
