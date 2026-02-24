import React from 'react';
import { Download, Plus, AlertTriangle } from 'lucide-react';

interface QuickActionsProps {
  onExportPDF: () => void;
  // REMOVED: darkMode prop since it's not used
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onExportPDF }) => {
  const actions = [
    { label: 'Add Loan Application', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Export PDF Report', icon: Download, color: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600', onClick: onExportPDF },
    { label: 'View Risk Report', icon: AlertTriangle, color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex items-center px-6 py-3 ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 font-medium`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
};
