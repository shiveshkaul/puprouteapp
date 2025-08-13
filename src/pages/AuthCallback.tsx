import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useCreateUserProfile } from '@/hooks/useUserProfile';

const AuthCallback = () => {
  const navigate = useNavigate();
  const createUserProfile = useCreateUserProfile();

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
          // Create user profile if it doesn't exist
          try {
            await createUserProfile.mutateAsync({});
          } catch (profileError) {
            console.log('Profile creation error (may already exist):', profileError);
            // Continue anyway - profile might already exist
          }
          
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
  }, [navigate, createUserProfile]);

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
