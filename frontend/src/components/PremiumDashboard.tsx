import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, Shield, TrendingUp, Search, Command, BarChart3, Globe2, Cpu, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PremiumTable from './PremiumTable';
import MinimalCharts from './MinimalCharts';
import MetricCard from './MetricCard';
import toast, { Toaster } from 'react-hot-toast';
import type { ThreatData } from '../types/threat-analysis';

interface PremiumDashboardProps {
  threatData: ThreatData[];
}

const PremiumDashboard = ({ threatData }: PremiumDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => {
      toast('System initialized', {
        icon: '✓',
        style: {
          borderRadius: '4px',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 20px',
          fontSize: '14px',
        },
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const total = threatData.length;
    const critical = threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'high').length;
    const blocked = threatData.filter((t: ThreatData) => t['Action Taken']?.toLowerCase() === 'blocked').length;
    const avgRisk = (threatData.reduce((sum: number, t: ThreatData) => sum + parseFloat(String(t.final_risk_score || 0)), 0) / total).toFixed(0);

    return {
      total,
      critical,
      blocked,
      avgRisk,
      blockRate: ((blocked / total) * 100).toFixed(0),
      criticalRate: ((critical / total) * 100).toFixed(0),
    };
  }, [threatData]);

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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'threats', label: 'Threats', icon: AlertCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'global', label: 'Global', icon: Globe2 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="bottom-right" />
      
      {/* Ultra-minimal header */}
      <header className="border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 bg-white/10 rounded-sm flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white/80" />
                </div>
                <span className="text-sm font-medium tracking-wide text-white/90">CYBERSHIELD</span>
              </motion.div>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedView(item.id)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200",
                      selectedView === item.id
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4 inline-block mr-2" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40 font-mono">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <div className="w-px h-4 bg-white/10" />
              <button className="text-xs text-white/60 hover:text-white/90 transition-colors">
                <Command className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Key Metrics - Ultra minimal */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Threats"
                  value={stats.total}
                  subtitle={`${stats.criticalRate}% critical`}
                  trend={+12}
                  icon={Activity}
                />
                <MetricCard
                  title="Critical Events"
                  value={stats.critical}
                  subtitle="Immediate action required"
                  trend={-8}
                  icon={AlertCircle}
                  variant="danger"
                />
                <MetricCard
                  title="Blocked Attacks"
                  value={stats.blocked}
                  subtitle={`${stats.blockRate}% block rate`}
                  trend={+5}
                  icon={Shield}
                  variant="success"
                />
                <MetricCard
                  title="Risk Score"
                  value={stats.avgRisk}
                  subtitle="Average threat level"
                  trend={0}
                  icon={TrendingUp}
                />
              </div>

              {/* Search Bar - Minimal */}
              <div className="flex items-center gap-4 py-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="text"
                    placeholder="Search threats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 focus:bg-white/10 focus:border-white/20 transition-all duration-200"
                  />
                </div>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white h-10 focus:bg-white/10 focus:border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">Critical</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-white/40">
                  {filteredData.length} results
                </div>
              </div>

              {/* Data Table - Premium minimal design */}
              <PremiumTable data={filteredData} />
            </motion.div>
          )}

          {selectedView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MinimalCharts data={threatData} />
            </motion.div>
          )}

          {selectedView === 'threats' && (
            <motion.div
              key="threats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light">Active Threats</h2>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                  {stats.critical} Critical
                </Badge>
              </div>
              <PremiumTable data={filteredData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'high')} />
            </motion.div>
          )}

          {selectedView === 'global' && (
            <motion.div
              key="global"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-light mb-8">Global Threat Map</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 rounded-sm p-8 border border-white/10">
                  <h3 className="text-lg font-medium mb-4">Top Origins</h3>
                  <div className="space-y-3">
                    {Object.entries(
                      threatData.reduce((acc: Record<string, number>, t: ThreatData) => {
                        const country = t['Geo-location Data']?.split(',').pop()?.trim() || 'Unknown';
                        acc[country] = (acc[country] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([country, count], idx) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-white/60">{idx + 1}. {country}</span>
                          <span className="font-mono text-sm">{count as number}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="bg-white/5 rounded-sm p-8 border border-white/10">
                  <h3 className="text-lg font-medium mb-4">Attack Types</h3>
                  <div className="space-y-3">
                    {Object.entries(
                      threatData.reduce((acc: Record<string, number>, t: ThreatData) => {
                        const type = t['Attack Type'] || 'Unknown';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-white/60">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-white/50 rounded-full"
                                style={{ width: `${((count as number) / threatData.length) * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-sm">{count as number}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ultra-minimal footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-black/80 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>System Status</span>
            <div className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Operational
            </span>
          </div>
          <div className="text-xs text-white/40">
            v2.0.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumDashboard;
