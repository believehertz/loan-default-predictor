import React from 'react';
import { 
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
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Predictions', icon: BrainCircuit },
  { label: 'Risk Analysis', icon: Target },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ darkMode, onClose }) => {
  const bgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  // REMOVED: const subTextClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex flex-col h-full ${bgClass} border-r`}>
      <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          LoanAI Pro
        </span>
        <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : `hover:bg-gray-100 dark:hover:bg-gray-700 ${textClass}`
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm font-medium mb-1">Pro Plan Active</p>
          <p className="text-xs opacity-90 mb-3">Advanced ML models enabled</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
