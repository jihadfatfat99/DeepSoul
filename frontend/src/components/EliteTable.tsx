import { useState, Fragment, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, AlertCircle, Shield, Activity, Zap, Globe, Clock, User,
  ChevronLeft, ChevronsLeft, ChevronsRight, Filter, X, Search, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThreatData } from '../types/threat-analysis';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface EliteTableProps {
  data: ThreatData[];
}

interface Filters {
  severity: string[];
  attackType: string[];
  actionTaken: string[];
  protocol: string[];
  networkSegment: string[];
  classification: string[];
  sourceIP: string;
  destIP: string;
  location: string;
  minRiskScore: number;
  maxRiskScore: number;
  dateFrom: string;
  dateTo: string;
}

const EliteTable = ({ data }: EliteTableProps) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [, setHoveredRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    severity: [],
    attackType: [],
    actionTaken: [],
    protocol: [],
    networkSegment: [],
    classification: [],
    sourceIP: '',
    destIP: '',
    location: '',
    minRiskScore: 0,
    maxRiskScore: 100,
    dateFrom: '',
    dateTo: '',
  });

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

  const getSeverityGlow = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'medium':
        return 'shadow-[0_0_10px_rgba(234,179,8,0.5)]';
      case 'low':
        return 'shadow-[0_0_10px_rgba(34,197,94,0.5)]';
      default:
        return '';
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
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'logged':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'ignored':
        return 'text-white/40 bg-white/5 border-white/20';
      default:
        return 'text-white/40 bg-white/5 border-white/20';
    }
  };

  // Extract unique values for filters
  const uniqueValues = useMemo(() => ({
    severities: [...new Set(data.map(d => d['Severity Level']).filter(Boolean))],
    attackTypes: [...new Set(data.map(d => d['Attack Type']).filter(Boolean))],
    actions: [...new Set(data.map(d => d['Action Taken']).filter(Boolean))],
    protocols: [...new Set(data.map(d => d.Protocol).filter(Boolean))],
    segments: [...new Set(data.map(d => d['Network Segment']).filter(Boolean))],
    classifications: [...new Set(data.map(d => d.consensus_classification).filter(Boolean))],
  }), [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(row['Severity Level'] || '')) {
        return false;
      }

      // Attack Type filter
      if (filters.attackType.length > 0 && !filters.attackType.includes(row['Attack Type'] || '')) {
        return false;
      }

      // Action Taken filter
      if (filters.actionTaken.length > 0 && !filters.actionTaken.includes(row['Action Taken'] || '')) {
        return false;
      }

      // Protocol filter
      if (filters.protocol.length > 0 && !filters.protocol.includes(row.Protocol || '')) {
        return false;
      }

      // Network Segment filter
      if (filters.networkSegment.length > 0 && !filters.networkSegment.includes(row['Network Segment'] || '')) {
        return false;
      }

      // Classification filter
      if (filters.classification.length > 0 && !filters.classification.includes(row.consensus_classification || '')) {
        return false;
      }

      // Source IP filter
      if (filters.sourceIP && !row['Source IP Address']?.toLowerCase().includes(filters.sourceIP.toLowerCase())) {
        return false;
      }

      // Destination IP filter
      if (filters.destIP && !row['Destination IP Address']?.toLowerCase().includes(filters.destIP.toLowerCase())) {
        return false;
      }

      // Location filter
      if (filters.location && !row['Geo-location Data']?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Risk Score filter
      const riskScore = row.final_risk_score ?? 0;
      if (riskScore < filters.minRiskScore || riskScore > filters.maxRiskScore) {
        return false;
      }

      // Date filter
      if (filters.dateFrom || filters.dateTo) {
        const rowDate = new Date(row.Timestamp);
        if (filters.dateFrom && rowDate < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && rowDate > new Date(filters.dateTo)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  const toggleFilter = (filterKey: keyof Filters, value: string) => {
    const currentValues = filters[filterKey] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    handleFilterChange({ [filterKey]: newValues });
  };

  const clearAllFilters = () => {
    setFilters({
      severity: [],
      attackType: [],
      actionTaken: [],
      protocol: [],
      networkSegment: [],
      classification: [],
      sourceIP: '',
      destIP: '',
      location: '',
      minRiskScore: 0,
      maxRiskScore: 100,
      dateFrom: '',
      dateTo: '',
    });
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.severity.length;
    count += filters.attackType.length;
    count += filters.actionTaken.length;
    count += filters.protocol.length;
    count += filters.networkSegment.length;
    count += filters.classification.length;
    if (filters.sourceIP) count++;
    if (filters.destIP) count++;
    if (filters.location) count++;
    if (filters.minRiskScore > 0) count++;
    if (filters.maxRiskScore < 100) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  return (
    <div className="relative space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
              showFilters 
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                : "bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {activeFilterCount}
              </Badge>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all text-sm"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          )}

          <div className="text-sm text-white/60">
            Showing <span className="text-purple-300 font-medium">{startIndex + 1}</span> to{' '}
            <span className="text-purple-300 font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
            <span className="text-purple-300 font-medium">{filteredData.length}</span> threats
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">Items per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(v) => {
            setItemsPerPage(Number(v));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-20 bg-purple-500/5 border-purple-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-lg border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm space-y-6">
              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium flex items-center gap-2">
                    <Search className="w-3 h-3" />
                    Source IP
                  </label>
                  <Input
                    placeholder="Search source IP..."
                    value={filters.sourceIP}
                    onChange={(e) => handleFilterChange({ sourceIP: e.target.value })}
                    className="bg-black/30 border-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium flex items-center gap-2">
                    <Search className="w-3 h-3" />
                    Destination IP
                  </label>
                  <Input
                    placeholder="Search destination IP..."
                    value={filters.destIP}
                    onChange={(e) => handleFilterChange({ destIP: e.target.value })}
                    className="bg-black/30 border-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    Location
                  </label>
                  <Input
                    placeholder="Search location..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ location: e.target.value })}
                    className="bg-black/30 border-purple-500/20"
                  />
                </div>
              </div>

              {/* Risk Score Range */}
              <div className="space-y-2">
                <label className="text-xs text-purple-300 font-medium">Risk Score Range</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min"
                    value={filters.minRiskScore}
                    onChange={(e) => handleFilterChange({ minRiskScore: Number(e.target.value) })}
                    className="bg-black/30 border-purple-500/20 w-24"
                  />
                  <span className="text-white/40">to</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Max"
                    value={filters.maxRiskScore}
                    onChange={(e) => handleFilterChange({ maxRiskScore: Number(e.target.value) })}
                    className="bg-black/30 border-purple-500/20 w-24"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    From Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                    className="bg-black/30 border-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    To Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                    className="bg-black/30 border-purple-500/20"
                  />
                </div>
              </div>

              {/* Multi-Select Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Severity */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium">Severity Level</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.severities.map(sev => (
                      <button
                        key={sev}
                        onClick={() => toggleFilter('severity', sev)}
                        className={cn(
                          "px-3 py-1 rounded text-xs border transition-all",
                          filters.severity.includes(sev)
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : "bg-black/30 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                        )}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attack Type */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium">Attack Type</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.attackTypes.slice(0, 6).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleFilter('attackType', type)}
                        className={cn(
                          "px-3 py-1 rounded text-xs border transition-all truncate max-w-[120px]",
                          filters.attackType.includes(type)
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : "bg-black/30 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Taken */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium">Action Taken</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.actions.map(action => (
                      <button
                        key={action}
                        onClick={() => toggleFilter('actionTaken', action)}
                        className={cn(
                          "px-3 py-1 rounded text-xs border transition-all",
                          filters.actionTaken.includes(action)
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : "bg-black/30 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                        )}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Protocol */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium">Protocol</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.protocols.map(proto => (
                      <button
                        key={proto}
                        onClick={() => toggleFilter('protocol', proto)}
                        className={cn(
                          "px-3 py-1 rounded text-xs border transition-all",
                          filters.protocol.includes(proto)
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : "bg-black/30 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                        )}
                      >
                        {proto}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Network Segment */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium">Network Segment</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.segments.map(seg => (
                      <button
                        key={seg}
                        onClick={() => toggleFilter('networkSegment', seg)}
                        className={cn(
                          "px-3 py-1 rounded text-xs border transition-all",
                          filters.networkSegment.includes(seg)
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : "bg-black/30 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                        )}
                      >
                        {seg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Classification */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 font-medium">Classification</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.classifications.map(cls => cls && (
                      <button
                        key={cls}
                        onClick={() => toggleFilter('classification', cls)}
                        className={cn(
                          "px-3 py-1 rounded text-xs border transition-all",
                          filters.classification.includes(cls)
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : "bg-black/30 border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                        )}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-purple-500/10 bg-[#0f0f14]/50 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-500/10 bg-purple-500/5">
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Time
              </th>
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Source
              </th>
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Target
              </th>
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Attack Vector
              </th>
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Severity
              </th>
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Response
              </th>
              <th className="text-left p-4 text-xs font-medium text-purple-300/70 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row: ThreatData, idx: number) => {
              const Icon = getSeverityIcon(row['Severity Level']);
              return (
                <Fragment key={`row-${row._unique_id || idx}`}>
                  <motion.tr
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.05)' }}
                    className={cn(
                      "border-b border-purple-500/5 transition-all duration-200 cursor-pointer relative",
                      selectedRow === idx && "bg-purple-500/10 border-purple-500/20"
                    )}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => setSelectedRow(selectedRow === idx ? null : idx)}
                  >
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-purple-400/40" />
                        <span className="font-mono text-purple-300/80">
                          {new Date(row.Timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-mono text-cyan-400/90 group-hover:text-cyan-300 transition-colors">
                          {row['Source IP Address']}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5 font-mono">
                          :{row['Source Port']}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-mono text-cyan-400/90">
                          {row['Destination IP Address']}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5 font-mono">
                          :{row['Destination Port']}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-purple-400/60" />
                        <div>
                          <p className="text-sm text-white/90">
                            {row['Attack Type']}
                          </p>
                          <p className="text-xs text-purple-300/50 mt-0.5">
                            {row.Protocol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded",
                          getSeverityGlow(row['Severity Level'])
                        )}>
                          <Icon className={cn("w-4 h-4", getSeverityColor(row['Severity Level']))} />
                        </div>
                        <span className={cn("text-sm font-medium", getSeverityColor(row['Severity Level']))}>
                          {row['Severity Level']}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <motion.span 
                        className={cn(
                          "inline-block text-xs font-medium px-3 py-1.5 rounded border",
                          getActionStyles(row['Action Taken'])
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 + 0.2 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {row['Action Taken']}
                      </motion.span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-1.5 bg-black/50 rounded-full overflow-hidden">
                          <motion.div 
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ 
                              background: `linear-gradient(to right, 
                                ${(row.final_risk_score ?? 0) > 70 ? '#ef4444' : 
                                  (row.final_risk_score ?? 0) > 40 ? '#eab308' : '#22c55e'}, 
                                ${(row.final_risk_score ?? 0) > 70 ? '#dc2626' : 
                                  (row.final_risk_score ?? 0) > 40 ? '#f59e0b' : '#16a34a'})`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${row.final_risk_score ?? 0}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                          />
                          <div 
                            className="absolute inset-y-0 rounded-full blur-sm opacity-50"
                            style={{ 
                              background: `linear-gradient(to right, 
                                ${(row.final_risk_score ?? 0) > 70 ? '#ef4444' : 
                                  (row.final_risk_score ?? 0) > 40 ? '#eab308' : '#22c55e'}, 
                                ${(row.final_risk_score ?? 0) > 70 ? '#dc2626' : 
                                  (row.final_risk_score ?? 0) > 40 ? '#f59e0b' : '#16a34a'})`,
                              width: `${row.final_risk_score ?? 0}%`
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-purple-300/70">
                          {row.final_risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <ChevronRight className={cn(
                        "w-4 h-4 text-purple-400/30 transition-all duration-200",
                        selectedRow === idx && "rotate-90 text-purple-400"
                      )} />
                    </td>
                  </motion.tr>
                  
                  {/* Expandable Details directly under the row */}
                  {selectedRow === idx && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td colSpan={8} className="p-0 border-b border-purple-500/10">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-gradient-to-b from-purple-500/5 to-transparent backdrop-blur-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                  <Globe className="w-3 h-3" />
                                  Network Intelligence
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Packet Size</span>
                                    <span className="font-mono text-purple-300">{row['Packet Length']} bytes</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Traffic Type</span>
                                    <span className="text-cyan-400">{row['Traffic Type']}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Network</span>
                                    <span className="text-purple-300">{row['Network Segment']}</span>
                                  </div>
                                </div>
                              </div>
              
                              <div className="space-y-4">
                                <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                  <Activity className="w-3 h-3" />
                                  Threat Analysis
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Anomaly Score</span>
                                    <span className="font-mono text-yellow-400">{row['Anomaly Scores']}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Signature</span>
                                    <span className="text-purple-300">{row['Attack Signature']}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Classification</span>
                                    <span className="text-cyan-400">{row.consensus_classification}</span>
                                  </div>
                                </div>
                              </div>
              
                              <div className="space-y-4">
                                <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                  <User className="w-3 h-3" />
                                  Context Data
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Location</span>
                                    <span className="text-purple-300">{row['Geo-location Data'] || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">User</span>
                                    <span className="text-cyan-400 truncate max-w-[150px]">{row['User Information'] || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/30 rounded border border-purple-500/10">
                                    <span className="text-white/60">Source</span>
                                    <span className="text-purple-300">{row['Log Source']}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {row['Payload Data'] && (
                              <div className="mt-6 space-y-3">
                                <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                                  Payload Analysis
                                </h4>
                                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                                  <code className="text-xs text-purple-300/70 font-mono">
                                    {row['Payload Data']}
                                  </code>
                                </div>
                              </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-purple-500/10 flex items-center justify-between text-xs">
                              <span className="text-white/40">ID: {row._unique_id}</span>
                              <span className="text-purple-400/60">{row.Timestamp}</span>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
          <div className="text-sm text-white/60">
            Page <span className="text-purple-300 font-medium">{currentPage}</span> of{' '}
            <span className="text-purple-300 font-medium">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded border transition-all",
                currentPage === 1
                  ? "border-purple-500/10 text-white/20 cursor-not-allowed"
                  : "border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              )}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded border transition-all",
                currentPage === 1
                  ? "border-purple-500/10 text-white/20 cursor-not-allowed"
                  : "border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "px-3 py-1 rounded border transition-all min-w-[36px]",
                      currentPage === pageNum
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-medium"
                        : "border-purple-500/20 text-white/60 hover:bg-purple-500/10"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded border transition-all",
                currentPage === totalPages
                  ? "border-purple-500/10 text-white/20 cursor-not-allowed"
                  : "border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded border transition-all",
                currentPage === totalPages
                  ? "border-purple-500/10 text-white/20 cursor-not-allowed"
                  : "border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              )}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm text-white/60">
            {filteredData.length} total results
          </div>
        </div>
      )}
    </div>
  );
};

export default EliteTable;
