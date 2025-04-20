
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboardService, AttackSource } from '@/api/dashboardService';
import { websocketService } from '@/api/websocketService';

const AttackMap = () => {
  const [attackSources, setAttackSources] = useState<AttackSource[]>([]);
  
  // Load initial data and set up real-time updates
  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      try {
        const sources = await dashboardService.getAttackSources();
        setAttackSources(sources);
      } catch (error) {
        console.error('Error loading attack sources:', error);
      }
    };
    
    loadInitialData();
    
    // Set up WebSocket for real-time updates
    websocketService.connect();
    
    // Listen for new attack sources
    const handleNewAttackSource = (data: AttackSource) => {
      setAttackSources(prev => [data, ...prev.slice(0, 4)]);
    };
    
    websocketService.on('NEW_ATTACK_SOURCE', handleNewAttackSource);
    
    return () => {
      // Clean up event listener
      websocketService.off('NEW_ATTACK_SOURCE', handleNewAttackSource);
    };
  }, []);
  
  // Format time as "1m ago", "2h ago", etc.
  const formatTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Live Attack Origins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {attackSources.length === 0 ? (
            <div className="text-muted-foreground text-center py-4">
              No recent attacks detected
            </div>
          ) : (
            attackSources.map((attack, index) => (
              <div 
                key={attack.id}
                className={cn(
                  "flex items-center justify-between",
                  index === 0 && "animate-pulse-opacity"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="status-indicator status-danger"></div>
                  <div>
                    <div className="font-medium">{attack.sourceIp}</div>
                    <div className="text-xs text-muted-foreground">{attack.country}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(attack.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttackMap;
