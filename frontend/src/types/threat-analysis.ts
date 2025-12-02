/**
 * TypeScript Type Definitions for Threat Analysis
 */

// Threat Data Types
export interface ThreatData {
  'Timestamp': string;
  'Source IP Address': string;
  'Destination IP Address': string;
  'Source Port': string;
  'Destination Port': string;
  'Protocol': string;
  'Packet Length': string;
  'Packet Type': string;
  'Traffic Type': string;
  'Payload Data': string;
  'Malware Indicators': string;
  'Anomaly Scores': string;
  'Attack Type': string;
  'Attack Signature': string;
  'Action Taken': string;
  'Severity Level': string;
  'Log Source': string;
  'User Information': string;
  'Device Information': string;
  'Network Segment': string;
  'Geo-location Data': string;
  'Proxy Information': string;
  'Firewall Logs': string;
  
  // Enrichment fields
  abuse_confidence_score?: number;
  consensus_classification?: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'UNKNOWN';
  consensus_confidence?: number;
  enrichment_method?: 'API_ENRICHED' | 'LOCAL' | 'CACHED';
  escalation_priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  final_risk_score?: number;
  ip_reputation_score?: number;
  is_malicious?: boolean;
  vt_malicious?: number;
  
  // Batch metadata
  _batch_number?: number;
  _batch_total?: number;
  _global_index?: number;
  _is_private_ip?: boolean;
  _is_safe_ip?: boolean;
  _item_in_batch?: number;
  _needs_api_enrichment?: boolean;
  _pre_filter_risk_score?: number;
  _total_items?: number;
  _unique_id?: string;
}

// Workflow Configuration
export interface WorkflowConfig {
  csv_path?: string;
  callback_url?: string;
  batch_size: number;
  max_items: number;
}

// Trigger Response from n8n
export interface TriggerResponse {
  status: 'processing';
  execution_id: string;
  workflow_id: string;
  message: string;
  callback_url: string;
  timestamp: string;
  config: {
    batch_size: number;
    max_items: number;
    csv_path: string;
    total_items: number;
  };
}

// Summary Statistics
export interface ThreatSummary {
  total_items: number;
  true_positives: number;
  false_positives: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

// Execution Status from Callback Server
export interface ExecutionStatus {
  found: boolean;
  executionId: string;
  startTime?: string;
  completedTime?: string;
  batchesReceived?: number;
  finalSummary?: ThreatSummary;
  allResults?: ThreatData[];
  totalResultsCount?: number;
  progress: number;
  status: 'not_found' | 'processing' | 'completed';
}

// All Executions Response
export interface AllExecutionsResponse {
  total_executions: number;
  executions: Array<{
    execution_id: string;
    start_time: string;
    completed_time?: string;
    batches_received: number;
    final_summary?: ThreatSummary;
    all_results?: ThreatData[];
    total_results_count?: number;
  }>;
  timestamp: string;
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'running';
  message: string;
  callback_url: string;
  timestamp: string;
}

// Query Options
export interface QueryOptions {
  enabled?: boolean;
  refetchInterval?: number | ((data: any) => number | false);
}

// Component Props
export interface ThreatAnalysisWorkflowProps {
  onComplete?: (executionId: string, results: ThreatData[]) => void;
  onBack?: () => void;
}

