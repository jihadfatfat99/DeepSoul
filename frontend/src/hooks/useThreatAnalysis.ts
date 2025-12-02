/**
 * TanStack Query hooks for Threat Analysis
 * Handles workflow triggering, progress polling, and caching
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import {
  triggerThreatAnalysis,
  getExecutionStatus,
  getAllExecutions,
  checkCallbackServerHealth,
} from '../services/threatAnalysisApi';
import type {
  WorkflowConfig,
  TriggerResponse,
  ExecutionStatus,
  AllExecutionsResponse,
  HealthCheckResponse,
  QueryOptions,
} from '../types/threat-analysis';

/**
 * Mutation hook to trigger threat analysis workflow
 * @returns Mutation object with trigger function and status
 */
export const useTriggerAnalysis = (): UseMutationResult<TriggerResponse, Error, WorkflowConfig> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerThreatAnalysis,
    onSuccess: (data) => {
      console.log('✅ [HOOK] Workflow triggered successfully:', data);
      
      // Invalidate and refetch executions list
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      
      // Start polling for this execution
      const initialData: ExecutionStatus = {
        found: true,
        executionId: data.execution_id,
        status: 'processing',
        progress: 0,
      };
      
      console.log('💾 [HOOK] Setting initial query data:', initialData);
      queryClient.setQueryData(['execution', data.execution_id], initialData);
    },
    onError: (error) => {
      console.error('❌ [HOOK] Workflow trigger failed:', error);
    },
    // Cache successful triggers for 5 minutes
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Query hook to poll execution status with automatic refetching
 * @param executionId - Execution ID to monitor
 * @param options - Query options
 * @returns Query object with execution status
 */
export const useExecutionStatus = (
  executionId: string | null,
  options: QueryOptions = {}
): UseQueryResult<ExecutionStatus, Error> => {
  const {
    enabled = true,
    refetchInterval = 1000, // Poll every 1 second for faster updates
  } = options;

  console.log('🔄 [HOOK] useExecutionStatus called with:', { executionId, enabled });

  return useQuery({
    queryKey: ['execution', executionId],
    queryFn: () => {
      console.log('🔍 [HOOK] Fetching execution status...');
      return getExecutionStatus(executionId!);
    },
    enabled: enabled && !!executionId,
    
    // Keep polling until completed - ALWAYS return the interval to keep updating
    refetchInterval: (query) => {
      const data = query.state.data;
      console.log('⏱️ [HOOK] Refetch interval check:', {
        hasData: !!data,
        status: data?.status,
        found: data?.found,
        batchesReceived: data?.batchesReceived,
        resultsCount: data?.allResults?.length || 0,
        willContinuePolling: data && data.status !== 'completed' && data.found
      });
      
      // Stop polling if completed or not found
      if (!data || data.status === 'completed' || !data.found) {
        console.log('⏹️ [HOOK] Stopping polling');
        return false;
      }
      console.log(`🔄 [HOOK] Continuing to poll every ${refetchInterval}ms`);
      return typeof refetchInterval === 'function' ? refetchInterval(data) : refetchInterval;
    },
    
    // Force fresh data on every fetch - no caching while processing
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    // Never consider data stale while processing
    staleTime: 0, // Always consider stale to force updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    
    // Retry failed requests
    retry: 3,
    retryDelay: 1000,
    
    // CRITICAL: Force component re-render on every data change
    notifyOnChangeProps: 'all', // Notify on all prop changes
    
    // Structural sharing disabled to ensure new data triggers re-renders
    structuralSharing: false,
  });
};

/**
 * Query hook to get all executions
 * @param options - Query options
 * @returns Query object with all executions
 */
export const useAllExecutions = (
  options = {}
): UseQueryResult<AllExecutionsResponse, Error> => {
  return useQuery({
    queryKey: ['executions'],
    queryFn: getAllExecutions,
    
    // Refetch every 10 seconds
    refetchInterval: 10000,
    
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    
    ...options,
  });
};

/**
 * Query hook to check callback server health
 * @returns Query object with health status
 */
export const useCallbackServerHealth = (): UseQueryResult<HealthCheckResponse, Error> => {
  return useQuery({
    queryKey: ['callback-health'],
    queryFn: checkCallbackServerHealth,
    
    // Check every 30 seconds
    refetchInterval: 30000,
    
    // Cache for 1 minute
    staleTime: 60 * 1000,
    
    // Retry on failure
    retry: 2,
  });
};

/**
 * Combined hook for complete workflow management
 * @returns All hooks and utilities
 */
export const useThreatAnalysisWorkflow = () => {
  const triggerMutation = useTriggerAnalysis();
  const executionsQuery = useAllExecutions();
  const healthQuery = useCallbackServerHealth();

  return {
    // Trigger workflow
    trigger: triggerMutation.mutate,
    isTriggering: triggerMutation.isPending,
    triggerError: triggerMutation.error,
    triggerData: triggerMutation.data,
    
    // All executions
    executions: executionsQuery.data?.executions || [],
    isLoadingExecutions: executionsQuery.isLoading,
    executionsError: executionsQuery.error,
    
    // Server health
    isServerHealthy: healthQuery.data?.status === 'running',
    serverHealth: healthQuery.data,
    
    // Utilities
    reset: triggerMutation.reset,
  };
};

