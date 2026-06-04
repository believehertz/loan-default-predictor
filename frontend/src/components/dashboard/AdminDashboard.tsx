import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress, Alert, Chip } from '@mui/material';
import { Group, TrendingUp, Security, Assessment } from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_loans: number;
  pending_loans: number;
  approved_loans: number;
  rejected_loans: number;
  total_loan_amount: number;
  high_risk_loans: number;
  approval_rate: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  details: string;
  created_at: string;
}

interface Props {
  darkMode: boolean;
}

const AdminDashboard: React.FC<Props> = ({ darkMode }) => {
  const textColor = darkMode ? '#ffffff' : '#000000';
  const paperBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : '#ffffff';
  const dividerColor = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState<string>('—');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, activityRes, modelRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard-stats`, { headers }),
        axios.get(`${API_URL}/admin/recent-activity?limit=8`, { headers }),
        axios.get(`${API_URL}/model-info`).catch(() => ({ data: { accuracy: null } })),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      if (modelRes.data?.accuracy) setModelAccuracy(modelRes.data.accuracy);
    } catch (err: any) {
      setError('Failed to load dashboard data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string): any => {
    if (action.includes('APPROVED') || action.includes('ACTIVATED')) return 'success';
    if (action.includes('REJECTED') || action.includes('DELETED') || action.includes('DEACTIVATED')) return 'error';
    if (action.includes('ESCALATED') || action.includes('UPDATED')) return 'warning';
    if (action.includes('CREATED') || action.includes('OVERRIDE')) return 'info';
    return 'default';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr + 'Z');
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: textColor }}>
        System Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Stat Cards ── */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="text.secondary" variant="subtitle2">Total Users</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? '—' : (stats?.total_users ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Group color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="text.secondary" variant="subtitle2">System Predictions</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? '—' : (stats?.total_loans ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Assessment color="info" sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="text.secondary" variant="subtitle2">Model Accuracy</Typography>
                <Typography variant="h4" fontWeight="bold">{modelAccuracy}</Typography>
              </Box>
              <TrendingUp color="success" sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="text.secondary" variant="subtitle2">System Health</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">Optimal</Typography>
              </Box>
              <Security color="success" sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>

        {/* ── Recent System Activity (live) ── */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: paperBg,
              color: textColor,
              borderRadius: 2,
              height: 300,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent System Activity
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                <CircularProgress size={32} />
              </Box>
            ) : recentActivity.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No activity logged yet.
              </Typography>
            ) : (
              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {recentActivity.map((log) => (
                  <Box
                    key={log.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.8,
                      borderBottom: `1px solid ${dividerColor}`,
                    }}
                  >
                    <Chip
                      label={log.action}
                      color={getActionColor(log.action)}
                      size="small"
                      sx={{ fontSize: '0.6rem', height: 20, flexShrink: 0 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        opacity: 0.85,
                        color: textColor,
                      }}
                    >
                      {log.details}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', flexShrink: 0 }}
                    >
                      {formatTime(log.created_at)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ── Quick Actions ── */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button variant="contained" href="/users">Manage Users & Employees</Button>
              <Button variant="outlined" href="/interest-rates">Manage Interest Rates</Button>
              <Button variant="outlined" href="/reports">View System Reports</Button>
              <Button variant="outlined" href="/settings">System Settings</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
