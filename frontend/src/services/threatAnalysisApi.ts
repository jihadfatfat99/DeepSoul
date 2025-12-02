/**
 * Threat Analysis API Service
 * Handles communication with n8n webhook and callback server
 */

import type {
  WorkflowConfig,
  TriggerResponse,
  ExecutionStatus,
  AllExecutionsResponse,
  HealthCheckResponse,
} from '../types/threat-analysis';

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/analyze-threats';
const CALLBACK_SERVER_URL = 'http://localhost:3001';

/**
 * Trigger the n8n threat analysis workflow
 * @param config - Workflow configuration
 * @returns Workflow execution response
 */
export const triggerThreatAnalysis = async (
  config: WorkflowConfig
): Promise<TriggerResponse> => {
  console.log('🚀 [API] Triggering n8n workflow with config:', config);
  
  const requestBody = {
    csv_path: config.csv_path || '/data/cybersecurity_attacks.csv',
    callback_url: config.callback_url || `${CALLBACK_SERVER_URL}/callback`,
    batch_size: config.batch_size || 50,
    max_items: config.max_items || 200,
  };
  
  console.log('📤 [API] Request body:', requestBody);
  console.log('🔗 [API] Request URL:', N8N_WEBHOOK_URL);
  
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('📥 [API] Response status:', response.status, response.statusText);

  if (!response.ok) {
    console.error('❌ [API] Request failed:', response.status, response.statusText);
    throw new Error(`Failed to trigger workflow: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [API] Workflow triggered successfully:', data);
  
  return data;
};

/**
 * Get execution status from callback server
 * @param executionId - Execution ID to check
 * @returns Execution status
 */
export const getExecutionStatus = async (
  executionId: string
): Promise<ExecutionStatus> => {
  console.log('📊 [API] Fetching execution status for:', executionId);
  
  const response = await fetch(`${CALLBACK_SERVER_URL}/status`);
  
  if (!response.ok) {
    console.error('❌ [API] Failed to fetch status:', response.status);
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }

  const data: AllExecutionsResponse = await response.json();
  console.log('📥 [API] Received status data:', {
    total_executions: data.total_executions,
    executions_count: data.executions.length,
    timestamp: data.timestamp
  });
  
  // Find the specific execution
  const execution = data.executions.find(e => e.execution_id === executionId);
  
  if (!execution) {
    console.warn('⚠️ [API] Execution not found:', executionId);
    return {
      found: false,
      executionId,
      status: 'not_found',
      progress: 0,
    };
  }

  console.log('✅ [API] Found execution:', {
    execution_id: execution.execution_id,
    batches_received: execution.batches_received,
    results_count: execution.all_results?.length || 0,
    has_final_summary: !!execution.final_summary,
    completed: !!execution.completed_time
  });

  // Calculate progress
  const isCompleted = !!execution.completed_time;
  const progress = isCompleted ? 100 : 0;

  const result: ExecutionStatus = {
    found: true,
    executionId: execution.execution_id,
    startTime: execution.start_time,
    completedTime: execution.completed_time,
    batchesReceived: execution.batches_received,
    finalSummary: execution.final_summary,
    allResults: execution.all_results || [], // Include full threat data
    totalResultsCount: execution.total_results_count || 0,
    progress,
    status: isCompleted ? 'completed' : 'processing',
  };

  console.log('📤 [API] Returning execution status:');
  console.log(`   🆔 Execution ID: ${result.executionId}`);
  console.log(`   📊 Results count: ${result.allResults?.length || 0}`);
  console.log(`   📦 Batches received: ${result.batchesReceived}`);
  console.log(`   ✅ Status: ${result.status}`);
  console.log(`   🎯 Progress: ${result.progress}%`);
  
  if (result.allResults && result.allResults.length > 0) {
    console.log(`   📝 Sample result:`, result.allResults[0]);
  }
  
  return result;
};

/**
 * Get all executions from callback server
 * @returns All executions
 */
export const getAllExecutions = async (): Promise<AllExecutionsResponse> => {
  const response = await fetch(`${CALLBACK_SERVER_URL}/status`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch executions: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Health check for callback server
 * @returns Health status
 */
export const checkCallbackServerHealth = async (): Promise<HealthCheckResponse> => {
  const response = await fetch(`${CALLBACK_SERVER_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Callback server is not responding');
  }

  return response.json();
};

export default {
  triggerThreatAnalysis,
  getExecutionStatus,
  getAllExecutions,
  checkCallbackServerHealth,
};

