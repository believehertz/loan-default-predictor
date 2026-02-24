import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Feature, TimelinePoint } from '../../types/dashboard';

interface ChartSectionProps {
  riskDistribution: { name: string; value: number; color: string }[];
  features: Feature[];
  timeline: TimelinePoint[];
  darkMode: boolean;
  isLoading?: boolean;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ 
  riskDistribution, 
  features, 
  timeline, 
  darkMode,
  isLoading 
}) => {
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';
  const axisColor = darkMode ? '#9ca3af' : '#6b7280';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${cardBg} rounded-2xl p-6 border h-80 animate-pulse`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Distribution */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskDistribution}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({name, percent}) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {riskDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Top Risk Factors (XGBoost)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={features.slice(0, 5)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="number" stroke={axisColor} />
            <YAxis dataKey="feature" type="category" width={100} stroke={axisColor} />
            <Bar dataKey="importance" fill="#8884d8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline */}
      <div className={`lg:col-span-2 ${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Prediction Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={axisColor} />
            <YAxis domain={[0, 1]} stroke={axisColor} />
            <Line 
              type="monotone" 
              dataKey="probability" 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={{ fill: '#8884d8', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
