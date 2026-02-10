import React from 'react';
import { Box, keyframes } from '@mui/material';

const denominations = [
  { value: '50,000', color: '#d4af37', size: 80 }, // Gold
  { value: '20,000', color: '#8b4513', size: 75 }, // Brown
  { value: '10,000', color: '#2e8b57', size: 70 }, // Green
  { value: '5,000', color: '#4169e1', size: 65 },  // Blue
  { value: '2,000', color: '#9932cc', size: 60 },  // Purple
  { value: '1,000', color: '#dc143c', size: 55 },  // Red
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
  const bills = Array.from({ length: 30 }, (_, i) => {
    const denom = denominations[i % denominations.length];
    return {
      ...denom,
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 6,
      rotation: Math.random() * 360
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
            background: `linear-gradient(135deg, ${bill.color} 0%, ${bill.color}dd 100%)`,
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
            transform: `rotate(${bill.rotation}deg)`,
            '&::before': {
              content: '"UGX"',
              position: 'absolute',
              top: 2,
              left: 4,
              fontSize: '0.6em',
              opacity: 0.8
            },
            '&::after': {
              content: `"${bill.value}"`,
              fontSize: '0.9em',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }
          }}
        />
      ))}
      
      {/* Gradient Overlay for readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.7) 100%)',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default FallingMoney;
