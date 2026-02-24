import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  username?: string;
  notificationCount?: number;
  onDarkModeToggle: () => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  darkMode,
  username,
  notificationCount,
  onDarkModeToggle,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        <aside 
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar darkMode={darkMode} onClose={() => setSidebarOpen(false)} />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header 
            darkMode={darkMode}
            username={username}
            notificationCount={notificationCount}
            onMenuClick={() => setSidebarOpen(true)}
            onDarkModeToggle={onDarkModeToggle}
            onLogout={onLogout}
          />
          
          <main className={`flex-1 overflow-y-auto p-4 lg:p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};