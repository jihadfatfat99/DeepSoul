import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { ThreatData } from '../types/threat-analysis';

const COLORS = {
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
  orange: '#f97316',
};

interface ChartProps {
  data: ThreatData[];
}

interface HeatmapItem {
  hour: number;
  severity: string;
  count: number;
}

export const AttackHeatmap = ({ data }: ChartProps) => {
  // Group by hour and severity
  const heatmapData = data.reduce((acc: Record<string, HeatmapItem>, item: ThreatData) => {
    const hour = new Date(item.Timestamp).getHours();
    const severity = item['Severity Level'] || 'Unknown';
    const key = `${hour}-${severity}`;
    
    if (!acc[key]) {
      acc[key] = { hour, severity, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(heatmapData).sort((a: HeatmapItem, b: HeatmapItem) => a.hour - b.hour);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            24-Hour Attack Heatmap
          </CardTitle>
          <CardDescription className="text-slate-400">
            Threat distribution across the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.red} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.yellow} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.yellow} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                dataKey="hour" 
                stroke="#a855f7"
                style={{ fontSize: '12px' }}
                label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5, fill: '#a855f7' }}
              />
              <YAxis 
                stroke="#a855f7"
                style={{ fontSize: '12px' }}
                label={{ value: 'Threats', angle: -90, position: 'insideLeft', fill: '#a855f7' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke={COLORS.purple} 
                fill="url(#colorHigh)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ThreatRadarChart = ({ data }: ChartProps) => {
  const attackTypes = ['DDoS', 'Malware', 'Intrusion'];
  
  const radarData = attackTypes.map(attack => ({
    subject: attack,
    A: data.filter((t: ThreatData) => t['Attack Type'] === attack && t['Severity Level'] === 'High').length,
    B: data.filter((t: ThreatData) => t['Attack Type'] === attack && t['Severity Level'] === 'Medium').length,
    C: data.filter((t: ThreatData) => t['Attack Type'] === attack && t['Severity Level'] === 'Low').length,
    fullMark: Math.ceil(data.length / 3),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Threat Analysis Radar
          </CardTitle>
          <CardDescription className="text-slate-400">
            Multi-dimensional attack pattern analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(168, 85, 247, 0.2)" />
              <PolarAngleAxis 
                dataKey="subject" 
                stroke="#a855f7"
                style={{ fontSize: '12px', fill: '#a855f7' }}
              />
              <PolarRadiusAxis stroke="#a855f7" />
              <Radar 
                name="High" 
                dataKey="A" 
                stroke={COLORS.red} 
                fill={COLORS.red} 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Medium" 
                dataKey="B" 
                stroke={COLORS.yellow} 
                fill={COLORS.yellow} 
                fillOpacity={0.4} 
              />
              <Radar 
                name="Low" 
                dataKey="C" 
                stroke={COLORS.green} 
                fill={COLORS.green} 
                fillOpacity={0.3} 
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const RiskScoreGauge = ({ data }: ChartProps) => {
  const avgRisk = data.reduce((sum: number, t: ThreatData) => sum + parseFloat(String(t.final_risk_score || 0)), 0) / data.length;
  const avgAnomaly = data.reduce((sum: number, t: ThreatData) => sum + parseFloat(t['Anomaly Scores'] || '0'), 0) / data.length;
  
  const gaugeData = [
    { name: 'Risk', value: avgRisk, fill: COLORS.red },
    { name: 'Remaining', value: 100 - avgRisk, fill: 'rgba(100, 100, 100, 0.2)' },
  ];

  const anomalyData = [
    { name: 'Anomaly', value: avgAnomaly, fill: COLORS.yellow },
    { name: 'Remaining', value: 100 - avgAnomaly, fill: 'rgba(100, 100, 100, 0.2)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            Risk & Anomaly Meters
          </CardTitle>
          <CardDescription className="text-slate-400">
            Average threat metrics across all detections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{avgRisk.toFixed(1)}</p>
                <p className="text-sm text-slate-400">Avg Risk Score</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={anomalyData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {anomalyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{avgAnomaly.toFixed(1)}</p>
                <p className="text-sm text-slate-400">Avg Anomaly Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface SegmentData {
  name: string;
  High: number;
  Medium: number;
  Low: number;
  [key: string]: string | number;
}

export const NetworkSegmentChart = ({ data }: ChartProps) => {
  const segmentCounts = data.reduce((acc: Record<string, SegmentData>, item: ThreatData) => {
    const segment = item['Network Segment'] || 'Unknown';
    const severity = item['Severity Level'] || 'Unknown';
    
    if (!acc[segment]) {
      acc[segment] = { name: segment, High: 0, Medium: 0, Low: 0 };
    }
    const currentValue = typeof acc[segment][severity] === 'number' ? acc[segment][severity] : 0;
    acc[segment][severity] = currentValue + 1;
    return acc;
  }, {});

  const chartData = Object.values(segmentCounts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            Network Segment Analysis
          </CardTitle>
          <CardDescription className="text-slate-400">
            Threat distribution across network segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#a855f7"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#a855f7"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Bar dataKey="High" stackId="a" fill={COLORS.red} />
              <Bar dataKey="Medium" stackId="a" fill={COLORS.yellow} />
              <Bar dataKey="Low" stackId="a" fill={COLORS.green} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const GeographicDistribution = ({ data }: ChartProps) => {
  const locationCounts = data.reduce((acc: Record<string, number>, item: ThreatData) => {
    const location = item['Geo-location Data']?.split(',').pop()?.trim() || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(locationCounts)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a: { name: string; value: number }, b: { name: string; value: number }) => b.value - a.value)
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Top 10 Attack Origins
          </CardTitle>
          <CardDescription className="text-slate-400">
            Geographic distribution of threat sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis 
                type="number" 
                stroke="#a855f7"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#a855f7"
                style={{ fontSize: '11px' }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" fill={COLORS.cyan} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

