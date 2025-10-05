import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calculator, ArrowLeft, Save } from 'lucide-react';

const QazaCalculator = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<{
    gender: 'male' | 'female';
    ageWhenFarz: string;
    currentAge: string;
    avgPeriodDays: string;
  }>({
    gender: user?.gender || 'male',
    ageWhenFarz: '',
    currentAge: user?.age.toString() || '',
    avgPeriodDays: '5',
  });
  
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateQaza = () => {
    const ageWhenFarz = parseInt(formData.ageWhenFarz);
    const currentAge = parseInt(formData.currentAge);
    
    if (isNaN(ageWhenFarz) || isNaN(currentAge) || currentAge < ageWhenFarz) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter valid ages.',
        variant: 'destructive',
      });
      return;
    }

    const yearsSinceFarz = currentAge - ageWhenFarz;
    const totalDays = yearsSinceFarz * 365;
    
    let periodDays = 0;
    if (formData.gender === 'female') {
      const avgPeriodDays = parseInt(formData.avgPeriodDays) || 5;
      periodDays = avgPeriodDays * 12 * yearsSinceFarz;
    }
    
    const missedDays = totalDays - periodDays;
    const totalMissedNamaz = missedDays * 5;
    
    setResult(totalMissedNamaz);
  };

  const saveQaza = async () => {
    if (result === null || !user) return;
    
    setIsLoading(true);
    try {
      const success = await api.updateQazaCount(user.gmail, result);
      if (success) {
        toast({
          title: 'Saved Successfully',
          description: `Your Qaza count of ${result} has been saved.`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save. Please try again.',
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
              <div className="p-3 rounded-full gradient-primary">
                <Calculator className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading">Qaza Calculator</CardTitle>
            <CardDescription>
              Calculate your total missed prayers with accurate period day accounting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="calc-male" />
                  <Label htmlFor="calc-male" className="font-normal cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="calc-female" />
                  <Label htmlFor="calc-female" className="font-normal cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageWhenFarz">Age When Namaz Became Farz</Label>
              <Input
                id="ageWhenFarz"
                type="number"
                placeholder="e.g., 13"
                value={formData.ageWhenFarz}
                onChange={(e) => setFormData({ ...formData, ageWhenFarz: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Usually around puberty (12-15 years)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                placeholder="e.g., 25"
                value={formData.currentAge}
                onChange={(e) => setFormData({ ...formData, currentAge: e.target.value })}
              />
            </div>

            {formData.gender === 'female' && (
              <div className="space-y-2">
                <Label htmlFor="avgPeriodDays">Average Period Days per Month</Label>
                <Input
                  id="avgPeriodDays"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.avgPeriodDays}
                  onChange={(e) => setFormData({ ...formData, avgPeriodDays: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Period days are maaf — no qaza required
                </p>
              </div>
            )}

            <Button 
              onClick={calculateQaza}
              className="w-full gradient-primary shadow-soft hover:shadow-card transition-smooth"
            >
              Calculate Qaza
            </Button>

            {result !== null && (
              <div className="mt-6 p-6 bg-secondary/50 rounded-lg border-2 border-primary/20">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Missed Prayers (Qaza)</p>
                  <p className="text-4xl font-heading font-bold text-primary mb-4">{result}</p>
                  <p className="text-sm text-muted-foreground mb-6 italic">
                    {formData.gender === 'female' && 'Period days have been excluded from this calculation.'}
                  </p>
                  <Button 
                    onClick={saveQaza}
                    disabled={isLoading}
                    className="gradient-accent shadow-soft"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save to Dashboard'}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-center italic text-muted-foreground">
                "Agar bahut zyada qaza hain, to tension mat lo. Allah ko aapki niyyat aur koshish dono pasand hain."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QazaCalculator;
