import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

const AdminSystemDashboard: React.FC<Props> = ({ darkMode: _ }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const paperBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : '#ffffff';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/audit-logs?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setAuditLogs(logsRes.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load dashboard data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string): any => {
    if (action.includes('APPROVED')) return 'success';
    if (action.includes('REJECTED')) return 'error';
    if (action.includes('ESCALATED')) return 'warning';
    if (action.includes('CREATED')) return 'info';
    return 'default';
  };

  const StatCard = ({ title, value }: { title: string; value: any }) => (
    <Card sx={{ bgcolor: paperBg, color: textColor }}>
      <CardContent>
        <Typography color="textSecondary" variant="subtitle2">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="text"
            onClick={() => navigate('/dashboard')}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
            System Dashboard
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <>
          {/* Key Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Users" value={stats.total_users} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Users" value={stats.active_users} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Loans" value={stats.total_loans} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Pending Review" value={stats.pending_loans} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Approved" value={stats.approved_loans} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Rejected" value={stats.rejected_loans} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Loan Amount" 
                value={`$${(stats.total_loan_amount / 1000000).toFixed(2)}M`} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="High Risk Loans" value={stats.high_risk_loans} />
            </Grid>
          </Grid>

          {/* Quick Stats Box */}
          <Paper sx={{ bgcolor: paperBg, color: textColor, p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Quick Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Approval Rate
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {stats.approval_rate}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Active Users
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {((stats.active_users / stats.total_users) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Audit Logs */}
          <Paper sx={{ bgcolor: bgColor, color: textColor, height: '14cm', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
              <Typography variant="h6" fontWeight="bold">
                Recent System Activity
              </Typography>
            </Box>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Resource</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Details</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">No activity logged yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log: AuditLog) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Chip
                            label={log.action}
                            color={getActionColor(log.action) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: textColor }}>
                          {log.resource_type}
                          {log.resource_id && ` #${log.resource_id}`}
                        </TableCell>
                        <TableCell sx={{ color: textColor }}>
                          <Typography variant="caption">{log.details}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: textColor }}>
                          <Typography variant="caption">
                            {new Date(log.created_at + 'Z').toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : null}
    </Box>
  );
};

export default AdminSystemDashboard;
