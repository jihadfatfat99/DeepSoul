import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity, TrendingUp, Search, RefreshCw, Filter, Download, Bell, Zap, Globe, Lock, Eye } from 'lucide-react';
import StatCard from './StatCard';
import EnhancedThreatTable from './EnhancedThreatTable';
import AlertBanner from './AlertBanner';
import RealTimeActivityFeed from './RealTimeActivityFeed';
import { SeverityPieChart, AttackTypeBarChart, ThreatTimelineChart, ProtocolDistributionChart } from './Charts';
import { AttackHeatmap, ThreatRadarChart, RiskScoreGauge, NetworkSegmentChart, GeographicDistribution } from './AdvancedCharts';
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
import toast, { Toaster } from 'react-hot-toast';
import type { ThreatData } from '../types/threat-analysis';

interface UltimateDashboardProps {
  threatData: ThreatData[];
}

const UltimateDashboard = ({ threatData }: UltimateDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [showActivityFeed, setShowActivityFeed] = useState(true);

  // Show welcome toast on mount
  useEffect(() => {
    toast.success('🛡️ CyberShield Threat Intelligence System Active', {
      duration: 4000,
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#fff',
        border: '1px solid rgba(168, 85, 247, 0.3)',
      },
    });
  }, []);

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
      uniqueIPs: new Set(threatData.map((t: ThreatData) => t['Source IP Address'])).size,
      uniqueCountries: new Set(threatData.map((t: ThreatData) => t['Geo-location Data']?.split(',').pop()?.trim())).size,
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
        title: `⚠️ ${highAnomalyThreats.length} Threats with Extremely High Anomaly Scores`,
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
        title: `🚨 ${criticalThreats.length} Critical Threats Require Immediate Attention`,
        message: 'High severity threats with elevated risk scores detected.',
        details: `Latest: ${first['Attack Type']} from ${first['Geo-location Data']}`
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

  const handleRefresh = () => {
    toast.success('🔄 Data refreshed successfully', {
      duration: 2000,
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#fff',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-slate-950 to-pink-900/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Toaster position="top-right" />
        
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 border-b border-purple-500/30 bg-slate-900/95 backdrop-blur-md shadow-lg shadow-purple-500/10"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="h-12 w-12 text-purple-500" />
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0 h-12 w-12 text-purple-500 blur-xl opacity-50"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="h-12 w-12" />
                  </motion.div>
                </div>
                <div>
                  <motion.h1 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
                    animate={{ 
                      backgroundPosition: ['0%', '100%', '0%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    DeepSoul Threat Intelligence
                  </motion.h1>
                  <p className="text-sm text-slate-400 mt-1">Advanced AI-Powered Network Security Monitoring</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Badge className="flex items-center space-x-2 bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="font-semibold">SYSTEM ACTIVE</span>
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-purple-500/50 bg-transparent text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                  onClick={() => setShowActivityFeed(!showActivityFeed)}
                >
                  <Eye className="h-5 w-5" />
                </Button>
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
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertBanner alerts={criticalAlerts} />
            </motion.div>
          )}

          {/* Stats Grid with animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Threats", value: stats.total, icon: Activity, color: "purple" as const, trend: { value: `${stats.uniqueIPs} unique IPs`, positive: false } },
              { title: "High Severity", value: stats.highSeverity, icon: AlertTriangle, color: "red" as const, trend: { value: `${((stats.highSeverity / stats.total) * 100).toFixed(1)}% critical`, positive: false } },
              { title: "Threats Blocked", value: stats.blocked, icon: Shield, color: "green" as const, trend: { value: `${((stats.blocked / stats.total) * 100).toFixed(1)}% blocked`, positive: true } },
              { title: "Avg Risk Score", value: stats.avgRiskScore, icon: TrendingUp, color: "yellow" as const, trend: { value: `Anomaly: ${stats.avgAnomalyScore}`, positive: false } },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <StatCard {...stat} glowColor={stat.color} />
              </motion.div>
            ))}
          </div>

          {/* Enhanced Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-purple-500/30 bg-gradient-to-r from-slate-900/50 via-purple-900/10 to-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {[
                    { label: "Malware Detected", value: stats.withMalware, icon: AlertTriangle, color: "text-red-400" },
                    { label: "Active Alerts", value: stats.withAlerts, icon: Bell, color: "text-yellow-400" },
                    { label: "Countries", value: stats.uniqueCountries, icon: Globe, color: "text-cyan-400" },
                    { label: "Low Severity", value: stats.lowSeverity, icon: Shield, color: "text-green-400" },
                    { label: "Medium Severity", value: stats.mediumSeverity, icon: Zap, color: "text-orange-400" },
                    { label: "Protected", value: `${((stats.blocked / stats.total) * 100).toFixed(0)}%`, icon: Lock, color: "text-purple-400" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="text-center space-y-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-center">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttackHeatmap data={threatData} />
            <ThreatRadarChart data={threatData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskScoreGauge data={threatData} />
            <NetworkSegmentChart data={threatData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeographicDistribution data={threatData} />
            <SeverityPieChart data={threatData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttackTypeBarChart data={threatData} />
            <ProtocolDistributionChart data={threatData} />
          </div>

          <ThreatTimelineChart data={threatData} />

          <Separator className="bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          {/* Main Content Area with Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                      <Filter className="h-5 w-5 text-purple-400" />
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
                          placeholder="Search by IP, user, location, attack type, or any field..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-purple-500/50 bg-slate-900/80 text-white placeholder-slate-500 focus-visible:ring-purple-500 focus-visible:border-purple-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
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
              </motion.div>

              {/* Threat Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Comprehensive Threat Detection Log
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Detailed analysis and tracking of all security events
                  </p>
                </div>
                <EnhancedThreatTable data={filteredData} />
              </motion.div>
            </div>

            {/* Activity Feed */}
            {showActivityFeed && (
              <div className="lg:col-span-1">
                <RealTimeActivityFeed data={threatData} />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="border-t border-purple-500/30 bg-slate-900/50 backdrop-blur-sm mt-12"
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-400">
                © 2025 CyberShield Threat Intelligence | Powered by Advanced AI Security Analytics
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  <motion.div 
                    className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  All Systems Operational
                </Badge>
                <span className="text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default UltimateDashboard;

