import React, { useState, useEffect, useRef } from 'react';
// @ts-expect-error canvas-confetti has no TypeScript types
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, DollarSign, Target, FileText, TrendingUp, Download, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';

import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { ChartSection } from '../components/dashboard/ChartSection';
import { QuickActions } from '../components/dashboard/QuickActions';
import HistoryList from '../components/HistoryList';
import type { Stats, Feature, TimelinePoint, Prediction } from '../types/dashboard';

// Import your existing LoanForm
import LoanForm from '../components/LoanForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Home View Component (LoanForm as main view)
const HomeView: React.FC<{ darkMode: boolean; user?: any; onNewPrediction: (data: any) => void }> = ({ 
  darkMode, 
  user,
  onNewPrediction 
}) => {
  return (
    <div className={`min-h-[calc(100vh-64px)] py-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to LoanAI Pro
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter loan details below to get an instant AI-powered prediction
          </p>
        </div>
        
        <div className={darkMode ? 'dark' : ''}>
          <LoanForm 
            onResult={(data) => {
              onNewPrediction(data);
            }} 
          />
        </div>
      </div>
    </div>
  );
};

// Predictions View Component
const PredictionsView: React.FC<{ darkMode: boolean; onNewPrediction: () => void; predictions: Prediction[]; loading: boolean }> = ({
  darkMode,
  onNewPrediction,
  predictions,
  loading
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Loan Predictions</h2>
        <button 
          onClick={onNewPrediction}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          New Prediction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Predictions</h3>
          <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
        </div>
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-2">High Risk</h3>
          <p className="text-3xl font-bold text-red-500">
            {predictions.filter(p => p.loan_paid_back_probability < 0.5).length}
          </p>
        </div>
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-2">Avg Probability</h3>
          <p className="text-3xl font-bold text-emerald-500">
            {predictions.length > 0 
              ? (predictions.reduce((acc, p) => acc + p.loan_paid_back_probability, 0) / predictions.length * 100).toFixed(1) 
              : 0}%
          </p>
        </div>
      </div>

      <HistoryList items={predictions} darkMode={darkMode} loading={loading} />
    </div>
  );
};

// Risk Analysis View Component
const RiskAnalysisView: React.FC<{ darkMode: boolean; features: Feature[]; stats: Stats | null; loading: boolean }> = ({
  darkMode,
  features,
  stats,
  loading
}) => {
  const riskDistributionData = [
    { name: 'Low Risk', value: stats?.risk_distribution?.low || 0, color: '#10B981' },
    { name: 'Medium Risk', value: stats?.risk_distribution?.medium || 0, color: '#F59E0B' },
    { name: 'High Risk', value: stats?.risk_distribution?.high || 0, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Risk Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection 
          riskDistribution={riskDistributionData}
          features={features}
          timeline={[]}
          darkMode={darkMode}
          isLoading={loading}
        />
      </div>

      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">Risk Factors Explained</h3>
        <div className="space-y-3">
          {features.slice(0, 5).map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature.feature}</span>
              <div className="flex items-center">
                <div className={`w-32 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-2 rounded-full bg-purple-500" 
                    style={{ width: `${feature.importance * 100}%` }}
                  />
                </div>
                <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(feature.importance * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reports View Component
const ReportsView: React.FC<{ darkMode: boolean; onExportPDF: () => void; stats: Stats | null }> = ({
  darkMode,
  onExportPDF,
  stats
}) => {
  const reports = [
    { 
      title: 'Monthly Performance Report', 
      description: 'Comprehensive analysis of loan performance metrics',
      icon: FileText,
      action: onExportPDF 
    },
    { 
      title: 'Risk Assessment Report', 
      description: 'Detailed risk factor analysis and predictions',
      icon: AlertTriangle,
      action: () => alert('Risk report generated!') 
    },
    { 
      title: 'Export All Data (CSV)', 
      description: 'Download complete dataset for offline analysis',
      icon: Download,
      action: () => alert('CSV export started!') 
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reports & Exports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${
                darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={report.action}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className={`text-lg font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {report.title}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {report.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Predictions</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.total_predictions || 0}</p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${(stats?.total_loan_value || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Accuracy</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{((stats?.avg_probability || 0) * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Risk Score</p>
            <p className={`text-2xl font-bold ${stats?.avg_probability && stats.avg_probability > 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {stats?.avg_probability && stats.avg_probability > 0.7 ? 'Low' : 'Medium'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView: React.FC<{ 
  darkMode: boolean; 
  onToggleDarkMode: () => void;
  onLogout: () => void;
  user?: any;
}> = ({
  darkMode,
  onToggleDarkMode,
  onLogout,
  user
}) => {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
      
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-6">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Toggle between light and dark theme
            </p>
          </div>
          <button 
            onClick={onToggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              darkMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-6">Account</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Username</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.username || 'Guest'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-6 text-red-500">Danger Zone</h3>
        <button 
          onClick={onLogout}
          className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
        >
          Logout
        </button>
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
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'predictions' | 'risk' | 'reports' | 'settings'>('home');
  
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

  const handleNewPrediction = (data: any) => {
    const newPrediction: Prediction = {
      id: Date.now().toString(),
      loan_amount: data.loan_amount || 0,
      loan_paid_back_probability: data.probability || data.loan_paid_back_probability || 0,
      credit_score: data.credit_score || 0,
      applicant_name: user?.username || 'New User',
      created_at: new Date().toISOString(),
      status: data.prediction === 'Approved' || (data.probability > 0.7) ? 'approved' : 
              data.probability > 0.5 ? 'pending' : 'rejected'
    };
    
    setPredictions(prev => [newPrediction, ...prev]);
    
    setTimeout(() => {
      setActiveView('dashboard');
      fetchDashboardData();
    }, 1500);
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
    setActiveView('dashboard');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <HomeView 
            darkMode={darkMode}
            user={user}
            onNewPrediction={handleNewPrediction}
          />
        );
      
      case 'predictions':
        return (
          <PredictionsView 
            darkMode={darkMode} 
            onNewPrediction={() => setActiveView('home')}
            predictions={predictions}
            loading={loading}
          />
        );
      
      case 'risk':
        return (
          <RiskAnalysisView 
            darkMode={darkMode}
            features={features}
            stats={stats}
            loading={loading}
          />
        );
      
      case 'reports':
        return (
          <ReportsView 
            darkMode={darkMode}
            onExportPDF={exportPDF}
            stats={stats}
          />
        );
      
      case 'settings':
        return (
          <SettingsView 
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onLogout={logout}
            user={user}
          />
        );
      
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className={`rounded-xl p-6 border shadow-sm animate-pulse h-32 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
                ))
              ) : (
                [
                  { title: 'Total Predictions', value: stats?.total_predictions || 0, trend: 12.5, icon: BrainCircuit, color: 'blue' as const, prefix: '' },
                  { title: 'Total Value Analyzed', value: stats?.total_loan_value || 0, trend: 8.2, icon: DollarSign, color: 'green' as const, prefix: '$' },
                  { title: 'Avg Accuracy', value: Math.round((stats?.avg_probability || 0) * 100), trend: 5.3, icon: Target, color: 'purple' as const, suffix: '%' },
                  { title: 'Active Loans', value: predictions.length, trend: -2.1, icon: FileText, color: 'orange' as const }
                ].map((card) => (
                  <SummaryCard key={card.title} {...card} darkMode={darkMode} isLoading={loading} />
                ))
              )}
            </div>

            <QuickActions 
              onExportPDF={exportPDF} 
              onAddLoan={() => setActiveView('home')}
              onViewRiskReport={scrollToRiskReport}
            />

            <div ref={chartsRef}>
              <ChartSection 
                riskDistribution={[
                  { name: 'Low Risk', value: stats?.risk_distribution?.low || 0, color: '#10B981' },
                  { name: 'Medium Risk', value: stats?.risk_distribution?.medium || 0, color: '#F59E0B' },
                  { name: 'High Risk', value: stats?.risk_distribution?.high || 0, color: '#EF4444' }
                ]}
                features={features}
                timeline={timeline}
                darkMode={darkMode}
                isLoading={loading}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Loan Applications</h3>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{predictions.length} total</span>
              </div>
              <HistoryList items={predictions} darkMode={darkMode} loading={loading} />
            </div>

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
        );
    }
  };

  return (
    <DashboardLayout 
      darkMode={darkMode}
      username={user?.username}
      notificationCount={predictions.filter(p => p.loan_paid_back_probability < 0.3).length}
      onDarkModeToggle={() => setDarkMode(!darkMode)}
      onLogout={logout}
      activeView={activeView}
      onNavigate={setActiveView}
    >
      <div id="dashboard-content" className={activeView === 'home' ? '' : 'space-y-6'}>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
