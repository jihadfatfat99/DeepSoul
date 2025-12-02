import { useState, useEffect } from 'react';

interface UseN8nDataReturn<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch data from n8n webhook
 * @param webhookUrl - Your n8n webhook URL
 * @param refreshInterval - Refresh interval in milliseconds (default: 30000)
 * @returns { data, loading, error, refetch }
 */
export const useN8nData = <T = any>(
  webhookUrl: string,
  refreshInterval: number = 30000
): UseN8nDataReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    if (!webhookUrl) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(webhookUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data from n8n:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up polling if refresh interval is provided
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [webhookUrl, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

export default useN8nData;

