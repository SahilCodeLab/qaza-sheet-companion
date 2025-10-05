import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Moon, BookOpen, Clock } from 'lucide-react';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen gradient-soft">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 shadow-card">
              <Moon className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-foreground">
            Understand. Pray. Catch Up.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Track your prayers, calculate missed Qaza, and stay connected with your spiritual journey.
          </p>
          
          <p className="text-md text-muted-foreground mb-12 max-w-2xl mx-auto italic">
            Agar namaz chhoot bhi gayi ho, to fikr nahi. Allah niyyat aur koshish dono dekhte hain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="gradient-primary text-lg px-8 shadow-elevated hover:shadow-card transition-smooth"
              onClick={() => navigate('/auth')}
            >
              Get Started →
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-card p-6 rounded-xl shadow-card transition-smooth hover:shadow-elevated">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Track Your Progress</h3>
              <p className="text-muted-foreground text-sm">
                Monitor completed and missed prayers with a beautiful, easy-to-use dashboard.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-card transition-smooth hover:shadow-elevated">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Qaza Calculator</h3>
              <p className="text-muted-foreground text-sm">
                Smart calculator that accounts for age, gender, and period days for accurate estimates.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-card transition-smooth hover:shadow-elevated">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 mx-auto">
                <Moon className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Period Day Support</h3>
              <p className="text-muted-foreground text-sm">
                For sisters: Period days are automatically marked as maaf — no qaza required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Made with 💚 for the Ummah
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
