import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import logoPup from "@/assets/logo-pup.png";
import { 
  FaHome, 
  FaDog, 
  FaCalendarAlt, 
  FaBell, 
  FaCog, 
  FaUser,
  FaSignOutAlt,
  FaCamera,
  FaHeart,
  FaBars,
  FaTimes,
  FaUsers,
  FaStar,
  FaStore
} from 'react-icons/fa';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: FaHome,
      description: 'Overview & stats'
    },
    {
      name: 'Marketplace',
      path: '/marketplace',
      icon: FaStore,
      description: 'Find walkers nearby'
    },
    {
      name: 'Bookings',
      path: '/schedule',
      icon: FaCalendarAlt,
      description: 'Walk bookings'
    },
    {
      name: 'Premium Walk',
      path: '/premium-walk',
      icon: FaStar,
      description: 'Advanced features'
    },
    {
      name: 'Pets',
      path: '/pets',
      icon: FaDog,
      description: 'Manage your pets'
    },
    {
      name: 'Profile',
      path: '/settings',
      icon: FaUser,
      description: 'App preferences'
    }
  ];

  const otherItems = [
    {
      name: 'Find Walkers',
      path: '/walkers',
      icon: FaUsers,
      description: 'Browse walkers'
    },
    {
      name: 'Photos',
      path: '/photos',
      icon: FaCamera,
      description: 'Walk memories'
    },
    {
      name: 'Loyalty',
      path: '/loyalty',
      icon: FaHeart,
      description: 'Rewards & points'
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: FaBell,
      description: 'Updates & alerts'
    }
  ];

  const earnItems = [
    {
      name: 'Become a Walker & Earn',
      path: '/walker-onboarding',
      icon: FaStar,
      description: 'Start earning with pets!'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:block flex flex-col h-screen
      `}>
        {/* Logo & Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={logoPup} alt="PupRoute Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">PupRoute</h1>
              <p className="text-xs text-gray-500">Your Dog Walking App</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <FaTimes />
          </Button>
        </div>

        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-4 px-6 py-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`text-lg ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-6">
              QUICK ACTIONS
            </h3>
            <div className="space-y-3">
              <Link
                to="/bookings/new"
                className="flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => setSidebarOpen(false)}
              >
                <span>Book a Walk</span>
                <span className="text-lg">🚶</span>
              </Link>
              
              <Link
                to="/pets"
                className="flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-orange-400 to-green-400 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => setSidebarOpen(false)}
              >
                <span>Add New Pet</span>
                <span className="text-lg">🐕</span>
              </Link>
            </div>
          </div>

          {/* Other Navigation Items */}
          <div className="pt-6 space-y-2">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-4 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`text-base ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className={`text-xs ${active ? 'text-blue-400' : 'text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Earn Money Section */}
          <div className="pt-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-6">
              💰 EARN MONEY
            </h3>
            {earnItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="text-lg text-white" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-green-100">
                      {item.description}
                    </div>
                  </div>
                  <span className="text-xl">💸</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        {user && (
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <FaUser />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-500 hover:text-red-600 p-2"
              >
                <FaSignOutAlt />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FaBars />
          </Button>
          <h1 className="font-semibold text-lg text-gray-900">PupRoute</h1>
          <div className="w-8" />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
