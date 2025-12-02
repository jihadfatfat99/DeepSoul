/**
 * Threat Analysis Workflow Component
 * Real-time workflow triggering and progress tracking with TanStack Query
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Activity,
  Clock,
  TrendingUp,
  Database,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { useTriggerAnalysis, useExecutionStatus } from '../hooks/useThreatAnalysis';
import toast from 'react-hot-toast';
import type { ThreatAnalysisWorkflowProps, WorkflowConfig, ThreatData } from '../types/threat-analysis';

const ThreatAnalysisWorkflow = ({ onComplete, onBack }: ThreatAnalysisWorkflowProps) => {
  const [config, setConfig] = useState<WorkflowConfig>({
    batch_size: 50,
    max_items: 200,
  });
  
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [, setFinalResults] = useState<ThreatData[] | null>(null); // Used for state management
  
  // Trigger mutation
  const { mutate: triggerWorkflow, isPending, error: triggerError } = useTriggerAnalysis();
  
  // Poll execution status - faster polling for real-time updates
  const { 
    data: executionStatus,
    dataUpdatedAt, // Track when data was last updated
  } = useExecutionStatus(currentExecutionId, {
    enabled: !!currentExecutionId,
    refetchInterval: 1000, // Poll every 1 second
  });

  // Send progressive data updates to parent component
  useEffect(() => {
    console.log('🎯 [COMPONENT] Execution status changed:', executionStatus);
    console.log('🕒 [COMPONENT] Data updated at:', new Date(dataUpdatedAt).toISOString());
    
    // If we have results and onComplete callback, send progressive updates
    if (executionStatus?.allResults && executionStatus.allResults.length > 0 && onComplete) {
      console.log(`📊 [COMPONENT] Progressive update: ${executionStatus.allResults.length} results available`);
      // Send current data to parent - this enables live updates
      onComplete(currentExecutionId!, executionStatus.allResults);
    }
    
    const fetchResults = async () => {
      if (executionStatus?.status === 'completed' && executionStatus?.finalSummary) {
        console.log('✅ [COMPONENT] Workflow completed! Final summary:', executionStatus.finalSummary);
        
        try {
          // Get all accumulated results from the execution
          const results = executionStatus.allResults || [];
          console.log('📊 [COMPONENT] Final results count:', results.length);
          console.log('📊 [COMPONENT] Final results sample:', results.slice(0, 3));
          setFinalResults(results);
          
          // Send final update
          if (onComplete) {
            console.log(`🚀 [COMPONENT] Sending final update with ${results.length} results`);
            onComplete(currentExecutionId!, results);
          }
        } catch (error) {
          console.error('❌ [COMPONENT] Error fetching results:', error);
          toast.error('Failed to fetch results');
        }
      }
    };

    fetchResults();
  }, [executionStatus?.status, executionStatus?.allResults?.length, currentExecutionId, onComplete, executionStatus?.finalSummary, executionStatus?.allResults, dataUpdatedAt]);

  // Handle workflow trigger
  const handleTrigger = () => {
    console.log('🎬 [COMPONENT] User clicked Start Analysis');
    console.log('⚙️ [COMPONENT] Config:', config);
    
    setStartTime(Date.now());
    
    triggerWorkflow(config, {
      onSuccess: (data) => {
        console.log('✅ [COMPONENT] Workflow started:', data);
        setCurrentExecutionId(data.execution_id);
        console.log('💾 [COMPONENT] Set execution ID:', data.execution_id);
        
        toast.success('Workflow started successfully!', {
          icon: '🚀',
          duration: 3000,
        });
      },
      onError: (error) => {
        console.error('❌ [COMPONENT] Workflow start failed:', error);
        toast.error(`Failed to start workflow: ${error.message}`, {
          icon: '❌',
          duration: 5000,
        });
      },
    });
  };

  const isProcessing = isPending || (!!currentExecutionId && executionStatus?.status !== 'completed');
  const isCompleted = executionStatus?.status === 'completed';
  // Use state to force re-renders for time-based updates
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second to keep elapsed time and progress updating - stop when completed
  useEffect(() => {
    if (!startTime || isCompleted) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Calculate estimated progress based on batches received and items processed
  const calculateProgress = (): number => {
    if (!executionStatus) return 0;
    
    if (executionStatus.status === 'completed') {
      return 100;
    }
    
    // Calculate based on actual results received vs expected
    const resultsReceived = executionStatus.allResults?.length || 0;
    const expectedTotal = config.max_items;
    const resultsProgress = (resultsReceived / expectedTotal) * 100;
    
    // Also consider batches received
    const expectedBatches = Math.ceil(config.max_items / config.batch_size);
    const batchProgress = ((executionStatus.batchesReceived || 0) / expectedBatches) * 100;
    
    // Use the maximum of the two for best accuracy
    const calculatedProgress = Math.max(resultsProgress, batchProgress);
    
    console.log('📊 [PROGRESS] Calculation:', {
      resultsReceived,
      expectedTotal,
      resultsProgress: resultsProgress.toFixed(1),
      batchesReceived: executionStatus.batchesReceived,
      expectedBatches,
      batchProgress: batchProgress.toFixed(1),
      finalProgress: calculatedProgress.toFixed(1)
    });
    
    // Cap at 99% until actually completed
    return Math.min(calculatedProgress, 99);
  };

  const progress = calculateProgress();
  

  // Format elapsed time - using currentTime state to force updates
  const formatElapsedTime = (): string => {
    if (!startTime) return '0:00';
    const elapsed = currentTime - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      {onBack && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Landing
          </Button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Zap className="w-8 h-8 text-primary" />
                  Threat Analysis Workflow
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  AI-powered cybersecurity threat detection with real-time progress tracking
                </CardDescription>
              </div>
              {executionStatus?.found && (
                <Badge variant={isCompleted ? "default" : "default"} className="text-sm px-3 py-1">
                  {isCompleted ? '✓ Completed' : '⚡ Processing'}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Batch Size</label>
                <Input
                  type="number"
                  value={config.batch_size}
                  onChange={(e) => setConfig({ ...config, batch_size: Number(e.target.value) })}
                  disabled={isProcessing}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max Items</label>
                <Input
                  type="number"
                  value={config.max_items}
                  onChange={(e) => setConfig({ ...config, max_items: Number(e.target.value) })}
                  disabled={isProcessing}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={handleTrigger}
              disabled={isProcessing}
              size="lg"
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Workflow...
                </>
              ) : isProcessing ? (
                <>
                  <Activity className="mr-2 h-5 w-5 animate-pulse" />
                  Analyzing Threats...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Section */}
      <AnimatePresence>
        {currentExecutionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Real-time Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar - Hide when completed */}
                {!isCompleted && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progress</span>
                      <span className="text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      Elapsed Time
                    </div>
                    <div className="text-2xl font-bold">{formatElapsedTime()}</div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Database className="w-4 h-4" />
                      Batches Received
                    </div>
                    <div className="text-2xl font-bold">
                      {executionStatus?.batchesReceived || 0}
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Activity className="w-4 h-4" />
                      Results Received
                    </div>
                    <div className="text-2xl font-bold">
                      {executionStatus?.allResults?.length || 0}
                      <span className="text-sm text-muted-foreground ml-1">/ {config.max_items}</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Zap className="w-4 h-4" />
                      Status
                    </div>
                    <div className="text-sm font-medium">
                      {isCompleted ? '✓ Completed' : '⚡ Processing'}
                    </div>
                  </div>
                </div>

                {/* Completion Alert */}
                {isCompleted && executionStatus?.finalSummary && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <AlertDescription className="ml-2">
                      <div className="font-medium mb-2">Analysis Complete!</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">True Positives:</span>
                          <span className="ml-2 font-bold text-green-600">
                            {executionStatus.finalSummary.true_positives}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">False Positives:</span>
                          <span className="ml-2 font-bold">
                            {executionStatus.finalSummary.false_positives}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Critical:</span>
                          <span className="ml-2 font-bold text-red-600">
                            {executionStatus.finalSummary.critical}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">High:</span>
                          <span className="ml-2 font-bold text-orange-600">
                            {executionStatus.finalSummary.high}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {triggerError && (
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertDescription className="ml-2">
                      {triggerError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThreatAnalysisWorkflow;

