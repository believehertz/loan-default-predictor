import React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  trend: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  prefix?: string;
  suffix?: string;
  darkMode: boolean;
  isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
  darkMode,
  isLoading = false,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }[color];

  if (isLoading) {
    return (
      <div className={`rounded-xl p-6 border shadow-sm animate-pulse h-32 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
    );
  }

  return (
    <div className={`rounded-xl p-6 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <h3 className="text-2xl font-bold mt-1">
          {prefix}{value.toLocaleString()}{suffix}
        </h3>
      </div>
    </div>
  );
};
