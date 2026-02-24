import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

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
  const animatedValue = useCountUp(isLoading ? 0 : value, 1500, !isLoading);
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-rose-500 to-rose-600'
  }[color];

  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (isLoading) {
    return (
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm animate-pulse h-32`} />
    );
  }

  return (
    <div className={`${cardBg} rounded-2xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-sm font-medium ${subTextColor}`}>{title}</p>
        <h3 className={`text-2xl font-bold ${textColor} mt-1`}>
          {prefix}{animatedValue.toLocaleString()}{suffix}
        </h3>
      </div>
    </div>
  );
};
