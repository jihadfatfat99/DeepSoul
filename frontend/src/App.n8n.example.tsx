import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import useN8nData from './hooks/useN8nData';
import { sampleThreatData } from './data/sampleData';
import './App.css';

/**
 * Example App component with n8n integration
 * 
 * To use this:
 * 1. Rename this file to App.jsx (backup the original first)
 * 2. Replace 'YOUR_N8N_WEBHOOK_URL' with your actual n8n webhook URL
 * 3. Adjust the refreshInterval as needed (in milliseconds)
 */

function App() {
  // Option 1: Use the custom hook for automatic polling
  const { 
    data: n8nData, 
    loading, 
    error, 
    refetch 
  } = useN8nData(
    '', // Add your n8n webhook URL here: 'https://your-n8n-instance.com/webhook/...'
    30000  // Refresh every 30 seconds
  );

  // Use n8n data if available, otherwise fall back to sample data
  const threatData = n8nData.length > 0 ? n8nData : sampleThreatData;

  // Option 2: Manual fetching (uncomment to use)
  /*
  const [threatData, setThreatData] = useState(sampleThreatData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFromN8n = async () => {
    setLoading(true);
    try {
      const response = await fetch('YOUR_N8N_WEBHOOK_URL');
      const data = await response.json();
      setThreatData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchFromN8n();
  }, []);
  */

  if (loading && threatData.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      {error && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-red-500/50 bg-red-500/20 backdrop-blur-sm p-4 max-w-md">
          <p className="text-red-400 font-semibold">Error loading data from n8n:</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 rounded border border-red-500/50 bg-red-500/30 px-3 py-1 text-sm text-red-300 hover:bg-red-500/40 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      <Dashboard threatData={threatData} />
    </div>
  );
}

export default App;

/* 
 * N8N SETUP GUIDE
 * ================
 * 
 * 1. Create a webhook node in n8n
 * 2. Configure it to return your threat data in JSON format
 * 3. Ensure CORS is enabled if n8n is on a different domain
 * 4. Format your data to match the expected structure (see README.md)
 * 
 * Example n8n workflow:
 * - Trigger: Webhook (GET/POST)
 * - Process: Your threat detection logic
 * - Transform: Format data to match the schema
 * - Response: Return JSON array of threats
 * 
 * Expected data format:
 * [
 *   {
 *     "Timestamp": "2023-01-01 12:00:00",
 *     "Source IP Address": "192.168.1.1",
 *     "Destination IP Address": "10.0.0.1",
 *     "Protocol": "TCP",
 *     "Attack Type": "DDoS",
 *     "Severity Level": "High",
 *     // ... other fields
 *   }
 * ]
 */

