import React from 'react';
import { Menu, Bell, LogOut, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  username?: string;
  notificationCount?: number;
  onMenuClick: () => void;
  onDarkModeToggle: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  username, 
  notificationCount = 0,
  onMenuClick, 
  onDarkModeToggle, 
  onLogout 
}) => {
  const bgClass = darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <header className={`sticky top-0 z-30 ${bgClass} backdrop-blur-md border-b shadow-sm`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-lg transition-colors mr-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <h1 className={`text-2xl font-bold ${textClass}`}>
            Dashboard
            <span className={`ml-2 text-sm font-normal ${subTextClass}`}>
              Welcome back, {username}
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={onDarkModeToggle}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              className={`p-2 rounded-lg transition-colors relative ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </button>
          </div>

          {/* Logout - Positioned Far Right */}
          <button 
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
