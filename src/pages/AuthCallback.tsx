import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (data.session) {
          toast.success('Welcome to PupRoute! 🐕');
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐕</div>
        <h2 className="text-xl font-heading text-primary mb-2">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
