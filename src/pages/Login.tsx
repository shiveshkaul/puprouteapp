import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import heroBackground from "@/assets/hero-background.jpg";

const Login = () => {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist, try to sign up
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: email.split('@')[0],
                last_name: '',
              },
            },
          });

          if (signUpError) throw signUpError;
          
          toast.success("Account created! Welcome to PupRoute! 🐕");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome back to PupRoute! 🐕");
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Current origin:', window.location.origin);
      console.log('Initiating Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'openid email profile',
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error(`Authentication error: ${error.message}`);
      } else {
        console.log('Google OAuth initiated successfully');
        // The redirect will happen automatically
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error("Google login error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-fun/80" />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ y: "100vh", x: `${Math.random() * 100}vw` }}
            animate={{ 
              y: "-10vh",
              x: `${Math.random() * 100}vw`,
              rotate: 360 
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
          >
            {["🐕", "🐾", "🎾", "🦴", "🏃‍♂️", "❤️", "🌟", "🎯"][i]}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="w-full max-w-md"
        >
          <div className="fun-card bg-white/95 backdrop-blur-sm">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="text-6xl mb-4"
              >
                🐕
              </motion.div>
              <h1 className="text-3xl font-heading text-primary mb-2">
                Welcome to PupRoute!
              </h1>
              <p className="text-muted-foreground">
                Your dog walking adventure starts here
              </p>
            </motion.div>

            {/* Google Login Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Button
                type="button"
                variant="fun"
                size="lg"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                <FaGoogle className="mr-2 text-white" />
                Continue with Google
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmailLogin(!showEmailLogin)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {showEmailLogin ? "Hide" : "Or use email/password"}
                </Button>
              </div>

              {/* Email/Password Form */}
              {showEmailLogin && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-4 border-t pt-4"
                >
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in / Sign up"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    We'll create an account if you don't have one
                  </p>
                </motion.form>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Sign in to start booking amazing walks for your furry friends! 🐾
                </p>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 space-y-3"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-lg">🗺️</span>
                <span>Real-time GPS tracking</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-lg">📸</span>
                <span>Live photos during walks</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-lg">⭐</span>
                <span>Trusted, rated walkers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-lg">🎯</span>
                <span>AI-powered recommendations</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;