import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Switch, FormControlLabel,
  LinearProgress, Skeleton, Tooltip
} from '@mui/material';
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
import { DarkMode, LightMode, Download } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Dark/Light theme colors
const themes = {
  light: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paper: 'rgba(255, 255, 255, 0.95)',
    text: '#1a1a1a'
  },
  dark: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    paper: 'rgba(30, 30, 46, 0.95)',
    text: '#ffffff'
  }
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const theme = darkMode ? themes.dark : themes.light;

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

      // Confetti if high accuracy
      if (statsRes.data.avg_probability > 0.9) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
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
    if (prob >= 0.7) return '#4caf50';
    if (prob >= 0.5) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.bg,
      p: 3,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <Paper sx={{
        p: 3,
        mb: 3,
        background: theme.paper,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h4" sx={{ color: theme.text, fontWeight: 700 }}>
          📊 Dashboard
        </Typography>

        <Box display="flex" gap={2}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
            label={darkMode ? <DarkMode /> : <LightMode />}
          />
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportPDF}
          >
            Export PDF
          </Button>
        </Box>
      </Paper>

      <div id="dashboard-content">
        {/* Animated Stats Counter */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, background: theme.paper, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.text }}>Total Predictions</Typography>
              <Typography variant="h2" sx={{ color: '#1976d2', fontWeight: 700 }}>
                <CountUp end={stats?.total_predictions || 0} duration={2} />
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, background: theme.paper, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.text }}>Total Value Analyzed</Typography>
              <Typography variant="h2" sx={{ color: '#4caf50', fontWeight: 700 }}>
                $<CountUp end={stats?.total_loan_value || 0} duration={2} separator="," />
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, background: theme.paper, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.text }}>Avg Accuracy</Typography>
              <Typography variant="h2" sx={{ color: '#ff9800', fontWeight: 700 }}>
                <CountUp end={(stats?.avg_probability || 0) * 100} duration={2} decimals={1} />%
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Risk Distribution Pie Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, background: theme.paper, height: 400 }}>
              <Typography variant="h6" sx={{ color: theme.text, mb: 2 }}>
                Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Low Risk', value: stats?.risk_distribution?.low || 0, color: '#4caf50' },
                      { name: 'Medium Risk', value: stats?.risk_distribution?.medium || 0, color: '#ff9800' },
                      { name: 'High Risk', value: stats?.risk_distribution?.high || 0, color: '#f44336' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { color: '#4caf50' },
                      { color: '#ff9800' },
                      { color: '#f44336' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Feature Importance Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, background: theme.paper, height: 400 }}>
              <Typography variant="h6" sx={{ color: theme.text, mb: 2 }}>
                Top Risk Factors (XGBoost Model)
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={features.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={100} />
                  <RechartsTooltip />
                  <Bar dataKey="importance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Prediction Timeline */}
        <Paper sx={{ p: 3, mb: 3, background: theme.paper }}>
          <Typography variant="h6" sx={{ color: theme.text, mb: 2 }}>
            Prediction Timeline
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="probability" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Risk Heatmap */}
        <Paper sx={{ p: 3, mb: 3, background: theme.paper }}>
          <Typography variant="h6" sx={{ color: theme.text, mb: 2 }}>
            Prediction Risk Heatmap
          </Typography>
          <Grid container spacing={1}>
            {predictions.slice(0, 20).map((pred, idx) => (
              <Grid size={{ xs: 3, sm: 2, md: 1 }} key={idx}>
                <Tooltip title={`$${pred.loan_amount} - ${(pred.loan_paid_back_probability * 100).toFixed(0)}%`}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 60,
                      backgroundColor: getRiskColor(pred.loan_paid_back_probability),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)', transition: '0.2s' }
                    }}
                  >
                    {pred.loan_amount > 1000 ? `${(pred.loan_amount/1000).toFixed(0)}k` : pred.loan_amount}
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Scenario Comparison */}
        <Paper sx={{ p: 3, background: theme.paper }}>
          <Typography variant="h6" sx={{ color: theme.text, mb: 2 }}>
            Loan Scenario Comparison
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: "Low Risk Profile", income: 80000, credit: 750, emp: "Employed", prob: 0.92 },
              { name: "Medium Risk Profile", income: 45000, credit: 650, emp: "Employed", prob: 0.68 },
              { name: "High Risk Profile", income: 25000, credit: 550, emp: "Unemployed", prob: 0.23 }
            ].map((scenario, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Paper sx={{
                  p: 2,
                  background: `rgba(${scenario.prob > 0.7 ? '76, 175, 80' : scenario.prob > 0.5 ? '255, 152, 0' : '244, 67, 54'}, 0.1)`,
                  border: `2px solid ${getRiskColor(scenario.prob)}`
                }}>
                  <Typography variant="h6" sx={{ color: theme.text }}>{scenario.name}</Typography>
                  <Typography sx={{ color: theme.text }}>Income: ${scenario.income.toLocaleString()}</Typography>
                  <Typography sx={{ color: theme.text }}>Credit: {scenario.credit}</Typography>
                  <Typography sx={{ color: theme.text }}>Status: {scenario.emp}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={scenario.prob * 100}
                    sx={{ mt: 2, height: 10, borderRadius: 5 }}
                  />
                  <Typography align="center" sx={{ mt: 1, color: getRiskColor(scenario.prob), fontWeight: 'bold' }}>
                    {(scenario.prob * 100).toFixed(0)}% Payback Probability
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </div>
    </Box>
  );
};

export default Dashboard;