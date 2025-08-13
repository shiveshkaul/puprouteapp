import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaPaw, FaUser, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logoPup from "@/assets/logo-pup.png";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("See you later! 👋");
      navigate("/login");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const navItems = [
    { icon: FaHome, label: "Home", path: "/dashboard" },
    { icon: FaCalendarAlt, label: "Bookings", path: "/schedule" },
    { icon: FaPaw, label: "Pets", path: "/pets" },
    { icon: FaUser, label: "Profile", path: "/settings" },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <img src={logoPup} alt="PupRoute Logo" className="w-10 h-10" />
            <h1 className="text-xl font-heading text-primary">PupRoute</h1>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Find walkers near me..."
                className="input-fun w-full pl-10 pr-4"
                aria-label="Search for dog walkers"
              />
            </div>
          </div>

          {/* User Avatar & Menu */}
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full bg-gradient-fun flex items-center justify-center text-white font-semibold"
              title={user?.email || "User"}
            >
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
              title="Sign Out"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Bottom Navigation (Mobile) */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border md:hidden"
      >
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    isActive && "bg-primary text-white shadow-[var(--shadow-fun)]"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </motion.nav>

      {/* Desktop Sidebar */}
      <motion.nav
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border z-40 flex-col p-4"
      >
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-[var(--radius-fun)] transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-fun)]"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/bookings/new")}
            className="w-full p-3 bg-gradient-fun text-white rounded-[var(--radius-fun)] font-semibold shadow-[var(--shadow-fun)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
          >
            Book a Walk 🚶‍♂️
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/pets")}
            className="w-full p-3 bg-gradient-magical text-white rounded-[var(--radius-fun)] font-semibold shadow-[var(--shadow-fun)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
          >
            Add New Pet 🐕
          </motion.button>
        </div>

        {/* User Info & Sign Out */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-[var(--radius-fun)] bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-gradient-fun flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Pet Parent</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
              title="Sign Out"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navigation;