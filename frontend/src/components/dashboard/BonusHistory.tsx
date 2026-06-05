import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = (() => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${base.replace(/\/+$/, '')}/api`;
})();

interface BonusRecord {
  id: number;
  employee_id: number;
  bonus_type: string;
  amount: number;
  reason: string;
  period: string | null;
  awarded_by: number | null;
  awarded_at: string;
}

interface Props {
  darkMode: boolean;
}

const BonusHistory: React.FC<Props> = ({ darkMode }) => {
  const textColor = darkMode ? '#ffffff' : '#1e293b';
  const paperBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : '#ffffff';
  const alternateRowBg = darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  
  const [bonuses, setBonuses] = useState<BonusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBonuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/loans/my-bonuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBonuses(response.data);
    } catch (err: any) {
      setError('Failed to load bonus history: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
    
    // Refresh bonus history every 10 seconds to catch real-time updates
    const interval = setInterval(fetchBonuses, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate cumulative totals
  const bonusesWithCumulative = bonuses.map((bonus, index) => {
    const cumulativeTotal = bonuses
      .slice(0, index + 1)
      .reduce((sum, b) => sum + b.amount, 0);
    return { ...bonus, cumulativeTotal };
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ bgcolor: paperBg, color: textColor, p: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Bonus History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Bonus Type</TableCell>
              <TableCell align="right" sx={{ color: textColor, fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell align="right" sx={{ color: textColor, fontWeight: 'bold' }}>Cumulative Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bonusesWithCumulative.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No bonuses awarded yet</Typography>
                </TableCell>
              </TableRow>
            ) : (
              bonusesWithCumulative.map((bonus, index) => (
                <TableRow 
                  key={bonus.id} 
                  hover 
                  sx={{ 
                    backgroundColor: index % 2 === 0 ? 'transparent' : alternateRowBg,
                    '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' } 
                  }}
                >
                  <TableCell sx={{ color: textColor }}>
                    {new Date(bonus.awarded_at + 'Z').toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ color: textColor, maxWidth: 300 }}>
                    <Typography variant="body2">{bonus.reason}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: textColor }}>
                    <Chip 
                      label={bonus.bonus_type} 
                      size="small"
                      sx={{ 
                        bgcolor: bonus.bonus_type === 'PERFORMANCE_BONUS' ? '#4caf50' : '#2196f3',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.1em' }}>
                    +${bonus.amount.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#2196f3', fontWeight: 'bold', fontSize: '1.1em' }}>
                    ${bonus.cumulativeTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {bonusesWithCumulative.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Total Bonuses Earned: <span style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#2196f3' }}>
              ${bonusesWithCumulative[bonusesWithCumulative.length - 1].cumulativeTotal.toFixed(2)}
            </span>
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default BonusHistory;
