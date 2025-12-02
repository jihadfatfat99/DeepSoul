import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Shield, AlertCircle, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ThreatData } from '../types/threat-analysis';

interface EnhancedThreatTableProps {
  data: ThreatData[];
}

const EnhancedThreatTable = ({ data }: EnhancedThreatTableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const itemsPerPage = 10;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Unused but kept for potential future use
  // const getSeverityVariant = (severity: string | undefined) => {
  //   switch (severity?.toLowerCase()) {
  //     case 'high':
  //       return 'destructive';
  //     case 'medium':
  //       return 'default';
  //     case 'low':
  //       return 'secondary';
  //     default:
  //       return 'outline';
  //   }
  // };

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

  const getActionColor = (action: string | undefined) => {
    switch (action?.toLowerCase()) {
      case 'blocked':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'logged':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'ignored':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
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
      <ChevronUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="inline h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-purple-500/30 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10">
              <TableRow className="border-b border-purple-500/30 hover:bg-purple-500/5">
                <TableHead
                  className="cursor-pointer text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                  onClick={() => handleSort('Timestamp')}
                >
                  Timestamp <SortIcon column="Timestamp" />
                </TableHead>
                <TableHead
                  className="cursor-pointer text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                  onClick={() => handleSort('Source IP Address')}
                >
                  Source IP <SortIcon column="Source IP Address" />
                </TableHead>
                <TableHead
                  className="cursor-pointer text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                  onClick={() => handleSort('Destination IP Address')}
                >
                  Dest IP <SortIcon column="Destination IP Address" />
                </TableHead>
                <TableHead className="text-purple-300 font-semibold">
                  Protocol
                </TableHead>
                <TableHead
                  className="cursor-pointer text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                  onClick={() => handleSort('Attack Type')}
                >
                  Attack Type <SortIcon column="Attack Type" />
                </TableHead>
                <TableHead
                  className="cursor-pointer text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                  onClick={() => handleSort('Severity Level')}
                >
                  Severity <SortIcon column="Severity Level" />
                </TableHead>
                <TableHead className="text-purple-300 font-semibold">
                  Action
                </TableHead>
                <TableHead className="text-purple-300 font-semibold">
                  Location
                </TableHead>
                <TableHead className="text-purple-300 font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-purple-300 font-semibold text-right">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all duration-200"
                >
                  <TableCell className="font-mono text-sm text-slate-300">
                    {row.Timestamp}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-cyan-400 font-semibold">
                    {row['Source IP Address']}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-cyan-400 font-semibold">
                    {row['Destination IP Address']}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-blue-500/50 bg-blue-500/10 text-blue-400 font-mono"
                    >
                      {row.Protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300 font-medium">
                    {row['Attack Type']}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border font-semibold',
                        getSeverityColor(row['Severity Level'])
                      )}
                    >
                      {row['Severity Level']}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('border font-medium', getActionColor(row['Action Taken']))}
                    >
                      {row['Action Taken']}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {row['Geo-location Data'] || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {row['Malware Indicators'] && (
                        <div className="group relative">
                          <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                          <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded whitespace-nowrap z-10">
                            {row['Malware Indicators']}
                          </span>
                        </div>
                      )}
                      {(row as any)['Alerts/Warnings'] && (
                        <div className="group relative">
                          <AlertCircle className="h-4 w-4 text-yellow-400 animate-pulse" />
                          <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded whitespace-nowrap z-10">
                            {(row as any)['Alerts/Warnings']}
                          </span>
                        </div>
                      )}
                      {!row['Malware Indicators'] && !(row as any)['Alerts/Warnings'] && (
                        <Shield className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                          onClick={() => setSelectedThreat(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-purple-500/30">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Threat Details
                          </DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Complete information about the detected threat
                          </DialogDescription>
                        </DialogHeader>
                        {selectedThreat && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-purple-400">Network Information</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-slate-400">Source IP:</span> <span className="text-cyan-400 font-mono">{selectedThreat['Source IP Address']}</span></p>
                                  <p><span className="text-slate-400">Dest IP:</span> <span className="text-cyan-400 font-mono">{selectedThreat['Destination IP Address']}</span></p>
                                  <p><span className="text-slate-400">Source Port:</span> <span className="text-slate-300 font-mono">{selectedThreat['Source Port']}</span></p>
                                  <p><span className="text-slate-400">Dest Port:</span> <span className="text-slate-300 font-mono">{selectedThreat['Destination Port']}</span></p>
                                  <p><span className="text-slate-400">Protocol:</span> <span className="text-blue-400 font-mono">{selectedThreat.Protocol}</span></p>
                                  <p><span className="text-slate-400">Packet Length:</span> <span className="text-slate-300">{selectedThreat['Packet Length']} bytes</span></p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-purple-400">Threat Analysis</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-slate-400">Attack Type:</span> <span className="text-red-400 font-semibold">{selectedThreat['Attack Type']}</span></p>
                                  <p><span className="text-slate-400">Severity:</span> <Badge className={cn('ml-2', getSeverityColor(selectedThreat['Severity Level']))}>{selectedThreat['Severity Level']}</Badge></p>
                                  <p><span className="text-slate-400">Signature:</span> <span className="text-slate-300">{selectedThreat['Attack Signature']}</span></p>
                                  <p><span className="text-slate-400">Action:</span> <Badge className={cn('ml-2', getActionColor(selectedThreat['Action Taken']))}>{selectedThreat['Action Taken']}</Badge></p>
                                  <p><span className="text-slate-400">Risk Score:</span> <span className="text-yellow-400 font-bold">{selectedThreat.final_risk_score}</span></p>
                                  <p><span className="text-slate-400">Anomaly Score:</span> <span className="text-orange-400">{selectedThreat['Anomaly Scores']}</span></p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-purple-400">Payload Data</h4>
                              <div className="rounded-md bg-slate-950 border border-purple-500/20 p-3">
                                <p className="text-sm text-slate-300 font-mono">{selectedThreat['Payload Data']}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-purple-400">User & Device</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-slate-400">User:</span> <span className="text-slate-300">{selectedThreat['User Information']}</span></p>
                                  <p><span className="text-slate-400">Device:</span> <span className="text-slate-300 text-xs">{selectedThreat['Device Information']}</span></p>
                                  <p><span className="text-slate-400">Network:</span> <span className="text-slate-300">{selectedThreat['Network Segment']}</span></p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-purple-400">Location & Source</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-slate-400">Location:</span> <span className="text-slate-300">{selectedThreat['Geo-location Data']}</span></p>
                                  <p><span className="text-slate-400">Log Source:</span> <span className="text-slate-300">{selectedThreat['Log Source']}</span></p>
                                  <p><span className="text-slate-400">Traffic Type:</span> <span className="text-slate-300">{selectedThreat['Traffic Type']}</span></p>
                                </div>
                              </div>
                            </div>

                            {(selectedThreat['Malware Indicators'] || (selectedThreat as any)['Alerts/Warnings']) && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-red-400">Alerts & Indicators</h4>
                                <div className="space-y-1 text-sm">
                                  {selectedThreat['Malware Indicators'] && (
                                    <p className="text-red-400"><AlertTriangle className="inline h-4 w-4 mr-2" />{selectedThreat['Malware Indicators']}</p>
                                  )}
                                  {(selectedThreat as any)['Alerts/Warnings'] && (
                                    <p className="text-yellow-400"><AlertCircle className="inline h-4 w-4 mr-2" />{(selectedThreat as any)['Alerts/Warnings']}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="pt-4 border-t border-purple-500/20 text-xs text-slate-500">
                              <p>Unique ID: {selectedThreat._unique_id}</p>
                              <p>Timestamp: {selectedThreat.Timestamp}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-slate-400">
          Showing <span className="text-purple-400 font-semibold">{startIndex + 1}</span> to{' '}
          <span className="text-purple-400 font-semibold">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of{' '}
          <span className="text-purple-400 font-semibold">{sortedData.length}</span> threats
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-purple-500/50 bg-slate-900 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-slate-300 bg-slate-900/50 border border-purple-500/30 rounded-md">
            Page <span className="text-purple-400 font-semibold mx-1">{currentPage}</span> of <span className="text-purple-400 font-semibold ml-1">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-purple-500/50 bg-slate-900 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThreatTable;

