/**
 * Integrated Dashboard with Workflow Controls
 * Combines ThreatAnalysisWorkflow and EliteDashboard
 * Displays data progressively as it arrives
 */

import { useState, useMemo, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, AlertCircle, Shield, TrendingUp, Search, BarChart3, 
  Globe2, Cpu, Layers, Zap, Lock, ArrowLeft, Play, Loader2, CheckCircle2,
  Clock, Database
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import EliteTable from './EliteTable';
import EliteCharts from './EliteCharts';
import EliteMetricCard from './EliteMetricCard';
import AnimatedBackground from './AnimatedBackground';
import ThreatGlobeMap from './ThreatGlobeMap';
import toast, { Toaster } from 'react-hot-toast';
import { useTriggerAnalysis, useExecutionStatus } from '../hooks/useThreatAnalysis';
import type { ThreatData, WorkflowConfig } from '../types/threat-analysis';

const IntegratedDashboard = () => {
  const navigate = useNavigate();
  // Workflow state
  const [config, setConfig] = useState<WorkflowConfig>({
    batch_size: 50,
    max_items: 200,
  });
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [threatData, setThreatData] = useState<ThreatData[]>([]);

  // Dashboard state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');
  const [isLive, setIsLive] = useState(true);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(true);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [firstBatchReceived, setFirstBatchReceived] = useState(false);

  // Workflow hooks
  const { mutate: triggerWorkflow, isPending, error: triggerError } = useTriggerAnalysis();
  const { 
    data: executionStatus, 
    dataUpdatedAt,
    isLoading: isLoadingStatus,
    isFetching: isFetchingStatus
  } = useExecutionStatus(currentExecutionId, {
    enabled: !!currentExecutionId,
    refetchInterval: 1000,
  });

  const isProcessing = isPending || (!!currentExecutionId && executionStatus?.status !== 'completed');
  const isCompleted = executionStatus?.status === 'completed';
  
  // CRITICAL: Keep tab active to prevent browser throttling
  useEffect(() => {
    if (!isProcessing) return;
    
    console.log('🔄 [KEEP-ALIVE] Starting keep-alive mechanism');
    
    // Use requestAnimationFrame loop to keep tab active
    let animationFrameId: number;
    const keepAlive = () => {
      // This keeps the browser from throttling the tab
      animationFrameId = requestAnimationFrame(keepAlive);
    };
    keepAlive();
    
    return () => {
      console.log('🛑 [KEEP-ALIVE] Stopping keep-alive mechanism');
      cancelAnimationFrame(animationFrameId);
    };
  }, [isProcessing]);
  
  // Detect when tab becomes visible and force update
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && threatData.length > 0) {
        console.log('👁️ [VISIBILITY] Tab became visible, forcing update');
        setForceUpdateCounter(prev => prev + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [threatData.length]);
  
  // Log execution status updates
  useEffect(() => {
    console.log('📡 [INTEGRATED] Execution status update:', {
      executionId: currentExecutionId,
      status: executionStatus?.status,
      resultsCount: executionStatus?.allResults?.length || 0,
      batchesReceived: executionStatus?.batchesReceived || 0,
      isLoading: isLoadingStatus,
      isFetching: isFetchingStatus,
      dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
      documentHidden: document.hidden,
    });
  }, [executionStatus, currentExecutionId, isLoadingStatus, isFetchingStatus, dataUpdatedAt]);
  
  // Removed backup polling - primary polling is working fine

  // Update current time every second - stop when completed
  useEffect(() => {
    if (!startTime || isCompleted) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Update threat data - NUCLEAR OPTION: Update on every query change
  useEffect(() => {
    console.log('🔄 [INTEGRATED] executionStatus changed, dataUpdatedAt:', new Date(dataUpdatedAt).toISOString());
    
    if (executionStatus?.allResults && executionStatus.allResults.length > 0) {
      const newLength = executionStatus.allResults.length;
      
      setThreatData(prevData => {
        const currentLength = prevData.length;
        if (newLength !== currentLength) {
          console.log(`📊 [INTEGRATED] Data update: ${currentLength} -> ${newLength} results`);
          
          // ALWAYS use flushSync for immediate rendering
          flushSync(() => {
            if (!firstBatchReceived) {
              console.log('🚀 [INTEGRATED] FIRST BATCH - Setting flag');
              setFirstBatchReceived(true);
            }
            setForceUpdateCounter(prev => prev + 1);
          });
          
          // Force browser to repaint
          requestAnimationFrame(() => {
            console.log('🎨 [INTEGRATED] Forcing browser repaint');
            document.body.offsetHeight; // Force reflow
          });
          
          return executionStatus.allResults ? [...executionStatus.allResults] : prevData;
        }
        return prevData;
      });
    }
  }, [dataUpdatedAt, executionStatus?.allResults, firstBatchReceived]); // Depend on dataUpdatedAt to catch every update // Changed dependency to full array, not just length

  // Handle workflow trigger
  const handleTrigger = () => {
    console.log('🎬 [INTEGRATED] Starting workflow');
    setStartTime(Date.now());
    setThreatData([]); // Clear previous data
    setFirstBatchReceived(false); // Reset for new workflow
    setForceUpdateCounter(0); // Reset counter
    
    triggerWorkflow(config, {
      onSuccess: (data) => {
        console.log('✅ [INTEGRATED] Workflow started:', data);
        setCurrentExecutionId(data.execution_id);
        toast.success('Analysis started! Data will appear as it\'s processed.', {
          icon: '🚀',
          duration: 3000,
        });
      },
      onError: (error) => {
        console.error('❌ [INTEGRATED] Workflow failed:', error);
        toast.error(`Failed to start: ${error.message}`, {
          icon: '❌',
          duration: 5000,
        });
      },
    });
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (!executionStatus) return 0;
    if (executionStatus.status === 'completed') return 100;
    
    const resultsReceived = executionStatus.allResults?.length || 0;
    const expectedTotal = config.max_items;
    const resultsProgress = (resultsReceived / expectedTotal) * 100;
    
    const expectedBatches = Math.ceil(config.max_items / config.batch_size);
    const batchProgress = ((executionStatus.batchesReceived || 0) / expectedBatches) * 100;
    
    return Math.min(Math.max(resultsProgress, batchProgress), 99);
  };

  const formatElapsedTime = (): string => {
    if (!startTime) return '0:00';
    const elapsed = currentTime - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = calculateProgress();


  // Dashboard calculations - recalculate on every data change
  const stats = useMemo(() => {
    const total = threatData.length;
    const critical = threatData.filter((t: ThreatData) => t['Severity Level']?.toLowerCase() === 'high').length;
    const blocked = threatData.filter((t: ThreatData) => t['Action Taken']?.toLowerCase() === 'blocked').length;
    const avgRisk = total > 0 
      ? (threatData.reduce((sum: number, t: ThreatData) => sum + parseFloat(String(t.final_risk_score || 0)), 0) / total).toFixed(0)
      : '0';

    console.log('📈 [INTEGRATED] Stats calculated:', { total, critical, blocked });

    return {
      total,
      critical,
      blocked,
      avgRisk,
      blockRate: total > 0 ? ((blocked / total) * 100).toFixed(0) : '0',
      criticalRate: total > 0 ? ((critical / total) * 100).toFixed(0) : '0',
    };
  }, [threatData, forceUpdateCounter]); // Added forceUpdateCounter

  const filteredData = useMemo(() => {
    const filtered = threatData.filter((item: ThreatData) => {
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesSeverity = filterSeverity === 'all' || 
        item['Severity Level']?.toLowerCase() === filterSeverity;

      return matchesSearch && matchesSeverity;
    });
    
    console.log('🔍 [INTEGRATED] Filtered data:', filtered.length);
    return filtered;
  }, [threatData, searchTerm, filterSeverity, forceUpdateCounter]); // Added forceUpdateCounter

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'globe', label: '3D Globe', icon: Globe2 },
    { id: 'threats', label: 'Threats', icon: AlertCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'global', label: 'Global Intel', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      <Toaster position="bottom-right" />
      
      {/* Animated background */}
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-12">
                <div className="flex items-center gap-4 sm:gap-6">
                  <motion.button
                    onClick={() => navigate('/')}
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
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Workflow Control Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-purple-500/20 bg-[#0f0f14]/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Zap className="w-6 h-6 text-purple-400" />
                    Threat Analysis Workflow
                    {isProcessing && (
                      <Badge variant="default" className="text-sm px-3 py-1 bg-purple-500/20">
                        ⚡ Processing
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="default" className="text-sm px-3 py-1 bg-green-500/20">
                        ✓ Completed
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWorkflowPanel(!showWorkflowPanel)}
                  >
                    {showWorkflowPanel ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {showWorkflowPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-4">
                      {/* Configuration */}
                      {!currentExecutionId && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block text-white/70">Batch Size</label>
                            <Input
                              type="number"
                              value={config.batch_size}
                              onChange={(e) => setConfig({ ...config, batch_size: Number(e.target.value) })}
                              disabled={isProcessing}
                              className="bg-black/50 border-purple-500/20"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block text-white/70">Max Items</label>
                            <Input
                              type="number"
                              value={config.max_items}
                              onChange={(e) => setConfig({ ...config, max_items: Number(e.target.value) })}
                              disabled={isProcessing}
                              className="bg-black/50 border-purple-500/20"
                            />
                          </div>
                        </div>
                      )}

                      {/* Progress Bar - Hide when completed */}
                      {currentExecutionId && (
                        <div className="space-y-4">
                          {!isCompleted && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-white/70">Progress</span>
                                <span className="text-purple-400">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-3" />
                            </div>
                          )}

                          {/* Live Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
                              <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                                <Clock className="w-3 h-3" />
                                Time
                              </div>
                              <div className="text-lg font-bold text-white">{formatElapsedTime()}</div>
                            </div>

                            <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
                              <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                                <Database className="w-3 h-3" />
                                Batches
                              </div>
                              <div className="text-lg font-bold text-white">
                                {executionStatus?.batchesReceived || 0}
                              </div>
                            </div>

                            <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
                              <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                                <Activity className="w-3 h-3" />
                                Results
                              </div>
                              <div className="text-lg font-bold text-white">
                                {threatData.length}
                                <span className="text-xs text-white/50 ml-1">/ {config.max_items}</span>
                              </div>
                            </div>

                            <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
                              <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                                <Zap className="w-3 h-3" />
                                Status
                              </div>
                              <div className="text-sm font-medium text-white">
                                {isCompleted ? '✓ Done' : '⚡ Live'}
                              </div>
                            </div>
                          </div>

                          {/* Completion Summary */}
                          {isCompleted && executionStatus?.finalSummary && (
                            <Alert className="border-green-500/50 bg-green-500/10">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <AlertDescription className="ml-2">
                                <div className="font-medium mb-2">Analysis Complete!</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-white/60">True Positives:</span>
                                    <span className="ml-2 font-bold text-green-400">
                                      {executionStatus.finalSummary.true_positives}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-white/60">Critical:</span>
                                    <span className="ml-2 font-bold text-red-400">
                                      {executionStatus.finalSummary.critical}
                                    </span>
                                  </div>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Error Alert */}
                          {triggerError && (
                            <Alert variant="destructive">
                              <AlertDescription>
                                {triggerError.message}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      {/* Start Button */}
                      {!currentExecutionId && (
                        <Button
                          onClick={handleTrigger}
                          disabled={isProcessing}
                          size="lg"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-5 w-5" />
                              Start Analysis
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Dashboard Content - Disable animations until first batch received */}
          {threatData.length > 0 && (
            <div>
              {selectedView === 'overview' && (
                <div className="space-y-8">
                  {/* Elite Metrics - Aggressive keys ONLY before first batch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <EliteMetricCard
                      key={!firstBatchReceived ? `metric-total-${forceUpdateCounter}` : 'metric-total'}
                      title="Total Threats"
                      value={stats.total}
                      subtitle={`${stats.criticalRate}% critical`}
                      trend={+12}
                      icon={Activity}
                      glowColor="purple"
                    />
                    <EliteMetricCard
                      key={!firstBatchReceived ? `metric-critical-${forceUpdateCounter}` : 'metric-critical'}
                      title="Critical Events"
                      value={stats.critical}
                      subtitle="Immediate action"
                      trend={-8}
                      icon={AlertCircle}
                      variant="danger"
                      glowColor="red"
                    />
                    <EliteMetricCard
                      key={!firstBatchReceived ? `metric-blocked-${forceUpdateCounter}` : 'metric-blocked'}
                      title="Blocked Attacks"
                      value={stats.blocked}
                      subtitle={`${stats.blockRate}% block rate`}
                      trend={+5}
                      icon={Shield}
                      variant="success"
                      glowColor="green"
                    />
                    <EliteMetricCard
                      key={!firstBatchReceived ? `metric-risk-${forceUpdateCounter}` : 'metric-risk'}
                      title="Risk Score"
                      value={stats.avgRisk}
                      subtitle="Average threat level"
                      trend={0}
                      icon={TrendingUp}
                      glowColor="yellow"
                    />
                  </div>

                  {/* Search & Filter */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6 bg-[#0f0f14]/50 border border-purple-500/10 rounded-lg backdrop-blur-sm">
                    <div className="relative flex-1 max-w-full sm:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                      <Input
                        type="text"
                        placeholder="Search threats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 bg-black/50 border-purple-500/20 text-white placeholder:text-white/30"
                      />
                    </div>
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="w-full sm:w-32 bg-black/50 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f0f14] border-purple-500/30">
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="high">Critical</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400/50" />
                      <span className="text-sm text-purple-300/70">
                        {filteredData.length} active threats
                      </span>
                      {isProcessing && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs">
                          <Activity className="w-3 h-3 mr-1 animate-pulse" />
                          Live
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Elite Data Table */}
                  <EliteTable 
                    key={`table-${forceUpdateCounter}`}
                    data={filteredData} 
                  />
                </div>
              )}

              {selectedView === 'globe' && (
                <div>
                  <ThreatGlobeMap threatData={threatData} />
                </div>
              )}

              {selectedView === 'analytics' && (
                <div>
                  <EliteCharts 
                    key={`charts-${forceUpdateCounter}`}
                    data={threatData} 
                  />
                </div>
              )}

              {selectedView === 'threats' && (
                <div className="space-y-6">
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
                  <EliteTable 
                    key={`threats-table-${forceUpdateCounter}`}
                    data={filteredData.filter(t => t['Severity Level']?.toLowerCase() === 'high')} 
                  />
                </div>
              )}

              {selectedView === 'global' && (
                <div className="space-y-6">
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
                          .map(([country, count]) => (
                            <div key={country} className="flex items-center justify-between">
                              <span className="text-white/80">{country}</span>
                              <span className="text-purple-300">{count as number}</span>
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
                          .slice(0, 5)
                          .map(([type, count]) => {
                            const percentage = (((count as number) / threatData.length) * 100).toFixed(1);
                            return (
                              <div key={type} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/80">{type}</span>
                                  <span className="text-purple-300">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State - Show while processing but no data yet */}
          {isProcessing && threatData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Loader2 className="w-20 h-20 mx-auto text-purple-400 mb-4 animate-spin" />
              <h3 className="text-2xl font-light text-white/60 mb-2">Analyzing threats...</h3>
              <p className="text-white/40">First batch will appear shortly</p>
              <div className="mt-4 text-sm text-white/30">
                Waiting for data from workflow...
              </div>
            </motion.div>
          )}

          {/* Empty State - Only show when not processing */}
          {threatData.length === 0 && !isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Shield className="w-20 h-20 mx-auto text-purple-400/30 mb-4" />
              <h3 className="text-2xl font-light text-white/60 mb-2">No threat data yet</h3>
              <p className="text-white/40">Start an analysis to see results here</p>
            </motion.div>
          )}
        </main>

        {/* Footer */}
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
              v3.0.0-integrated
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default IntegratedDashboard;

