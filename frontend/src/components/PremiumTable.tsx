import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, AlertCircle, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThreatData } from '../types/threat-analysis';

interface PremiumTableProps {
  data: ThreatData[];
}

const PremiumTable = ({ data }: PremiumTableProps) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const getSeverityColor = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-white/40';
    }
  };

  const getSeverityIcon = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return AlertCircle;
      case 'medium':
        return Activity;
      case 'low':
        return Shield;
      default:
        return Activity;
    }
  };

  const getActionStyles = (action: string | undefined) => {
    switch (action?.toLowerCase()) {
      case 'blocked':
        return 'text-red-400 bg-red-500/10';
      case 'logged':
        return 'text-blue-400 bg-blue-500/10';
      case 'ignored':
        return 'text-white/40 bg-white/5';
      default:
        return 'text-white/40 bg-white/5';
    }
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-sm border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Time
              </th>
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Source
              </th>
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Target
              </th>
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Severity
              </th>
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Action
              </th>
              <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">
                Risk
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.slice(0, 10).map((row: ThreatData, idx: number) => {
                const Icon = getSeverityIcon(row['Severity Level']);
                return (
                  <motion.tr
                    key={row._unique_id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={cn(
                      "border-b border-white/5 transition-all duration-200",
                      hoveredRow === idx && "bg-white/5",
                      selectedRow === idx && "bg-white/10"
                    )}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => setSelectedRow(selectedRow === idx ? null : idx)}
                  >
                    <td className="p-4 text-sm font-mono text-white/60">
                      {new Date(row.Timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-mono text-white/90">
                          {row['Source IP Address']}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {row['Source Port']}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-mono text-white/90">
                          {row['Destination IP Address']}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {row['Destination Port']}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-white/90">
                          {row['Attack Type']}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {row.Protocol}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-4 h-4", getSeverityColor(row['Severity Level']))} />
                        <span className={cn("text-sm font-medium", getSeverityColor(row['Severity Level']))}>
                          {row['Severity Level']}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded",
                        getActionStyles(row['Action Taken'])
                      )}>
                        {row['Action Taken']}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"
                            style={{ 
                              width: `${row.final_risk_score}%`,
                              opacity: 0.8
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/60">
                          {row.final_risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <ChevronRight className={cn(
                        "w-4 h-4 text-white/20 transition-transform duration-200",
                        selectedRow === idx && "rotate-90"
                      )} />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {selectedRow !== null && data[selectedRow] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 p-6 bg-white/5 rounded-sm border border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Network Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Packet Length</span>
                    <span className="font-mono">{data[selectedRow]['Packet Length']} bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Traffic Type</span>
                    <span>{data[selectedRow]['Traffic Type']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Network Segment</span>
                    <span>{data[selectedRow]['Network Segment']}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Threat Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Anomaly Score</span>
                    <span className="font-mono">{data[selectedRow]['Anomaly Scores']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Attack Signature</span>
                    <span>{data[selectedRow]['Attack Signature']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Classification</span>
                    <span>{data[selectedRow].consensus_classification}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Location & User
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Location</span>
                    <span>{data[selectedRow]['Geo-location Data'] || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">User</span>
                    <span className="truncate max-w-[150px]">{data[selectedRow]['User Information'] || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Log Source</span>
                    <span>{data[selectedRow]['Log Source']}</span>
                  </div>
                </div>
              </div>
            </div>

            {data[selectedRow]['Payload Data'] && (
              <div className="mt-6">
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Payload Data
                </h4>
                <div className="p-3 bg-black/50 rounded border border-white/10">
                  <code className="text-xs text-white/60 font-mono">
                    {data[selectedRow]['Payload Data']}
                  </code>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumTable;
