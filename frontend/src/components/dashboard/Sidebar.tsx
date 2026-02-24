import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  BrainCircuit, 
  Target, 
  FileText, 
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  darkMode: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: 'home' | 'dashboard' | 'predictions' | 'risk' | 'reports' | 'settings') => void;
}

const navItems = [
  { label: 'Home', key: 'home', icon: Home },           // ADDED HOME
  { label: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
  { label: 'Predictions', key: 'predictions', icon: BrainCircuit },
  { label: 'Risk Analysis', key: 'risk', icon: Target },
  { label: 'Reports', key: 'reports', icon: FileText },
  { label: 'Settings', key: 'settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ darkMode, onClose, activeView, onNavigate }) => {
  return (
    <div className={`flex flex-col h-full border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <span className="text-xl font-bold text-blue-600">LoanAI Pro</span>
        <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key as any)}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm font-medium mb-1">Pro Plan Active</p>
          <p className="text-xs opacity-90 mt-1">Advanced ML models enabled</p>
        </div>
      </div>
    </div>
  );
};
