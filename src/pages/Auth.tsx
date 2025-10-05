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
import { Moon } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gmail: '',
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email
      if (!formData.gmail.includes('@gmail.com')) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid Gmail address.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Check if user exists
      const existingUser = await api.checkUser(formData.gmail);

      if (existingUser) {
        // User exists - login
        login(existingUser);
        toast({
          title: `Assalamu Alaikum, ${existingUser.name}! 👋`,
          description: 'Welcome back to your prayer journey.',
        });
        navigate('/dashboard');
      } else {
        // New user - signup
        if (!formData.name || !formData.age) {
          toast({
            title: 'Incomplete Information',
            description: 'Please fill in all fields to create your account.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const newUser = {
          gmail: formData.gmail,
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
        };

        const success = await api.createUser(newUser);

        if (success) {
          login(newUser);
          toast({
            title: `Welcome, ${newUser.name}! 🌙`,
            description: 'Your spiritual journey begins now.',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Error',
            description: 'Failed to create account. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Moon className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Welcome</CardTitle>
          <CardDescription>
            Sign in with your Gmail or create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gmail">Gmail Address*</Label>
              <Input
                id="gmail"
                type="email"
                placeholder="your.email@gmail.com"
                value={formData.gmail}
                onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name*</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age*</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender*</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-primary shadow-soft hover:shadow-card transition-smooth"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : 'Continue →'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Existing user? Just enter your Gmail to sign in.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
