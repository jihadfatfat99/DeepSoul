import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { ThreatData } from '../types/threat-analysis';

interface MinimalChartsProps {
  data: ThreatData[];
}

interface TimelineEntry {
  date: string;
  count: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: TimelineEntry | { name: string; value: number };
  }>;
}

const MinimalCharts = ({ data }: MinimalChartsProps) => {
  // Process data for charts
  const severityData = Object.entries(
    data.reduce((acc: Record<string, number>, item: ThreatData) => {
      const severity = item['Severity Level'] || 'Unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  const timelineData = data.reduce((acc: Record<string, TimelineEntry>, item: ThreatData) => {
    const date = item.Timestamp?.split(' ')[0] || 'Unknown';
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(timelineData).sort((a: TimelineEntry, b: TimelineEntry) => a.date.localeCompare(b.date)).slice(-7);

  const attackTypeData = Object.entries(
    data.reduce((acc: Record<string, number>, item: ThreatData) => {
      const type = item['Attack Type'] || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number })).sort((a: { name: string; value: number }, b: { name: string; value: number }) => b.value - a.value);

  const riskDistribution = data.map((item: ThreatData) => ({
    time: new Date(item.Timestamp).getHours(),
    risk: parseFloat(String(item.final_risk_score || 0)),
    anomaly: parseFloat(item['Anomaly Scores'] || '0')
  })).sort((a, b) => a.time - b.time);

  const COLORS: Record<string, string> = {
    high: '#ef4444',
    medium: '#eab308',
    low: '#22c55e',
    default: '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length && payload[0]) {
      const firstPayload = payload[0];
      const dateValue = firstPayload?.payload && typeof firstPayload.payload === 'object' && 'date' in firstPayload.payload ? (firstPayload.payload as TimelineEntry).date : undefined;
      return (
        <div className="bg-black border border-white/10 p-3 rounded-sm">
          <p className="text-xs text-white/60">{firstPayload?.name || dateValue || 'N/A'}</p>
          <p className="text-sm font-medium text-white">{firstPayload?.value ?? 'N/A'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Threat Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 rounded-sm p-6 border border-white/10"
        >
          <h3 className="text-lg font-light mb-6">Threat Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.split('-').slice(1).join('/')}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#ffffff"
                strokeWidth={2}
                fill="url(#gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white/5 rounded-sm p-6 border border-white/10"
        >
          <h3 className="text-lg font-light mb-6">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase()] || COLORS.default}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: COLORS[item.name.toLowerCase()] || COLORS.default }}
                  />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <span className="font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Attack Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white/5 rounded-sm p-6 border border-white/10"
      >
        <h3 className="text-lg font-light mb-6">Attack Type Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attackTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="rgba(255,255,255,0.2)"
              radius={[4, 4, 0, 0]}
            >
              {attackTypeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`rgba(255,255,255,${0.2 + (index * 0.1)})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Score Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white/5 rounded-sm p-6 border border-white/10"
      >
        <h3 className="text-lg font-light mb-6">Risk Score Trend (24h)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={riskDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11 }}
              label={{ value: 'Hour', position: 'insideBottom', offset: -5, style: { fill: 'rgba(255,255,255,0.4)' } }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11 }}
              label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.4)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              name="Risk Score"
            />
            <Line 
              type="monotone" 
              dataKey="anomaly" 
              stroke="#eab308" 
              strokeWidth={2}
              dot={false}
              name="Anomaly Score"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default MinimalCharts;
