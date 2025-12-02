import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Activity, Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ThreatData } from '../types/threat-analysis';

interface RealTimeActivityFeedProps {
  data: ThreatData[];
}

const RealTimeActivityFeed = ({ data }: RealTimeActivityFeedProps) => {
  // Get latest 15 threats sorted by timestamp
  const recentThreats = [...data]
    .sort((a: ThreatData, b: ThreatData) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
    .slice(0, 15);

  const getActivityIcon = (attackType: string | undefined) => {
    switch (attackType) {
      case 'DDoS':
        return Activity;
      case 'Malware':
        return AlertTriangle;
      case 'Intrusion':
        return Shield;
      default:
        return Activity;
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

  const getIconColor = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/10 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400 animate-pulse" />
                Real-Time Activity Feed
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Latest threat detections and security events
              </CardDescription>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <AnimatePresence>
              {recentThreats.map((threat, index) => {
                const Icon = getActivityIcon(threat['Attack Type']);
                return (
                  <motion.div
                    key={threat._unique_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="relative group">
                      <motion.div
                        className={cn(
                          "p-4 rounded-lg border mb-3 transition-all duration-200",
                          "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                          getSeverityColor(threat['Severity Level'])
                        )}
                        whileHover={{ scale: 1.02 }}
                      >
                        {/* Severity indicator line */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                          threat['Severity Level']?.toLowerCase() === 'high' && 'bg-red-500',
                          threat['Severity Level']?.toLowerCase() === 'medium' && 'bg-yellow-500',
                          threat['Severity Level']?.toLowerCase() === 'low' && 'bg-green-500'
                        )} />

                        <div className="flex items-start gap-3 ml-2">
                          <div className={cn(
                            "p-2 rounded-full flex-shrink-0 mt-1",
                            getIconColor(threat['Severity Level'])
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-white text-sm">
                                  {threat['Attack Type']} Attack Detected
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {threat['Attack Signature']}
                                </p>
                              </div>
                              <Badge 
                                className={cn(
                                  'text-xs font-semibold border',
                                  getSeverityColor(threat['Severity Level'])
                                )}
                              >
                                {threat['Severity Level']}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1 text-cyan-400">
                                <Activity className="h-3 w-3" />
                                <span className="font-mono">{threat['Source IP Address']}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{threat['Geo-location Data'] || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <User className="h-3 w-3" />
                                <span className="truncate">{threat['User Information'] || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>{threat.Timestamp}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                {threat.Protocol}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                {threat['Action Taken']}
                              </Badge>
                              {threat['Malware Indicators'] && (
                                <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  IoC
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs border-slate-500/50 text-slate-400">
                                Risk: {threat.final_risk_score}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RealTimeActivityFeed;

