import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import CountUp from 'react-countup';
// @ts-expect-error canvas-confetti has no TypeScript types
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  FileText, 
  Plus, 
  AlertTriangle,
  Bell,
  LogOut,
  Menu,
  Moon,
  Sun,
  BrainCircuit,
  Target
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Type definitions
interface Stats {
  total_predictions: number;
  total_loan_value: number;
  avg_probability: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

interface Feature {
  feature: string;
  importance: number;
}

interface TimelinePoint {
  date: string;
  probability: number;
}

interface Prediction {
  loan_amount: number;
  loan_paid_back_probability: number;
  applicant_name?: string;
  created_at?: string;
  id?: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Theme classes
  const themeClasses = darkMode ? 'dark bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';

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

  const getRiskColor = (prob: number) => {
    if (prob >= 0.7) return '#10B981'; // emerald-500
    if (prob >= 0.5) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  const getRiskStatus = (prob: number) => {
    if (prob >= 0.7) return 'Low Risk';
    if (prob >= 0.5) return 'Medium Risk';
    return 'High Risk';
  };

  // Transform data for new components
  const summaryCards = [
    {
      title: 'Total Predictions',
      value: stats?.total_predictions || 0,
      trend: 12.5, // Calculate from previous period if available
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

  // Mock notifications based on data
  const notifications = [
    {
      id: '1',
      type: stats?.avg_probability && stats.avg_probability < 0.5 ? 'warning' : 'success',
      title: stats?.avg_probability && stats.avg_probability > 0.9 ? 'High Performance' : 'Risk Alert',
      message: `Average prediction accuracy is ${(stats?.avg_probability || 0 * 100).toFixed(1)}%`,
      time: 'Just now'
    },
    ...(predictions.some(p => p.loan_paid_back_probability < 0.3) ? [{
      id: '2',
      type: 'error' as const,
      title: 'High Risk Loans Detected',
      message: `${predictions.filter(p => p.loan_paid_back_probability < 0.3).length} loans require immediate review`,
      time: '10 min ago'
    }] : [])
  ];

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Left Side */}
        <aside 
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${cardBg} border-r transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                LoanAI Pro
              </span>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {[
                { label: 'Dashboard', icon: Activity, active: true },
                { label: 'Predictions', icon: BrainCircuit },
                { label: 'Risk Analysis', icon: Target },
                { label: 'Reports', icon: FileText },
                { label: 'Settings', icon: Activity },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${item.active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
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
        </aside>

        {/* Main Content Area - Right Side */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className={`sticky top-0 z-30 ${cardBg} backdrop-blur-md border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
                >
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className={`text-2xl font-bold ${textColor}`}>
                  Dashboard
                  <span className={`ml-2 text-sm font-normal ${subTextColor}`}>
                    Welcome back, {user?.username}
                  </span>
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Time Range Selector */}
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className={`hidden md:block px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="1y">Last Year</option>
                </select>

                {/* Dark Mode Toggle */}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    className={`p-2 rounded-lg transition-colors relative ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </button>
                </div>

                {/* Logout - Positioned Far Right */}
                <button 
                  onClick={logout}
                  className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content - Scrollable Area */}
          <main className={`flex-1 overflow-y-auto p-4 lg:p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div id="dashboard-content" className="max-w-7xl mx-auto space-y-6">
              
              {/* Summary Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className={`${cardBg} rounded-2xl p-6 border shadow-sm animate-pulse h-32`} />
                  ))
                ) : (
                  summaryCards.map((card) => {
                    const Icon = card.icon;
                    const colorClasses = {
                      blue: 'from-blue-500 to-blue-600',
                      green: 'from-emerald-500 to-emerald-600',
                      purple: 'from-purple-500 to-purple-600',
                      orange: 'from-orange-500 to-orange-600',
                      red: 'from-rose-500 to-rose-600'
                    }[card.color];

                    return (
                      <div key={card.title} className={`${cardBg} rounded-2xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} text-white shadow-lg`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className={`flex items-center text-sm font-medium ${card.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {card.trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {Math.abs(card.trend)}%
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className={`text-sm font-medium ${subTextColor}`}>{card.title}</p>
                          <h3 className={`text-2xl font-bold ${textColor} mt-1`}>
                            {card.prefix}<CountUp end={card.value} duration={2} separator="," />{card.suffix}
                          </h3>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Add Loan Application', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700' },
                  { label: 'Export PDF Report', icon: Download, color: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600', onClick: exportPDF },
                  { label: 'View Risk Report', icon: AlertTriangle, color: 'bg-amber-600 hover:bg-amber-700' },
                ].map((action) => {
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

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
                  <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Risk Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#1F2937' : '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Feature Importance */}
                <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
                  <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Top Risk Factors (XGBoost)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={features.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis type="number" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis dataKey="feature" type="category" width={100} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#1F2937' : '#ffffff',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="importance" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Timeline - Full Width */}
                <div className={`lg:col-span-2 ${cardBg} rounded-2xl p-6 border shadow-sm`}>
                  <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Prediction Timeline</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis domain={[0, 1]} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#1F2937' : '#ffffff',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      />
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

              {/* Recent Predictions Table */}
              <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                  <h3 className={`text-lg font-semibold ${textColor}`}>Recent Loan Applications</h3>
                  <span className={`text-sm ${subTextColor}`}>{predictions.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <tr>
                        {['Applicant', 'Amount', 'Risk Score', 'Status', 'Probability'].map((header) => (
                          <th key={header} className={`px-6 py-3 text-left text-xs font-medium ${subTextColor} uppercase tracking-wider`}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {loading ? (
                        Array(3).fill(0).map((_, i) => (
                          <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" /></td></tr>
                        ))
                      ) : (
                        predictions.slice(0, 10).map((pred, idx) => (
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
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                pred.loan_paid_back_probability >= 0.7 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                  : pred.loan_paid_back_probability >= 0.5 
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                              }`}>
                                {getRiskStatus(pred.loan_paid_back_probability)}
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold`} style={{ color: getRiskColor(pred.loan_paid_back_probability) }}>
                              {(pred.loan_paid_back_probability * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scenario Comparison (Your Original Feature) */}
              <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
                <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Loan Scenario Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Low Risk Profile", income: 80000, credit: 750, emp: "Employed", prob: 0.92 },
                    { name: "Medium Risk Profile", income: 45000, credit: 650, emp: "Employed", prob: 0.68 },
                    { name: "High Risk Profile", income: 25000, credit: 550, emp: "Unemployed", prob: 0.23 }
                  ].map((scenario, idx) => (
                    <div key={idx} className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl p-4 border-2`} style={{ borderColor: getRiskColor(scenario.prob) }}>
                      <h4 className={`font-semibold ${textColor} mb-2`}>{scenario.name}</h4>
                      <div className={`space-y-1 text-sm ${subTextColor}`}>
                        <p>Income: ${scenario.income.toLocaleString()}</p>
                        <p>Credit Score: {scenario.credit}</p>
                        <p>Employment: {scenario.emp}</p>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${scenario.prob * 100}%`, backgroundColor: getRiskColor(scenario.prob) }} />
                        </div>
                        <p className="text-center mt-2 font-bold" style={{ color: getRiskColor(scenario.prob) }}>
                          {(scenario.prob * 100).toFixed(0)}% Payback Probability
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;