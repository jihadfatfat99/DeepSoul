import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ThreatData } from '../types/threat-analysis';

interface ThreatTableProps {
  data: ThreatData[];
}

const ThreatTable = ({ data }: ThreatTableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSeverityColor = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getRiskLevelColor = (riskLevel: string | undefined) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  // Sort data
  let sortedData = [...data];
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const aVal = (a as any)[sortColumn] || '';
      const bVal = (b as any)[sortColumn] || '';
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="inline h-4 w-4" />
    ) : (
      <ChevronDown className="inline h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-purple-500/30 bg-purple-500/10">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold text-purple-300 hover:text-purple-200"
                onClick={() => handleSort('Timestamp')}
              >
                Timestamp <SortIcon column="Timestamp" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold text-purple-300 hover:text-purple-200"
                onClick={() => handleSort('Source IP Address')}
              >
                Source IP <SortIcon column="Source IP Address" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold text-purple-300 hover:text-purple-200"
                onClick={() => handleSort('Destination IP Address')}
              >
                Dest IP <SortIcon column="Destination IP Address" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold text-purple-300 hover:text-purple-200"
                onClick={() => handleSort('Protocol')}
              >
                Protocol <SortIcon column="Protocol" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold text-purple-300 hover:text-purple-200"
                onClick={() => handleSort('Attack Type')}
              >
                Attack Type <SortIcon column="Attack Type" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold text-purple-300 hover:text-purple-200"
                onClick={() => handleSort('Severity Level')}
              >
                Severity <SortIcon column="Severity Level" />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-purple-300">
                Risk Level
              </th>
              <th className="px-4 py-3 text-left font-semibold text-purple-300">
                Location
              </th>
              <th className="px-4 py-3 text-left font-semibold text-purple-300">
                Action
              </th>
              <th className="px-4 py-3 text-left font-semibold text-purple-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/20">
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="group hover:bg-purple-500/5 transition-colors"
              >
                <td className="px-4 py-3 text-slate-300">{row.Timestamp}</td>
                <td className="px-4 py-3 font-mono text-sm text-cyan-400">
                  {row['Source IP Address']}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-cyan-400">
                  {row['Destination IP Address']}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-blue-500/50 bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                    {row.Protocol}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{row['Attack Type']}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-1 text-xs font-semibold',
                      getSeverityColor(row['Severity Level'])
                    )}
                  >
                    {row['Severity Level']}
                  </span>
                </td>
                <td className={cn('px-4 py-3 font-semibold', getRiskLevelColor((row as any).consensus_risk_level || (row as any).chatgpt_risk_level))}>
                  {(row as any).consensus_risk_level || (row as any).chatgpt_risk_level || 'N/A'}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {(row as any).ip_city ? `${(row as any).ip_city}, ${(row as any).ip_country}` : 'Unknown'}
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs">
                  {(row as any).recommended_action || 'Monitor'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    {row['Malware Indicators'] && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    {(row as any)['Alerts/Warnings'] && (
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    )}
                    {!row['Malware Indicators'] && !(row as any)['Alerts/Warnings'] && (
                      <Shield className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-slate-400">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} threats
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded border border-purple-500/50 bg-slate-900 px-3 py-1 text-sm text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="flex items-center px-3 text-sm text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded border border-purple-500/50 bg-slate-900 px-3 py-1 text-sm text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreatTable;

