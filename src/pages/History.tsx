import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api, PrayerLog } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const History = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [logs, setLogs] = useState<PrayerLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchLogs = async () => {
      try {
        const data = await api.getUserLogs(user.gmail);
        setLogs(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load history.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-secondary">
                <Calendar className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading">Prayer History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No history yet. Start tracking your prayers!
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-card border border-border rounded-lg shadow-soft transition-smooth hover:shadow-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold">{log.prayer}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.periodDay 
                          ? 'bg-accent/10 text-accent' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {log.periodDay ? 'Period Day (Maaf)' : log.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(log.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      {log.reason && <span>• {log.reason}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
