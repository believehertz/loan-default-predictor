import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import axios from 'axios';

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history');
    }
  };

  if (history.length === 0) return null;

  return (
    <Paper elevation={2} sx={{ mt: 4, p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Recent Predictions
      </Typography>
      <List dense>
        {history.map((item: any) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={`Loan: $${item.loan_amount.toLocaleString()} | Credit: ${item.credit_score}`}
              secondary={`Probability: ${(item.default_probability * 100).toFixed(1)}%`}
            />
            <Chip 
              size="small"
              label={item.is_default_predicted ? 'Risky' : 'Safe'}
              color={item.is_default_predicted ? 'error' : 'success'}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default HistoryList;