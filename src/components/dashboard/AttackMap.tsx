
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock attack sources
interface AttackSource {
  id: string;
  sourceIp: string;
  country: string;
  timestamp: Date;
}

const AttackMap = () => {
  const [attackSources, setAttackSources] = useState<AttackSource[]>([]);
  
  // Simulate real-time updates
  useEffect(() => {
    // Initial data
    const initialData: AttackSource[] = [
      { 
        id: 'attack-1', 
        sourceIp: '203.0.113.42', 
        country: 'China', 
        timestamp: new Date(Date.now() - 45000) 
      },
      { 
        id: 'attack-2', 
        sourceIp: '198.51.100.22', 
        country: 'Russia', 
        timestamp: new Date(Date.now() - 120000) 
      },
      { 
        id: 'attack-3', 
        sourceIp: '192.0.2.89', 
        country: 'United States', 
        timestamp: new Date(Date.now() - 300000) 
      }
    ];
    
    setAttackSources(initialData);
    
    // Simulate new attacks appearing
    const interval = setInterval(() => {
      const countries = ['Brazil', 'Russia', 'India', 'China', 'United States', 'Ukraine', 'Netherlands'];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      
      const newAttack = {
        id: `attack-${Date.now()}`,
        sourceIp: randomIp,
        country: randomCountry,
        timestamp: new Date()
      };
      
      setAttackSources(prev => [newAttack, ...prev.slice(0, 4)]);
    }, 8000);
    
    return () => clearInterval(interval);
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
          {attackSources.map((attack, index) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttackMap;
