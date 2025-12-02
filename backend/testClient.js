/**
 * WebSocket Test Client
 *
 * Simple client to test the WebSocket threat analysis server
 * Run this to verify the server is working correctly
 */

const WebSocket = require('ws');

// ============================================================
// CONFIGURATION
// ============================================================

const WEBSOCKET_URL = 'ws://localhost:3000';

// ============================================================
// STATISTICS
// ============================================================

const stats = {
  totalMessages: 0,
  threatItems: 0,
  batchesCompleted: 0,
  truePositives: 0,
  falsePositives: 0,
  startTime: null,
  endTime: null
};

// ============================================================
// CONNECT TO WEBSOCKET SERVER
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('🧪 WEBSOCKET TEST CLIENT');
console.log('='.repeat(70));
console.log(`\n🔗 Connecting to: ${WEBSOCKET_URL}\n`);

const ws = new WebSocket(WEBSOCKET_URL);

// ============================================================
// HANDLE CONNECTION EVENTS
// ============================================================

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server!');
  console.log('👂 Listening for messages...\n');
  console.log('='.repeat(70) + '\n');
  stats.startTime = Date.now();
});

ws.on('message', (data) => {
  stats.totalMessages++;

  try {
    const message = JSON.parse(data);

    // Handle different message types
    switch (message.type) {
      case 'connection':
        handleConnection(message);
        break;

      case 'batch_start':
        handleBatchStart(message);
        break;

      case 'threat_item':
        handleThreatItem(message);
        break;

      case 'batch_completed':
        handleBatchCompleted(message);
        break;

      case 'execution_completed':
        handleExecutionCompleted(message);
        break;

      default:
        console.log(`📨 Unknown message type: ${message.type}`);
    }

  } catch (error) {
    console.error('❌ Error parsing message:', error.message);
  }
});

ws.on('error', (error) => {
  console.error('\n❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('\n👋 Connection closed');
  printFinalStats();
});

// ============================================================
// MESSAGE HANDLERS
// ============================================================

function handleConnection(message) {
  console.log('🎉 CONNECTION ESTABLISHED');
  console.log('─'.repeat(70));
  console.log(`   Execution ID: ${message.execution_id}`);
  console.log(`   Total Items: ${message.config.total_items}`);
  console.log(`   Batch Size: ${message.config.batch_size}`);
  console.log(`   Total Batches: ${message.config.total_batches}`);
  console.log('─'.repeat(70) + '\n');
}

function handleBatchStart(message) {
  console.log(`\n📦 BATCH ${message.batch_number}/${message.total_batches} STARTED`);
  console.log(`   Items in batch: ${message.items_in_batch}`);
  console.log(`   Progress: ${message.progress_percent}%`);
}

function handleThreatItem(message) {
  stats.threatItems++;
  const threat = message.data;

  // Count classifications
  if (threat.consensus_classification === 'True Positive') {
    stats.truePositives++;
  } else if (threat.consensus_classification === 'False Positive') {
    stats.falsePositives++;
  }

  // Print compact threat info
  const severity = threat['Severity Level'];
  const severityIcon = getSeverityIcon(severity);
  const classification = threat.consensus_classification;
  const classIcon = classification === 'True Positive' ? '🔴' : '🟡';

  console.log(`   ${severityIcon} ${classIcon} [${message.item_number}/${message.total_items_in_batch}] ${threat['Attack Type'].padEnd(18)} | ${threat['Source IP Address'].padEnd(15)} → ${threat['Destination IP Address'].padEnd(15)} | Risk: ${threat.final_risk_score.toString().padStart(3)} | ${classification}`);
}

function handleBatchCompleted(message) {
  stats.batchesCompleted++;
  const summary = message.summary;

  console.log(`\n   ✅ Batch ${message.batch_number} COMPLETED`);
  console.log(`   ─────────────────────────────────────────────────────────────────`);
  console.log(`   📊 Summary:`);
  console.log(`      Total Items: ${summary.total_items}`);
  console.log(`      True Positives: ${summary.true_positives} | False Positives: ${summary.false_positives}`);
  console.log(`      Suspicious: ${summary.suspicious} | Benign: ${summary.benign}`);
  console.log(`      High Severity: ${summary.high_severity_count}`);
  console.log(`      Avg Risk Score: ${summary.average_risk_score}`);
  console.log(`   ─────────────────────────────────────────────────────────────────`);
  console.log(`   Overall Progress: ${message.progress_percent}% [${'█'.repeat(message.progress_percent / 5)}${' '.repeat(20 - message.progress_percent / 5)}]`);
}

function handleExecutionCompleted(message) {
  stats.endTime = Date.now();

  console.log('\n' + '='.repeat(70));
  console.log('🎉 EXECUTION COMPLETED!');
  console.log('='.repeat(70));
  console.log(`   Status: ${message.status}`);
  console.log(`   Total Items: ${message.total_items_sent}`);
  console.log(`   Total Batches: ${message.total_batches}`);
  console.log(`   Message: ${message.message}`);
  console.log('='.repeat(70) + '\n');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getSeverityIcon(severity) {
  switch (severity) {
    case 'Critical': return '🔥';
    case 'High': return '⚠️';
    case 'Medium': return '⚡';
    case 'Low': return 'ℹ️';
    default: return '📋';
  }
}

function printFinalStats() {
  const duration = stats.endTime ? (stats.endTime - stats.startTime) / 1000 : 0;

  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL STATISTICS');
  console.log('='.repeat(70));
  console.log(`   Total Messages Received: ${stats.totalMessages}`);
  console.log(`   Threat Items Processed: ${stats.threatItems}`);
  console.log(`   Batches Completed: ${stats.batchesCompleted}`);
  console.log(`   True Positives: ${stats.truePositives}`);
  console.log(`   False Positives: ${stats.falsePositives}`);
  if (stats.endTime) {
    console.log(`   Duration: ${duration.toFixed(2)} seconds`);
    console.log(`   Throughput: ${(stats.threatItems / duration).toFixed(2)} items/second`);
  }
  console.log('='.repeat(70) + '\n');
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down test client...');
  ws.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down test client...');
  ws.close();
  process.exit(0);
});
