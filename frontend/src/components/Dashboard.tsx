import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, Activity, TrendingUp, Search, RefreshCw } from 'lucide-react';
import StatCard from './StatCard';
import ThreatTable from './ThreatTable';
import AlertBanner from './AlertBanner';
import { SeverityPieChart, AttackTypeBarChart, ThreatTimelineChart, ProtocolDistributionChart } from './Charts';
import type { ThreatData } from '../types/threat-analysis';

interface DashboardProps {
  threatData: ThreatData[];
}

const Dashboard = ({ threatData }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = threatData.length;
    const highSeverity = threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'high').length;
    const malicious = threatData.filter((t: ThreatData) => t.is_malicious === true).length;
    const conflicts = 0; // conflict_detected is not in ThreatData type

    return {
      total,
      highSeverity,
      malicious,
      conflicts,
      mediumSeverity: threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'medium').length,
      lowSeverity: threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'low').length,
    };
  }, [threatData]);

  // Generate critical alerts
  const criticalAlerts = useMemo(() => {
    const alerts: Array<{ id: string; severity: string; title: string; message: string; details: string }> = [];
    
    // Find high severity threats
    const criticalThreats = threatData.filter((t: ThreatData) => 
      t['Severity Level']?.toLowerCase() === 'high'
    );
    if (criticalThreats.length > 0 && criticalThreats[0]) {
      const first = criticalThreats[0];
      alerts.push({
        id: 'critical',
        severity: 'critical',
        title: `${criticalThreats.length} Critical Threats Require Immediate Attention`,
        message: 'High severity threats with critical risk level detected.',
        details: `Latest: ${first['Source IP Address']} → ${first['Destination IP Address']} (${first['Attack Type']})`
      });
    }

    return alerts;
  }, [threatData]);

  // Filter data
  const filteredData = useMemo(() => {
    return threatData.filter((item: ThreatData) => {
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesSeverity = filterSeverity === 'all' || 
        item['Severity Level']?.toLowerCase() === filterSeverity;

      return matchesSearch && matchesSeverity;
    });
  }, [threatData, searchTerm, filterSeverity]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Shield className="h-10 w-10 text-purple-500 animate-pulse-slow" />
                <div className="absolute inset-0 h-10 w-10 text-purple-500 blur-xl opacity-50">
                  <Shield className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-glow">
                  DeepSoul Threat Intelligence
                </h1>
                <p className="text-sm text-slate-400">Real-time Network Security Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 rounded-full border border-green-500/50 bg-green-500/20 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400 font-medium">System Active</span>
              </div>
              <button className="rounded-full border border-purple-500/50 bg-purple-500/20 p-2 hover:bg-purple-500/30 transition-colors">
                <RefreshCw className="h-5 w-5 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <AlertBanner alerts={criticalAlerts} />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Threats"
            value={stats.total}
            icon={Activity}
            glowColor="purple"
          />
          <StatCard
            title="High Severity"
            value={stats.highSeverity}
            icon={AlertTriangle}
            glowColor="red"
          />
          <StatCard
            title="Malicious IPs"
            value={stats.malicious}
            icon={Shield}
            glowColor="yellow"
          />
          <StatCard
            title="AI Conflicts"
            value={stats.conflicts}
            icon={TrendingUp}
            glowColor="pink"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityPieChart data={threatData} />
          <AttackTypeBarChart data={threatData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatTimelineChart data={threatData} />
          <ProtocolDistributionChart data={threatData} />
        </div>

        {/* Filters and Search */}
        <div className="rounded-lg border border-purple-500/30 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-purple-500/50 bg-slate-900 pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-slate-400">Filter by Severity:</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="rounded-lg border border-purple-500/50 bg-slate-900 px-4 py-2 text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Threat Table */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Threat Detection Log
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Showing {filteredData.length} of {stats.total} total threats
            </p>
          </div>
          <ThreatTable data={filteredData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-slate-400">
            <p>© 2025 DeepSoul Threat Intelligence | Powered by AI-Enhanced Security</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

