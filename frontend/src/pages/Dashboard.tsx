import React, { useState, useEffect } from 'react';
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
import { QuickActions } from '../components/dashboard/QuickActions';
import type { Stats, Feature, TimelinePoint, Prediction } from '../types/dashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Inline ActivityTable component
const ActivityTable: React.FC<{ predictions: Prediction[]; darkMode: boolean; isLoading?: boolean }> = ({ 
  predictions, 
  darkMode, 
  isLoading 
}) => {
  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;
  }

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold">Recent Applications</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {predictions.slice(0, 5).map((pred, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4">{pred.applicant_name || `User ${idx + 1}`}</td>
                <td className="px-6 py-4">${pred.loan_amount.toLocaleString()}</td>
                <td className="px-6 py-4">{(pred.loan_paid_back_probability * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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
    { title: 'Total Predictions', value: stats?.total_predictions || 0, trend: 12.5, icon: BrainCircuit, color: 'blue' as const, prefix: '' },
    { title: 'Total Value', value: stats?.total_loan_value || 0, trend: 8.2, icon: DollarSign, color: 'green' as const, prefix: '$' },
    { title: 'Avg Accuracy', value: Math.round((stats?.avg_probability || 0) * 100), trend: 5.3, icon: Target, color: 'purple' as const, suffix: '%' },
    { title: 'Active Loans', value: predictions.length, trend: -2.1, icon: FileText, color: 'orange' as const }
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
              <div key={i} className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))
          ) : (
            summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} darkMode={darkMode} isLoading={loading} />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions onExportPDF={exportPDF} />

        {/* Charts */}
        <ChartSection 
          riskDistribution={riskDistributionData}
          features={features}
          timeline={timeline}
          darkMode={darkMode}
          isLoading={loading}
        />

        {/* Activity Table */}
        <ActivityTable predictions={predictions} darkMode={darkMode} isLoading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
