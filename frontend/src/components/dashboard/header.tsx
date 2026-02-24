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

export const header: React.FC<HeaderProps> = ({ 
  darkMode, 
  username, 
  notificationCount = 0,
  onMenuClick, 
  onDarkModeToggle, 
  onLogout 
}) => {
  return (
    <header className={`sticky top-0 z-30 border-b shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-lg mr-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back, {username}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onDarkModeToggle}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          <button 
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm ml-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};import React from 'react';
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
  return (
    <header className={`sticky top-0 z-30 border-b shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-lg mr-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back, {username}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onDarkModeToggle}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          <button 
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm ml-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
