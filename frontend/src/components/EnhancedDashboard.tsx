import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, Activity, TrendingUp, Search, RefreshCw, Filter, Download, Bell } from 'lucide-react';
import StatCard from './StatCard';
import EnhancedThreatTable from './EnhancedThreatTable';
import AlertBanner from './AlertBanner';
import { SeverityPieChart, AttackTypeBarChart, ThreatTimelineChart, ProtocolDistributionChart } from './Charts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ThreatData } from '../types/threat-analysis';

interface EnhancedDashboardProps {
  threatData: ThreatData[];
}

const EnhancedDashboard = ({ threatData }: EnhancedDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = threatData.length;
    const highSeverity = threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'high').length;
    const malicious = threatData.filter((t: ThreatData) => t.is_malicious === true).length;
    const blocked = threatData.filter((t: ThreatData) => t['Action Taken']?.toLowerCase() === 'blocked').length;
    const avgAnomalyScore = (threatData.reduce((sum: number, t: ThreatData) => sum + parseFloat(t['Anomaly Scores'] || '0'), 0) / total).toFixed(2);
    const avgRiskScore = (threatData.reduce((sum: number, t: ThreatData) => sum + parseFloat(String(t.final_risk_score || 0)), 0) / total).toFixed(2);

    return {
      total,
      highSeverity,
      malicious,
      blocked,
      avgAnomalyScore,
      avgRiskScore,
      mediumSeverity: threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'medium').length,
      lowSeverity: threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'low').length,
      withMalware: threatData.filter((t: ThreatData) => t['Malware Indicators']).length,
      withAlerts: threatData.filter((t: ThreatData) => (t as any)['Alerts/Warnings']).length,
    };
  }, [threatData]);

  // Generate critical alerts
  const criticalAlerts = useMemo(() => {
    const alerts = [];
    
    // High anomaly scores
    const highAnomalyThreats = threatData.filter((t: ThreatData) => parseFloat(t['Anomaly Scores'] || '0') > 90);
    if (highAnomalyThreats.length > 0 && highAnomalyThreats[0]) {
      const first = highAnomalyThreats[0];
      alerts.push({
        id: 'high-anomaly',
        severity: 'critical',
        title: `${highAnomalyThreats.length} Threats with High Anomaly Scores (>90)`,
        message: 'Multiple threats detected with anomaly scores above 90. Immediate investigation recommended.',
        details: `Latest: ${first['Source IP Address']} (Score: ${first['Anomaly Scores']})`
      });
    }

    // High severity + High risk
    const criticalThreats = threatData.filter((t: ThreatData) => 
      t['Severity Level']?.toLowerCase() === 'high' && 
      parseFloat(String(t.final_risk_score || 0)) >= 70
    );
    if (criticalThreats.length > 0 && criticalThreats[0]) {
      const first = criticalThreats[0];
      alerts.push({
        id: 'critical',
        severity: 'high',
        title: `${criticalThreats.length} Critical Threats Require Immediate Attention`,
        message: 'High severity threats with elevated risk scores detected.',
        details: `Latest: ${first['Attack Type']} from ${first['Geo-location Data']}`
      });
    }

    // Malware detected
    if (stats.withMalware > 0) {
      alerts.push({
        id: 'malware',
        severity: 'high',
        title: `${stats.withMalware} Threats with Malware Indicators`,
        message: 'IoC (Indicators of Compromise) detected in network traffic.',
      });
    }

    return alerts;
  }, [threatData, stats]);

  // Filter data
  const filteredData = useMemo(() => {
    return threatData.filter((item: ThreatData) => {
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesSeverity = filterSeverity === 'all' || 
        item['Severity Level']?.toLowerCase() === filterSeverity;

      const matchesAction = filterAction === 'all' ||
        item['Action Taken']?.toLowerCase() === filterAction;

      return matchesSearch && matchesSeverity && matchesAction;
    });
  }, [threatData, searchTerm, filterSeverity, filterAction]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/30 bg-slate-900/95 backdrop-blur-md shadow-lg shadow-purple-500/10">
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                  DeepSoul Threat Intelligence
                </h1>
                <p className="text-sm text-slate-400">Advanced Network Security Monitoring & Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="flex items-center space-x-2 bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-medium">System Active</span>
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="border-purple-500/50 bg-transparent text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-purple-500/50 bg-transparent text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
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
            trend={{ value: "+12% from last hour", positive: false }}
          />
          <StatCard
            title="High Severity"
            value={stats.highSeverity}
            icon={AlertTriangle}
            glowColor="red"
            trend={{ value: `${((stats.highSeverity / stats.total) * 100).toFixed(1)}% of total`, positive: false }}
          />
          <StatCard
            title="Threats Blocked"
            value={stats.blocked}
            icon={Shield}
            glowColor="green"
            trend={{ value: `${((stats.blocked / stats.total) * 100).toFixed(1)}% blocked`, positive: true }}
          />
          <StatCard
            title="Avg Risk Score"
            value={stats.avgRiskScore}
            icon={TrendingUp}
            glowColor="yellow"
            trend={{ value: `Anomaly: ${stats.avgAnomalyScore}`, positive: false }}
          />
        </div>

        {/* Secondary Stats */}
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-1">
                <p className="text-3xl font-bold text-pink-400">{stats.withMalware}</p>
                <p className="text-sm text-slate-400">Malware Detected</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-3xl font-bold text-yellow-400">{stats.withAlerts}</p>
                <p className="text-sm text-slate-400">Active Alerts</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-3xl font-bold text-green-400">{stats.lowSeverity}</p>
                <p className="text-sm text-slate-400">Low Severity</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-3xl font-bold text-orange-400">{stats.mediumSeverity}</p>
                <p className="text-sm text-slate-400">Medium Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityPieChart data={threatData} />
          <AttackTypeBarChart data={threatData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatTimelineChart data={threatData} />
          <ProtocolDistributionChart data={threatData} />
        </div>

        <Separator className="bg-purple-500/20" />

        {/* Filters and Search */}
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Threat Analysis & Filtering
            </CardTitle>
            <CardDescription className="text-slate-400">
              Search, filter, and analyze detected threats in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Search threats by IP, user, location, or attack type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-purple-500/50 bg-slate-900/80 text-white placeholder-slate-500 focus-visible:ring-purple-500 focus-visible:border-purple-400"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-400" />
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[140px] border-purple-500/50 bg-slate-900 text-white focus:ring-purple-500">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-500/50">
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[140px] border-purple-500/50 bg-slate-900 text-white focus:ring-purple-500">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/50">
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="logged">Logged</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-purple-500/50 bg-transparent text-purple-400 hover:bg-purple-500/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                {filteredData.length} results
              </Badge>
              {(searchTerm || filterSeverity !== 'all' || filterAction !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterSeverity('all');
                    setFilterAction('all');
                  }}
                  className="text-purple-400 hover:text-purple-300 h-6 px-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Threat Table */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Threat Detection Log
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Comprehensive view of all detected threats with detailed analysis
            </p>
          </div>
          <EnhancedThreatTable data={filteredData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-400">
              © 2025 DeepSoul Threat Intelligence | Powered by AI-Enhanced Security
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2 animate-pulse" />
                All Systems Operational
              </Badge>
              <span className="text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedDashboard;

