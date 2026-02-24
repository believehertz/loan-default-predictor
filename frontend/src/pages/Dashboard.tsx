import React, { useState, useEffect, useRef } from 'react';
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

// Import your existing LoanForm
import LoanForm from '../components/LoanForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ActivityTable Component
const ActivityTable: React.FC<{ predictions: Prediction[]; darkMode: boolean; isLoading?: boolean }> = ({ 
  predictions, 
  darkMode, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const getRiskColor = (prob: number) => {
    if (prob >= 0.7) return 'text-emerald-500';
    if (prob >= 0.5) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskBg = (prob: number) => {
    if (prob >= 0.7) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (prob >= 0.5) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Loan Applications</h3>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{predictions.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
            <tr>
              {['Applicant', 'Amount', 'Status', 'Probability'].map((header) => (
                <th key={header} className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {predictions.slice(0, 10).map((pred, idx) => (
              <tr key={idx} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {pred.applicant_name ? pred.applicant_name.charAt(0) : 'A'}
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {pred.applicant_name || `Applicant ${idx + 1}`}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ID: {pred.id || idx + 1}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${pred.loan_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskBg(pred.loan_paid_back_probability)}`}>
                    {pred.loan_paid_back_probability >= 0.7 ? 'Approved' : pred.loan_paid_back_probability >= 0.5 ? 'Pending' : 'Rejected'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getRiskColor(pred.loan_paid_back_probability)}`}>
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
  const [showLoanForm, setShowLoanForm] = useState(false);
  
  const chartsRef = useRef<HTMLDivElement>(null);

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

  const scrollToRiskReport = () => {
    chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const summaryCards = [
    { title: 'Total Predictions', value: stats?.total_predictions || 0, trend: 12.5, icon: BrainCircuit, color: 'blue' as const, prefix: '' },
    { title: 'Total Value Analyzed', value: stats?.total_loan_value || 0, trend: 8.2, icon: DollarSign, color: 'green' as const, prefix: '$' },
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
              <div key={i} className={`rounded-xl p-6 border shadow-sm animate-pulse h-32 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
            ))
          ) : (
            summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} darkMode={darkMode} isLoading={loading} />
            ))
          )}
        </div>

        {/* Quick Actions - NOW ALL FUNCTIONAL */}
        <QuickActions 
          onExportPDF={exportPDF} 
          onAddLoan={() => setShowLoanForm(true)}
          onViewRiskReport={scrollToRiskReport}
        />

        {/* Charts Section */}
        <div ref={chartsRef}>
          <ChartSection 
            riskDistribution={riskDistributionData}
            features={features}
            timeline={timeline}
            darkMode={darkMode}
            isLoading={loading}
          />
        </div>

        {/* Activity Table */}
        <ActivityTable predictions={predictions} darkMode={darkMode} isLoading={loading} />

        {/* Scenario Comparison */}
        <div className={`rounded-xl p-6 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loan Scenario Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Low Risk Profile", income: 80000, credit: 750, emp: "Employed", prob: 0.92 },
              { name: "Medium Risk Profile", income: 45000, credit: 650, emp: "Employed", prob: 0.68 },
              { name: "High Risk Profile", income: 25000, credit: 550, emp: "Unemployed", prob: 0.23 }
            ].map((scenario, idx) => (
              <div key={idx} className={`rounded-xl p-4 border-2 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`} style={{ 
                borderColor: scenario.prob >= 0.7 ? '#10B981' : scenario.prob >= 0.5 ? '#F59E0B' : '#EF4444'
              }}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scenario.name}</h4>
                <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Income: ${scenario.income.toLocaleString()}</p>
                  <p>Credit Score: {scenario.credit}</p>
                  <p>Employment: {scenario.emp}</p>
                </div>
                <div className="mt-3">
                  <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
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

      {/* Loan Form Modal */}
      {showLoanForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Loan Application</h3>
              <button 
                onClick={() => setShowLoanForm(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            <LoanForm 
              onSuccess={() => {
                setShowLoanForm(false);
                fetchDashboardData(); // Refresh data after submission
              }}
              onCancel={() => setShowLoanForm(false)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
