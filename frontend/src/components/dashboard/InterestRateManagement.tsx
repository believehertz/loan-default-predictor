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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface InterestRate {
  id: number;
  loan_purpose: string;
  interest_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface Props {
  darkMode: boolean;
}

const InterestRateManagement: React.FC<Props> = ({ darkMode }) => {
  const navigate = useNavigate();
  const textColor = darkMode ? '#ffffff' : '#000000';
  const paperBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : '#ffffff';

  const [rates, setRates] = useState<InterestRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<InterestRate | null>(null);
  const [formData, setFormData] = useState({ loan_purpose: '', interest_rate: '' });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/interest-rates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRates(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load interest rates: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rate: InterestRate | null = null) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({ loan_purpose: rate.loan_purpose, interest_rate: rate.interest_rate.toString() });
    } else {
      setEditingRate(null);
      setFormData({ loan_purpose: '', interest_rate: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRate(null);
    setFormData({ loan_purpose: '', interest_rate: '' });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingRate) {
        await axios.put(
          `${API_URL}/admin/interest-rates/${editingRate.id}`,
          { interest_rate: parseFloat(formData.interest_rate), is_active: true },
          { headers }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/interest-rates`,
          { loan_purpose: formData.loan_purpose, interest_rate: parseFloat(formData.interest_rate) },
          { headers }
        );
      }

      handleCloseDialog();
      fetchRates();
    } catch (err: any) {
      setError('Failed to save interest rate: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this interest rate configuration?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/interest-rates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRates();
    } catch (err: any) {
      setError('Failed to delete interest rate: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="text"
          onClick={() => navigate('/admin-dashboard')}
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
          Interest Rate Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ bgcolor: paperBg, color: textColor, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Configured Interest Rates</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Rate
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : rates.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">No interest rates configured yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Loan Purpose</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Interest Rate (%)</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id} hover>
                    <TableCell sx={{ color: textColor }}>{rate.loan_purpose}</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>{rate.interest_rate}%</TableCell>
                    <TableCell>
                      <Chip
                        label={rate.is_active ? 'Active' : 'Inactive'}
                        color={rate.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: textColor }}>
                      {new Date(rate.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(rate)}
                        sx={{ color: textColor }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(rate.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRate ? 'Edit Interest Rate' : 'Add Interest Rate'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Loan Purpose"
              value={formData.loan_purpose}
              onChange={(e) => setFormData({ ...formData, loan_purpose: e.target.value })}
              disabled={!!editingRate}
              helperText={editingRate ? 'Cannot change loan purpose after creation' : ''}
            />
            <TextField
              fullWidth
              label="Interest Rate (%)"
              type="number"
              value={formData.interest_rate}
              onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              inputProps={{ step: '0.01', min: '0', max: '100' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterestRateManagement;
