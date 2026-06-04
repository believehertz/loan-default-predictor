import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

interface HistoryItem {
  id?: string;
  loan_amount: number;
  credit_score: number; // Required field
  loan_paid_back_probability?: number;
  default_probability?: number;
  is_default_predicted?: boolean;
  prediction?: string;
  created_at?: string;
  applicant_name?: string;
}

interface HistoryListProps {
  items?: HistoryItem[];           // Optional: pass data from parent
  darkMode?: boolean;              // Optional: dark mode support
  loading?: boolean;               // Optional: loading state from parent
  refreshTrigger?: number;         // Optional: increment to refresh
}

const HistoryList: React.FC<HistoryListProps> = ({ 
  items: propItems, 
  darkMode = false, 
  loading: propLoading,
  refreshTrigger 
}) => {
  const [internalHistory, setInternalHistory] = useState<HistoryItem[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  // Use props if provided, otherwise fetch internally
  const history = propItems || internalHistory;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  useEffect(() => {
    // Only fetch internally if no items prop provided
    if (!propItems) {
      fetchHistory();
    }
  }, [refreshTrigger]); // Refresh when trigger changes

  const fetchHistory = async () => {
    setInternalLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const API_URL = `${base.replace(/\/+$/, '')}/api`;
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInternalHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Dark mode styles
  const paperStyles = darkMode ? {
    backgroundColor: '#1f2937',
    color: '#fff',
  } : {};

  const listItemStyles = darkMode ? {
    borderBottom: '1px solid #374151',
  } : {};

  const textStyles = darkMode ? {
    primary: { color: '#fff' },
    secondary: { color: '#9ca3af' }
  } : {};

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (history.length === 0) {
    return (
      <Paper elevation={2} sx={{ mt: 4, p: 3, textAlign: 'center', ...paperStyles }}>
        <Typography variant="body1" color={darkMode ? 'gray.400' : 'textSecondary'}>
          No predictions yet. Submit your first loan application!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ mt: 4, p: 2, maxWidth: '100%', ...paperStyles }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Recent Predictions
      </Typography>
      <List dense>
        {history.map((item: HistoryItem) => {
          // Handle different data formats from API vs parent
          const probability = item.loan_paid_back_probability ?? (1 - (item.default_probability || 0));
          const isSafe = probability > 0.7 || item.prediction === 'Approved';
          const isPending = probability > 0.5 && probability <= 0.7;
          
          return (
            <ListItem key={item.id} divider sx={listItemStyles}>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ ...textStyles.primary, fontWeight: 500 }}>
                    ${item.loan_amount?.toLocaleString()} | Credit: {item.credit_score}
                    {item.applicant_name && ` | ${item.applicant_name}`}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={textStyles.secondary}>
                    Probability: {(probability * 100).toFixed(1)}%
                    {item.created_at && ` | ${new Date(item.created_at).toLocaleDateString()}`}
                  </Typography>
                }
              />
              <Chip 
                size="small"
                label={isSafe ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                color={isSafe ? 'success' : isPending ? 'warning' : 'error'}
                sx={{ fontWeight: 600 }}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default HistoryList;
