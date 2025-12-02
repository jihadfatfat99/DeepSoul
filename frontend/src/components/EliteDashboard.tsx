import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, Shield, TrendingUp, Search, Command, BarChart3, Globe2, Cpu, Layers, Zap, Lock, ArrowLeft } from 'lucide-react';
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
import EliteTable from './EliteTable';
import EliteCharts from './EliteCharts';
import EliteMetricCard from './EliteMetricCard';
import AnimatedBackground from './AnimatedBackground';
import toast, { Toaster } from 'react-hot-toast';
import type { ThreatData } from '../types/threat-analysis';

interface EliteDashboardProps {
  threatData: ThreatData[];
  executionId: string | null;
  onBackToLanding: () => void;
  onBackToWorkflow: () => void;
}

const EliteDashboard = ({ threatData, executionId: _executionId, onBackToLanding, onBackToWorkflow: _onBackToWorkflow }: EliteDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      toast('DeepSoul Neural Defense System Activated', {
        icon: '🛡️',
        style: {
          borderRadius: '4px',
          background: 'rgba(15, 15, 20, 0.95)',
          color: '#fff',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          backdropFilter: 'blur(10px)',
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
    { id: 'global', label: 'Global Intel', icon: Globe2 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      <Toaster position="bottom-right" />
      
      {/* Animated background */}
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Premium header with subtle neon */}
        <header className="border-b border-purple-500/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-12">
                <div className="flex items-center gap-4 sm:gap-6">
                  {onBackToLanding && (
                    <motion.button
                      onClick={onBackToLanding}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm">Back</span>
                    </motion.button>
                  )}
                  
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                        <Cpu className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="absolute inset-0 w-10 h-10 bg-purple-600/20 rounded-lg blur-xl" />
                    </div>
                    <div>
                      <span className="text-sm font-medium tracking-wider text-white/90 uppercase">DeepSoul</span>
                      <div className="text-[10px] text-purple-400/60 uppercase tracking-widest">Neural Defense</div>
                    </div>
                  </motion.div>
                </div>

                <nav className="hidden lg:flex items-center gap-1">
                  {navItems.map((item, idx) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedView(item.id)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded transition-all duration-300 relative overflow-hidden",
                        selectedView === item.id
                          ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-lg shadow-purple-500/20"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <span className="relative z-10 flex items-center">
                        <item.icon className="w-4 h-4 inline-block mr-2" />
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </nav>
              </div>

                <div className="flex items-center gap-4">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded cursor-pointer"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLive(!isLive)}
                >
                  <div className="relative">
                    <motion.div 
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isLive ? "bg-green-400" : "bg-gray-400"
                      )}
                      animate={isLive ? {
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {isLive && (
                      <div className="w-2 h-2 rounded-full bg-green-400 absolute inset-0 animate-ping" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-white/70">
                    {isLive ? 'LIVE' : 'PAUSED'}
                  </span>
                </motion.div>
                <span className="text-xs text-white/40 font-mono">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
                <div className="w-px h-4 bg-purple-500/20" />
                <motion.button 
                  className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors p-2 rounded hover:bg-purple-500/10"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Command className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                {/* Elite Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <EliteMetricCard
                    title="Total Threats"
                    value={stats.total}
                    subtitle={`${stats.criticalRate}% critical`}
                    trend={+12}
                    icon={Activity}
                    glowColor="purple"
                  />
                  <EliteMetricCard
                    title="Critical Events"
                    value={stats.critical}
                    subtitle="Immediate action"
                    trend={-8}
                    icon={AlertCircle}
                    variant="danger"
                    glowColor="red"
                  />
                  <EliteMetricCard
                    title="Blocked Attacks"
                    value={stats.blocked}
                    subtitle={`${stats.blockRate}% block rate`}
                    trend={+5}
                    icon={Shield}
                    variant="success"
                    glowColor="green"
                  />
                  <EliteMetricCard
                    title="Risk Score"
                    value={stats.avgRisk}
                    subtitle="Average threat level"
                    trend={0}
                    icon={TrendingUp}
                    glowColor="yellow"
                  />
                </div>

                {/* Search Bar - Professional with neon accent */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6 bg-[#0f0f14]/50 border border-purple-500/10 rounded-lg backdrop-blur-sm">
                  <div className="relative flex-1 max-w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                    <Input
                      type="text"
                      placeholder="Search threats by IP, location, or attack type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 bg-black/50 border-purple-500/20 text-white placeholder:text-white/30 h-10 focus:bg-black/70 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                    />
                  </div>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-full sm:w-32 bg-black/50 border-purple-500/20 text-white h-10 hover:bg-purple-500/10 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f14] border-purple-500/30 backdrop-blur-xl shadow-xl shadow-purple-500/20">
                      <SelectItem value="all" className="text-white/80 focus:bg-purple-500/20 focus:text-white cursor-pointer transition-colors">All Levels</SelectItem>
                      <SelectItem value="high" className="text-white/80 focus:bg-purple-500/20 focus:text-white cursor-pointer transition-colors">Critical</SelectItem>
                      <SelectItem value="medium" className="text-white/80 focus:bg-purple-500/20 focus:text-white cursor-pointer transition-colors">Medium</SelectItem>
                      <SelectItem value="low" className="text-white/80 focus:bg-purple-500/20 focus:text-white cursor-pointer transition-colors">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400/50" />
                    <span className="text-sm text-purple-300/70">
                      {filteredData.length} active threats
                    </span>
                  </div>
                </div>

                {/* Elite Data Table */}
                <EliteTable data={filteredData} />
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
                <EliteCharts data={threatData} />
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
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-light bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                      Critical Threats
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Real-time threat monitoring</p>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 px-4 py-2">
                    <Lock className="w-4 h-4 mr-2" />
                    {stats.critical} Active
                  </Badge>
                </div>
                <EliteTable data={filteredData.filter(t => t['Severity Level']?.toLowerCase() === 'high')} />
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
                <h2 className="text-3xl font-light mb-8 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Global Threat Intelligence
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  <motion.div 
                    className="bg-[#0f0f14]/50 rounded-lg p-8 border border-purple-500/10 backdrop-blur-sm"
                    whileHover={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-medium mb-6 text-purple-300">Top Attack Origins</h3>
                    <div className="space-y-4">
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
                          <div key={country} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <span className="text-purple-400/60 font-mono text-sm w-6">{idx + 1}.</span>
                              <span className="text-white/80 group-hover:text-purple-300 transition-colors">{country}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${((count as number) / threatData.length) * 100}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                />
                              </div>
                              <span className="font-mono text-sm text-purple-300 w-12 text-right">{count as number}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-[#0f0f14]/50 rounded-lg p-8 border border-purple-500/10 backdrop-blur-sm"
                    whileHover={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-medium mb-6 text-purple-300">Attack Patterns</h3>
                    <div className="space-y-4">
                      {Object.entries(
                        threatData.reduce((acc: Record<string, number>, t: ThreatData) => {
                          const type = t['Attack Type'] || 'Unknown';
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {})
                      )
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([type, count], idx) => {
                          const percentage = (((count as number) / threatData.length) * 100).toFixed(1);
                          return (
                            <div key={type} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white/80">{type}</span>
                                <span className="text-purple-300 font-mono text-sm">{percentage}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    background: `linear-gradient(to right, ${
                                      type === 'DDoS' ? '#ef4444' :
                                      type === 'Malware' ? '#eab308' :
                                      type === 'Intrusion' ? '#a855f7' : '#6b7280'
                                    }, ${
                                      type === 'DDoS' ? '#dc2626' :
                                      type === 'Malware' ? '#f59e0b' :
                                      type === 'Intrusion' ? '#9333ea' : '#4b5563'
                                    })`
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                />
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Elite footer */}
        <footer className="fixed bottom-0 left-0 right-0 border-t border-purple-500/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="uppercase tracking-wider">System Status</span>
              <div className="w-px h-3 bg-purple-500/20" />
              <span className="flex items-center gap-2">
                <span className="relative">
                  <span className="w-2 h-2 bg-green-400 rounded-full block" />
                  <span className="w-2 h-2 bg-green-400 rounded-full absolute inset-0 animate-ping" />
                </span>
                <span className="text-green-400">All Systems Operational</span>
              </span>
            </div>
            <div className="text-xs text-purple-400/40 font-mono">
              v3.0.0-elite
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EliteDashboard;
