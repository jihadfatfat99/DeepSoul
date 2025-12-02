import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import type { ThreatData } from '../types/threat-analysis';

const COLORS = {
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
};

interface ChartProps {
  data: ThreatData[];
}

export const SeverityPieChart = ({ data }: ChartProps) => {
  const severityCounts = data.reduce((acc: Record<string, number>, item: ThreatData) => {
    const severity = item['Severity Level'] || 'Unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const getColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return COLORS.red;
      case 'medium': return COLORS.yellow;
      case 'low': return COLORS.green;
      default: return COLORS.purple;
    }
  };

  return (
    <Card glow>
      <CardHeader>
        <CardTitle>Threats by Severity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const AttackTypeBarChart = ({ data }: ChartProps) => {
  const attackCounts = data.reduce((acc: Record<string, number>, item: ThreatData) => {
    const attack = item['Attack Type'] || 'Unknown';
    acc[attack] = (acc[attack] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(attackCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card glow>
      <CardHeader>
        <CardTitle>Attack Types Distribution</CardTitle>
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
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="value" fill={COLORS.purple} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const ThreatTimelineChart = ({ data }: ChartProps) => {
  // Group by date
  const timelineData = data.reduce((acc: Record<string, { date: string; count: number }>, item: ThreatData) => {
    const date = item.Timestamp?.split(' ')[0] || 'Unknown';
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(timelineData).sort((a: { date: string; count: number }, b: { date: string; count: number }) => a.date.localeCompare(b.date));

  return (
    <Card glow className="col-span-2">
      <CardHeader>
        <CardTitle>Threat Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
            <XAxis
              dataKey="date"
              stroke="#a855f7"
              style={{ fontSize: '10px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#a855f7"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={COLORS.pink}
              strokeWidth={2}
              dot={{ fill: COLORS.purple, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const ProtocolDistributionChart = ({ data }: ChartProps) => {
  const protocolCounts = data.reduce((acc: Record<string, number>, item: ThreatData) => {
    const protocol = item.Protocol || 'Unknown';
    acc[protocol] = (acc[protocol] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(protocolCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card glow>
      <CardHeader>
        <CardTitle>Protocol Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

