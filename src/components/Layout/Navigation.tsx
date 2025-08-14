import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAdvancedWalkSession } from '@/hooks/useAdvancedWalkSession';
import { 
  FaHome, 
  FaDog, 
  FaCalendarAlt, 
  FaBell, 
  FaCog, 
  FaUser,
  FaSignOutAlt,
  FaPlay,
  FaPause,
  FaRoute,
  FaClock
} from 'react-icons/fa';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state, start, current, stats, walkDuration } = useAdvancedWalkSession();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/src/assets/logo-pup.png" alt="PupRoute" className="h-8 w-8" />
            <span className="font-bold text-xl text-blue-600">PupRoute</span>
          </Link>

          {/* Active Walk Status */}
          {state !== 'idle' && (
            <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg">
              <Badge variant={state === 'running' ? 'default' : 'secondary'}>
                {state === 'running' && (
                  <>
                    <FaPlay className="mr-1 text-xs" />
                    LIVE WALK
                  </>
                )}
                {state === 'paused' && (
                  <>
                    <FaPause className="mr-1 text-xs" />
                    PAUSED
                  </>
                )}
                {state === 'ended' && '✅ COMPLETED'}
              </Badge>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <FaClock className="text-blue-500" />
                  <span className="font-medium">{formatTime(walkDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaRoute className="text-green-500" />
                  <span className="font-medium">{formatDistance(stats.distanceM)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaHome />
              Dashboard
            </Link>
            
            <Link
              to="/pets"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pets')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaDog />
              Pets
            </Link>
            
            <Link
              to="/schedule"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/schedule')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaCalendarAlt />
              Schedule
            </Link>
            
            <Link
              to="/notifications"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/notifications')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaBell />
              Notifications
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link
                  to="/settings"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <FaCog />
                </Link>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaSignOutAlt />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex items-center justify-around py-2">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive('/dashboard') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <FaHome />
              Dashboard
            </Link>
            
            <Link
              to="/pets"
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive('/pets') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <FaDog />
              Pets
            </Link>
            
            <Link
              to="/schedule"
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive('/schedule') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <FaCalendarAlt />
              Schedule
            </Link>
            
            <Link
              to="/notifications"
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive('/notifications') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <FaBell />
              Notifications
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
