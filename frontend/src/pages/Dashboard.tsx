import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import CountUp from 'react-countup';
// @ts-expect-error canvas-confetti has no TypeScript types
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, DollarSign, Target, FileText } from 'lucide-react';

import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { ChartSection } from '../components/dashboard/ChartSection';
import { ActivityTable } from '../components/dashboard/ActivityTable';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Stats, Feature, TimelinePoint, Prediction } from '../types/dashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, featuresRes, timelineRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/stats`, { headers }),
        axios.get(`${API_URL}/feature-importance`, { headers }),
        axios.get(`${API_URL}/timeline`, { headers }),
        axios.get(`${API_URL}/history`, { headers })
      ]);

      setStats(statsRes.data);
      setFeatures(featuresRes.data.features || []);
      setTimeline(timelineRes.data || []);
      setPredictions(historyRes.data || []);

      if (statsRes.data.avg_probability > 0.9) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(`loan-report-${user?.username}.pdf`);
  };

  const summaryCards = [
    {
      title: 'Total Predictions',
      value: stats?.total_predictions || 0,
      trend: 12.5,
      icon: BrainCircuit,
      color: 'blue' as const,
      prefix: ''
    },
    {
      title: 'Total Value Analyzed',
      value: stats?.total_loan_value || 0,
      trend: 8.2,
      icon: DollarSign,
      color: 'green' as const,
      prefix: '$'
    },
    {
      title: 'Avg Accuracy',
      value: Math.round((stats?.avg_probability || 0) * 100),
      trend: 5.3,
      icon: Target,
      color: 'purple' as const,
      suffix: '%'
    },
    {
      title: 'Active Loans',
      value: predictions.length,
      trend: -2.1,
      icon: FileText,
      color: 'orange' as const
    }
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: stats?.risk_distribution?.low || 0, color: '#10B981' },
    { name: 'Medium Risk', value: stats?.risk_distribution?.medium || 0, color: '#F59E0B' },
    { name: 'High Risk', value: stats?.risk_distribution?.high || 0, color: '#EF4444' }
  ];

  return (
    <DashboardLayout 
      darkMode={darkMode}
      username={user?.username}
      notificationCount={predictions.filter(p => p.loan_paid_back_probability < 0.3).length}
      onDarkModeToggle={() => setDarkMode(!darkMode)}
      onLogout={logout}
    >
      <div id="dashboard-content" className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm animate-pulse h-32`} />
            ))
          ) : (
            summaryCards.map((card) => (
              <SummaryCard 
                key={card.title} 
                {...card} 
                darkMode={darkMode} 
                isLoading={loading} 
              />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions onExportPDF={exportPDF} darkMode={darkMode} />

        {/* Charts */}
        <ChartSection 
          riskDistribution={riskDistributionData}
          features={features}
          timeline={timeline}
          darkMode={darkMode}
          isLoading={loading}
        />

        {/* Activity Table */}
        <ActivityTable 
          predictions={predictions} 
          darkMode={darkMode} 
          isLoading={loading} 
        />

        {/* Scenario Comparison Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
            Loan Scenario Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Low Risk Profile", income: 80000, credit: 750, emp: "Employed", prob: 0.92 },
              { name: "Medium Risk Profile", income: 45000, credit: 650, emp: "Employed", prob: 0.68 },
              { name: "High Risk Profile", income: 25000, credit: 550, emp: "Unemployed", prob: 0.23 }
            ].map((scenario, idx) => (
              <div key={idx} className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl p-4 border-2`} style={{ 
                borderColor: scenario.prob >= 0.7 ? '#10B981' : scenario.prob >= 0.5 ? '#F59E0B' : '#EF4444'
              }}>
                <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>{scenario.name}</h4>
                <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Income: ${scenario.income.toLocaleString()}</p>
                  <p>Credit Score: {scenario.credit}</p>
                  <p>Employment: {scenario.emp}</p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-1000" style={{ 
                      width: `${scenario.prob * 100}%`, 
                      backgroundColor: scenario.prob >= 0.7 ? '#10B981' : scenario.prob >= 0.5 ? '#F59E0B' : '#EF4444'
                    }} />
                  </div>
                  <p className="text-center mt-2 font-bold" style={{ 
                    color: scenario.prob >= 0.7 ? '#10B981' : scenario.prob >= 0.5 ? '#F59E0B' : '#EF4444'
                  }}>
                    {(scenario.prob * 100).toFixed(0)}% Payback Probability
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
