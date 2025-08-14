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
        console.log('AuthCallback: Starting auth callback handling...');
        
        // Check if we have hash parameters (OAuth callback)
        if (window.location.hash) {
          console.log('AuthCallback: Found hash parameters, processing...');
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('AuthCallback: Session error:', error);
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
            return;
          }

          if (data.session) {
            console.log('AuthCallback: Session found, user:', data.session.user.email);
            
            // Create user profile if it doesn't exist
            try {
              await createUserProfile.mutateAsync({});
              console.log('AuthCallback: User profile created/updated');
            } catch (profileError) {
              console.log('AuthCallback: Profile creation error (may already exist):', profileError);
              // Continue anyway - profile might already exist
            }
            
            toast.success('Welcome to PupRoute! 🐕');
            navigate('/dashboard');
          } else {
            console.log('AuthCallback: No session found');
            navigate('/login');
          }
        } else {
          console.log('AuthCallback: No hash parameters, checking existing session...');
          
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('AuthCallback: Existing session found');
            navigate('/dashboard');
          } else {
            console.log('AuthCallback: No existing session');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, createUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🐕</div>
        <h2 className="text-xl font-heading text-primary mb-2">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
