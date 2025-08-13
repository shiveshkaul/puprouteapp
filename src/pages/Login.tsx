import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaEnvelope, FaLock, FaPaw } from "react-icons/fa";
import { toast } from "sonner";
import heroBackground from "@/assets/hero-background.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome back to PupRoute! 🐕", {
        description: "Time for some pawsome adventures!"
      });
      navigate("/dashboard");
    }, 2000);
  };

  const handleGoogleLogin = () => {
    toast.success("Google login coming soon! 🌟");
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
              className="text-center mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="text-6xl mb-4"
              >
                🐕
              </motion.div>
              <h1 className="text-3xl font-heading text-primary mb-2">
                Adventure Awaits!
              </h1>
              <p className="text-muted-foreground">
                Welcome back to your PupRoute family
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-fun w-full pl-10"
                    required
                    autoFocus
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-fun w-full pl-10"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <Button
                  type="submit"
                  variant="fun"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaPaw />
                    </motion.div>
                  ) : (
                    "Start Your Adventure! 🚀"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <FaGoogle className="text-red-500" />
                  Continue with Google
                </Button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-muted-foreground">
                New to PupRoute?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-semibold hover:underline"
                >
                  Join the pack! 🐾
                </Link>
              </p>
              
              <p className="text-xs text-muted-foreground mt-4">
                Forgot your password?{" "}
                <button className="text-primary hover:underline">
                  Get help here
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;