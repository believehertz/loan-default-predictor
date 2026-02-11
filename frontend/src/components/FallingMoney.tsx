import React from 'react';
import { Box, keyframes } from '@mui/material';

const denominations = [
  { value: '50,000', color: '#d4af37', size: 80 },
  { value: '20,000', color: '#8b4513', size: 75 },
  { value: '10,000', color: '#2e8b57', size: 70 },
  { value: '5,000', color: '#4169e1', size: 65 },
  { value: '2,000', color: '#9932cc', size: 60 },
  { value: '1,000', color: '#dc143c', size: 55 },
];

const fall = keyframes`
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

const FallingMoney: React.FC = () => {
  const bills = Array.from({ length: 25 }, (_, i) => {
    const denom = denominations[i % denominations.length];
    return {
      ...denom,
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 8,
    };
  });

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      {bills.map((bill) => (
        <Box
          key={bill.id}
          sx={{
            position: 'absolute',
            left: `${bill.left}%`,
            top: -100,
            width: bill.size,
            height: bill.size * 0.5,
            backgroundColor: bill.color,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: bill.size / 5,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            animation: `${fall} ${bill.duration}s linear infinite`,
            animationDelay: `${bill.delay}s`,
            '&::before': {
              content: '"UGX"',
              position: 'absolute',
              top: 2,
              left: 4,
              fontSize: '0.5em',
              opacity: 0.8
            }
          }}
        >
          {bill.value}
        </Box>
      ))}
      
      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.85) 100%)',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default FallingMoney;
