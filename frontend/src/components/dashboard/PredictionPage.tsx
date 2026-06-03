import React, { useState } from 'react';
import { Box, Fade } from '@mui/material';
import LoanForm from '../LoanForm';
import ResultCard from '../ResultCard';
import { useTheme } from '../../context/ThemeContext';

interface PredictionResult {
  loan_paid_back_probability: number;
  loan_will_be_paid_back: boolean;
  risk_level: string;
  confidence: string;
}

const PredictionPage: React.FC = () => {

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleResult = (data: PredictionResult) => {
    console.log('Prediction received:', data);
    setResult(data);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResult(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {showForm ? (
        <Fade in={showForm} timeout={500}>
          <Box>
            <LoanForm onResult={handleResult} />
          </Box>
        </Fade>
      ) : (
        <Fade in={!showForm} timeout={500}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'transparent',
            py: 4
          }}>
            <ResultCard data={result} onReset={handleReset} />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default PredictionPage;