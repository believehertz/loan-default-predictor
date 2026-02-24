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

// Simple Activity Table component inline to avoid missing file error
const ActivityTable: React.FC<{ predictions: Prediction[]; darkMode: boolean; isLoading?: boolean }> = ({ 
  predictions, 
  darkMode, 
  isLoading 
}) => {
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const headerBg = darkMode ? 'bg-gray-700/50' : 'bg-gray-50';

  const getRiskColor = (prob: number) => {
    if (prob >= 0.7) return '#10B981';
    if (prob >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskStatus = (prob: number) => {
    if (prob >= 0.7) return 'Low Risk';
    if (prob >= 0.5) return 'Medium Risk';
    return 'High Risk';
  };

  const getStatusStyle = (prob: number) => {
    if (prob >= 0.7) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (prob >= 0.5) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
  };

  if (isLoading) {
    return (
      <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden`}>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <h3 className={`text-lg font-semibold ${textColor}`}>Recent Loan Applications</h3>
        <span className={`text-sm ${subTextColor}`}>{predictions.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={headerBg}>
            <tr>
              {['Applicant', 'Amount', 'Risk Score', 'Status', 'Probability'].map((header) => (
                <th key={header} className={`px-6 py-3 text-left text-xs font-medium ${subTextColor} uppercase tracking-wider`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {predictions.slice(0, 10).map((pred, idx) => (
              <tr key={idx} className={`hover:${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {pred.applicant_name ? pred.applicant_name.charAt(0) : 'A'}
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${textColor}`}>{pred.applicant_name || `Applicant ${idx + 1}`}</div>
                      <div className={`text-sm ${subTextColor}`}>ID: {pred.id || idx + 1}</div>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${textColor}`}>
                  ${pred.loan_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${pred.loan_paid_back_probability * 100}%` }}
                      />
                    </div>
                    <span className={`ml-2 text-sm ${textColor}`}>{(pred.loan_paid_back_probability * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(pred.loan_paid_back_probability)}`}>
                    {getRiskStatus(pred.loan_paid_back_probability)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: getRiskColor(pred.loan_paid_back_probability) }}>
                  {(pred.loan_paid_back_probability * 100).toFixed(1)}%
                </td>
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
