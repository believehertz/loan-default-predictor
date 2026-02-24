import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  username?: string;
  notificationCount?: number;
  onDarkModeToggle: () => void;
  onLogout: () => void;
  activeView: string;
  onNavigate: (view: 'home' | 'dashboard' | 'predictions' | 'risk' | 'reports' | 'settings') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  darkMode,
  username,
  notificationCount,
  onDarkModeToggle,
  onLogout,
  activeView,
  onNavigate
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          darkMode={darkMode} 
          onClose={() => setSidebarOpen(false)} 
          activeView={activeView}
          onNavigate={(view) => {
            onNavigate(view);
            setSidebarOpen(false);
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          darkMode={darkMode}
          username={username}
          notificationCount={notificationCount}
          activeView={activeView}
          onMenuClick={() => setSidebarOpen(true)}
          onDarkModeToggle={onDarkModeToggle}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />
        
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${activeView === 'home' ? 'p-0' : 'p-4 lg:p-8'}`}>
          <div className={activeView === 'home' ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};