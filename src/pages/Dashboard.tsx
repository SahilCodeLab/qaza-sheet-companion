import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api, PrayerLog } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, LogOut, Calculator, BookOpen, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalMissed: 0, completed: 0, periodDays: 0 });
  const [recentLogs, setRecentLogs] = useState<PrayerLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          api.getUserStats(user.gmail),
          api.getUserLogs(user.gmail),
        ]);
        setStats(statsData);
        setRecentLogs(logsData.slice(0, 5));
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load your data. Please refresh.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'May Allah accept your efforts.',
    });
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <Moon className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading font-semibold text-lg">Namaz Tracker</h1>
              <p className="text-sm text-muted-foreground">Assalamu Alaikum, {user?.name}! 👋</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card transition-smooth hover:shadow-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Qaza</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-destructive">{stats.totalMissed}</div>
              <p className="text-xs text-muted-foreground mt-1">Prayers to make up</p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-smooth hover:shadow-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-primary">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Prayers logged</p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-smooth hover:shadow-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Period Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-accent">{stats.periodDays}</div>
              <p className="text-xs text-muted-foreground mt-1">Days marked as maaf</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button 
            className="gradient-primary shadow-soft hover:shadow-card transition-smooth"
            onClick={() => navigate('/calculator')}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Qaza
          </Button>
          <Button 
            className="gradient-accent shadow-soft hover:shadow-card transition-smooth"
            onClick={() => navigate('/logger')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Log Prayer
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/history')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>

        {/* Recent Logs */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity yet. Start tracking your prayers!
              </p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{log.prayer}</p>
                      <p className="text-sm text-muted-foreground">{log.date}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.periodDay 
                        ? 'bg-accent/10 text-accent' 
                        : log.status === 'missed' 
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {log.periodDay ? 'Period Day' : log.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-8 bg-secondary/50 border-secondary">
          <CardContent className="pt-6">
            <p className="text-sm text-center italic text-secondary-foreground">
              "Allah niyyat aur koshish dono dekhte hain. Har qaza namaz ek aur moka hai Allah ke kareeb aane ka."
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
