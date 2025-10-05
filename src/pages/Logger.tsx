import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ArrowLeft } from 'lucide-react';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const Logger = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    prayer: '',
    reason: '',
    isPeriodDay: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!formData.prayer && !formData.isPeriodDay) {
      toast({
        title: 'Missing Information',
        description: 'Please select a prayer or mark as period day.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await api.logPrayer({
        gmail: user.gmail,
        name: user.name,
        age: user.age,
        gender: user.gender,
        date: formData.date,
        prayer: formData.isPeriodDay ? 'All 5 Prayers' : formData.prayer,
        status: 'missed',
        reason: formData.reason,
        periodDay: formData.isPeriodDay,
      });

      if (success) {
        toast({
          title: 'Logged Successfully',
          description: formData.isPeriodDay 
            ? 'Period day marked. All 5 prayers are maaf for this day.'
            : `${formData.prayer} has been logged.`,
        });
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          prayer: '',
          reason: '',
          isPeriodDay: false,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to log prayer. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
              <div className="p-3 rounded-full gradient-accent">
                <BookOpen className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading">Log Missed Prayer</CardTitle>
            <CardDescription>
              Track missed prayers or mark period days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
              </div>

              {user?.gender === 'female' && (
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="periodDay">Mark as Period Day</Label>
                    <p className="text-xs text-muted-foreground">
                      All 5 prayers for this day will be marked as maaf
                    </p>
                  </div>
                  <Switch
                    id="periodDay"
                    checked={formData.isPeriodDay}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPeriodDay: checked })}
                    disabled={isLoading}
                  />
                </div>
              )}

              {!formData.isPeriodDay && (
                <div className="space-y-2">
                  <Label htmlFor="prayer">Prayer Name</Label>
                  <Select 
                    value={formData.prayer} 
                    onValueChange={(value) => setFormData({ ...formData, prayer: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a prayer" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRAYERS.map((prayer) => (
                        <SelectItem key={prayer} value={prayer}>
                          {prayer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Why did you miss this prayer?"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <Button 
                type="submit"
                className="w-full gradient-primary shadow-soft hover:shadow-card transition-smooth"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Log Prayer'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-center italic text-muted-foreground">
                "Qaza namaz ko darane ki zarurat nahi. Yeh Allah ke kareeb aane ka ek aur moka hai."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Logger;
