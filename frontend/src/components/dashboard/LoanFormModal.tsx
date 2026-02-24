import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import LoanForm from '../LoanForm';

interface LoanFormModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  darkMode?: boolean;
}

const LoanFormModal: React.FC<LoanFormModalProps> = ({ onSuccess, onCancel, darkMode }) => {
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handleResult = (data: any) => {
    setPredictionResult(data);
    // Small delay to show result before closing
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Close button */}
      <Box sx={{ 
        position: 'absolute', 
        top: -10, 
        right: -10, 
        zIndex: 10 
      }}>
        <IconButton 
          onClick={onCancel}
          sx={{
            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
            color: darkMode ? '#fff' : '#374151',
            '&:hover': {
              backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Wrapper to constrain MUI form */}
      <Box sx={{ 
        width: '100%',
        maxWidth: 900,
        maxHeight: '80vh',
        overflow: 'auto',
        // Override the LoanForm's full-screen styles for modal
        '& > div': {
          minHeight: 'auto !important',
          py: 2,
        },
        '& .MuiPaper-root': {
          boxShadow: 'none !important',
          background: darkMode ? '#1f2937 !important' : 'rgba(255, 255, 255, 0.95) !important',
        },
        '& .MuiTypography-root': {
          color: darkMode ? '#fff !important' : 'inherit',
        },
        '& .MuiTypography-colorTextSecondary': {
          color: darkMode ? '#9ca3af !important' : 'inherit',
        },
        '& .MuiInputLabel-root': {
          color: darkMode ? '#9ca3af !important' : 'inherit',
        },
        '& .MuiInputBase-root': {
          color: darkMode ? '#fff !important' : 'inherit',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: darkMode ? '#4b5563 !important' : 'inherit',
        },
        '& .MuiSelect-icon': {
          color: darkMode ? '#9ca3af !important' : 'inherit',
        },
        '& .MuiFormHelperText-root': {
          color: darkMode ? '#9ca3af !important' : 'inherit',
        }
      }}>
        <LoanForm onResult={handleResult} />
      </Box>

      {/* Success overlay */}
      {predictionResult && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          zIndex: 20,
        }}>
          <Box sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: '#10b981',
            color: 'white',
            textAlign: 'center',
          }}>
            <h3 className="text-2xl font-bold mb-2">✓ Prediction Complete!</h3>
            <p>Probability: {(predictionResult.probability * 100).toFixed(2)}%</p>
            <p>Status: {predictionResult.prediction}</p>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default LoanFormModal;
