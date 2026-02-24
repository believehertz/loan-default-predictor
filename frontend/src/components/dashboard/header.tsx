import React from 'react';
import { Menu, Bell, LogOut, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  username?: string;
  notificationCount?: number;
  activeView: string;
  onMenuClick: () => void;
  onDarkModeToggle: () => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'dashboard' | 'predictions' | 'risk' | 'reports' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  username, 
  notificationCount = 0,
  activeView,
  onMenuClick, 
  onDarkModeToggle, 
  onLogout,
  onNavigate
}) => {
  return (
    <header className={`sticky top-0 z-30 border-b shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        
        {/* LEFT SIDE: Logo + Dashboard Link */}
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-lg mr-3 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              💰 Loan Default Predictor
            </h1>
            
            {/* DASHBOARD LINK MOVED TO LEFT */}
            <nav className="hidden md:flex items-center space-x-1">
              <button 
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'home' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                HOME
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                DASHBOARD
              </button>
            </nav>
          </div>
        </div>

        {/* RIGHT SIDE: User + Logout + Icons */}
        <div className="flex items-center space-x-3">
          <span className={`hidden sm:block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Welcome, {username}
          </span>

          <button 
            onClick={onDarkModeToggle}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            LOGOUT
          </button>
        </div>
        
      </div>
    </header>
  );
};
