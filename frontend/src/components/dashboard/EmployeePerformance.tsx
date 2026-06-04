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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack, Calculate } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface EmployeePerformance {
  employee_id: number;
  username: string;
  email: string;
  total_reviewed: number;
  approved: number;
  rejected: number;
  escalated: number;
  approval_rate: string;
  current_backlog: number;
  total_bonus: number;
}

interface EmployeeBonus {
  id: number;
  employee_id: number;
  bonus_type: string;
  amount: number;
  reason: string;
  period: string | null;
  awarded_by: number | null;
  awarded_at: string;
}

const EmployeePerformance: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1e293b';
  const paperBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : '#ffffff';

  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [bonuses, setBonuses] = useState<EmployeeBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calculateDialogOpen, setCalculateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null);
  const [formData, setFormData] = useState({
    bonus_type: 'PERFORMANCE_BONUS',
    amount: '',
    reason: '',
    period: new Date().toISOString().slice(0, 7) // YYYY-MM
  });
  const [calculatePeriod, setCalculatePeriod] = useState(new Date().toISOString().slice(0, 7));

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/employee-performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformanceData(response.data);
    } catch (err: any) {
      setError('Failed to load performance data: ' + (err.response?.data?.detail || err.message));
    }
  };

  const fetchBonuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/bonuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBonuses(response.data);
    } catch (err: any) {
      setError('Failed to load bonuses: ' + (err.response?.data?.detail || err.message));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPerformanceData(), fetchBonuses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleOpenDialog = (employee: EmployeePerformance) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
    setFormData({
      bonus_type: 'PERFORMANCE_BONUS',
      amount: '',
      reason: '',
      period: new Date().toISOString().slice(0, 7)
    });
  };

  const handleAwardBonus = async () => {
    if (!selectedEmployee) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/bonuses`,
        {
          employee_id: selectedEmployee.employee_id,
          bonus_type: formData.bonus_type,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          period: formData.period
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      handleCloseDialog();
      await Promise.all([fetchPerformanceData(), fetchBonuses()]);
    } catch (err: any) {
      setError('Failed to award bonus: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteBonus = async (bonusId: number) => {
    if (!confirm('Are you sure you want to delete this bonus?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/bonuses/${bonusId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await Promise.all([fetchPerformanceData(), fetchBonuses()]);
    } catch (err: any) {
      setError('Failed to delete bonus: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleCalculateBonuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/calculate-bonuses?period=${calculatePeriod}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCalculateDialogOpen(false);
      await Promise.all([fetchPerformanceData(), fetchBonuses()]);
      
      // Show summary
      const summary = response.data.results.map((r: any) => 
        `${r.username}: $${r.total_bonus} (${r.status})`
      ).join('\n');
      alert(`Bonus calculation complete:\n${summary}`);
    } catch (err: any) {
      setError('Failed to calculate bonuses: ' + (err.response?.data?.detail || err.message));
    }
  };

  const getPerformanceColor = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return 'success';
    if (numRate >= 60) return 'info';
    if (numRate >= 40) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="text"
          onClick={() => navigate('/dashboard')}
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
          Employee Performance & Bonuses
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Performance Stats */}
      <Paper sx={{ bgcolor: paperBg, color: textColor, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Employee Performance Metrics
          </Typography>
          <Button
            variant="contained"
            startIcon={<Calculate />}
            onClick={() => setCalculateDialogOpen(true)}
          >
            Calculate Automated Bonuses
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Employee</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Total Reviewed</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Approved</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Rejected</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Approval Rate</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Backlog</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Total Bonus</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((emp) => (
                <TableRow key={emp.employee_id} hover>
                  <TableCell sx={{ color: textColor }}>{emp.username}</TableCell>
                  <TableCell sx={{ color: textColor }}>{emp.email}</TableCell>
                  <TableCell sx={{ color: textColor }}>{emp.total_reviewed}</TableCell>
                  <TableCell sx={{ color: textColor }}>{emp.approved}</TableCell>
                  <TableCell sx={{ color: textColor }}>{emp.rejected}</TableCell>
                  <TableCell sx={{ color: textColor }}>
                    <Chip
                      label={emp.approval_rate}
                      color={getPerformanceColor(emp.approval_rate) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: textColor }}>{emp.current_backlog}</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>
                    ${emp.total_bonus.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog(emp)}
                    >
                      Award Bonus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Bonus History */}
      <Paper sx={{ bgcolor: paperBg, color: textColor, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Bonus History
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Employee ID</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Period</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Awarded At</TableCell>
                <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bonuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">No bonuses awarded yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bonuses.map((bonus) => (
                  <TableRow key={bonus.id} hover>
                    <TableCell sx={{ color: textColor }}>{bonus.employee_id}</TableCell>
                    <TableCell sx={{ color: textColor }}>
                      <Chip label={bonus.bonus_type} size="small" />
                    </TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>
                      ${bonus.amount.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: textColor }}>{bonus.reason}</TableCell>
                    <TableCell sx={{ color: textColor }}>{bonus.period || 'N/A'}</TableCell>
                    <TableCell sx={{ color: textColor }}>
                      {new Date(bonus.awarded_at + 'Z').toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBonus(bonus.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Award Bonus Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Award Bonus to {selectedEmployee?.username}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Bonus Type"
              value={formData.bonus_type}
              onChange={(e) => setFormData({ ...formData, bonus_type: e.target.value })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="PERFORMANCE_BONUS">Performance Bonus</option>
              <option value="MONTHLY_BONUS">Monthly Bonus</option>
              <option value="QUOTA_BONUS">Quota Bonus</option>
            </TextField>
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Reason"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
            />
            <TextField
              label="Period (YYYY-MM)"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              fullWidth
              placeholder="2024-01"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAwardBonus} variant="contained">
            Award Bonus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calculate Automated Bonuses Dialog */}
      <Dialog open={calculateDialogOpen} onClose={() => setCalculateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Calculate Automated Bonuses</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Bonus Criteria:
              <br />• $10 per loan reviewed
              <br />• $5 per approved loan
              <br />• $20 per 5-star rating, $10 per 4-star, $5 per 3-star
            </Typography>
            <TextField
              label="Period (YYYY-MM)"
              value={calculatePeriod}
              onChange={(e) => setCalculatePeriod(e.target.value)}
              fullWidth
              placeholder="2024-01"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCalculateBonuses} variant="contained">
            Calculate & Award
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeePerformance;
