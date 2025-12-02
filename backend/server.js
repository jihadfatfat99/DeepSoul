/**
 * n8n Callback Server - Clean HTTP Endpoint
 * 
 * This server receives batch progress updates from your n8n workflow
 * Use this callback URL in your n8n workflow: http://localhost:3001/callback
 */

const express = require('express');
const app = express();

// ============================================================
// CONFIGURATION
// ============================================================

const PORT = 3001;
const HOST = 'localhost';

// Middleware
app.use(express.json());

// CORS Configuration - Allow frontend to access backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Workflow-ID, X-Execution-ID');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Store execution data in memory
const executions = new Map();

// ============================================================
// CALLBACK URL - USE THIS IN YOUR n8n WORKFLOW
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('🚀 N8N CALLBACK SERVER');
console.log('='.repeat(70));
console.log('\n📡 CALLBACK URL (Use this in your n8n workflow):');
console.log('\n   ➜  http://localhost:3001/callback\n');
console.log('='.repeat(70) + '\n');

// ============================================================
// MAIN CALLBACK ENDPOINT
// ============================================================

app.post('/callback', (req, res) => {
  const data = req.body;
  
  console.log('\n' + '='.repeat(70));
  console.log('📨 RECEIVED UPDATE FROM N8N');
  console.log('='.repeat(70));
  
  // Extract key information
  const executionId = data.execution_id || 'unknown';
  const status = data.status || 'unknown';
  
  // Initialize execution tracking if needed
  if (!executions.has(executionId)) {
    executions.set(executionId, {
      startTime: new Date().toISOString(),
      batches: [],
      totalItems: 0
    });
    console.log(`🆕 New Execution: ${executionId}`);
  }
  
  // Handle different status types
  if (status === 'batch_completed') {
    const batchNumber = data.batch_number;
    const totalBatches = data.total_batches;
    const progress = data.progress_percent || 0;
    
    console.log(`\n📦 Batch ${batchNumber}/${totalBatches} Completed (${progress}%)`);
    console.log(`   Workflow ID: ${data.workflow_id}`);
    console.log(`   Execution ID: ${executionId}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    
    if (data.summary) {
      console.log(`\n   📊 Batch Summary:`);
      console.log(`      Total Items: ${data.summary.total_items || 0}`);
      console.log(`      True Positives: ${data.summary.true_positives || 0}`);
      console.log(`      False Positives: ${data.summary.false_positives || 0}`);
      console.log(`      Critical: ${data.summary.critical || 0}`);
      console.log(`      High: ${data.summary.high || 0}`);
      console.log(`      Medium: ${data.summary.medium || 0}`);
      console.log(`      Low: ${data.summary.low || 0}`);
    }
    
    // Store batch info INCLUDING the actual data
    const execution = executions.get(executionId);
    execution.batches.push({
      batchNumber,
      totalBatches,
      progress,
      summary: data.summary,
      batch_results: data.batch_results || [], // Store actual threat data
      timestamp: data.timestamp
    });
    
    // Also accumulate all results
    if (!execution.allResults) {
      execution.allResults = [];
    }
    if (data.batch_results && Array.isArray(data.batch_results)) {
      execution.allResults.push(...data.batch_results);
      console.log(`   💾 Stored ${data.batch_results.length} results (Total: ${execution.allResults.length})`);
    }
    
  } else if (status === 'completed') {
    console.log(`\n✅ WORKFLOW COMPLETED`);
    console.log(`   Execution ID: ${executionId}`);
    console.log(`   Total Items: ${data.total_items || 0}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    
    if (data.summary) {
      console.log(`\n   📊 Final Summary:`);
      console.log(`      True Positives: ${data.summary.true_positives || 0}`);
      console.log(`      False Positives: ${data.summary.false_positives || 0}`);
      console.log(`      Critical: ${data.summary.critical || 0}`);
      console.log(`      High: ${data.summary.high || 0}`);
    }
    
    const execution = executions.get(executionId);
    execution.completedTime = new Date().toISOString();
    execution.finalSummary = data.summary;
    
  } else {
    console.log(`\n❓ Status: ${status}`);
    console.log(`   Execution ID: ${executionId}`);
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }
  
  console.log('='.repeat(70) + '\n');
  
  // Send acknowledgment
  res.status(200).json({
    status: 'received',
    message: 'Callback processed successfully',
    execution_id: executionId,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'running',
    message: 'Callback server is ready',
    callback_url: `http://${HOST}:${PORT}/callback`,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// STATUS ENDPOINT - View execution history
// ============================================================

app.get('/status', (req, res) => {
  const executionList = Array.from(executions.entries()).map(([id, data]) => ({
    execution_id: id,
    start_time: data.startTime,
    completed_time: data.completedTime,
    batches_received: data.batches.length,
    final_summary: data.finalSummary,
    all_results: data.allResults || [], // Include full threat data
    total_results_count: (data.allResults || []).length
  }));
  
  res.status(200).json({
    total_executions: executions.size,
    executions: executionList,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, HOST, () => {
  console.log(`✅ Callback server is running on http://${HOST}:${PORT}`);
  console.log(`👂 Waiting for n8n workflow callbacks...\n`);
});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    status: 'error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down callback server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down callback server...');
  process.exit(0);
});
