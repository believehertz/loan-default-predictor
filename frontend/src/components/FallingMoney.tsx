import React from 'react';
import { Box, keyframes } from '@mui/material';

// Define your money images - update these paths to match your actual filenames
const moneyImages = [
  { 
    value: '50000', 
    front: '/images/2010-2019-50000-UGX-Ugandan-Shilling-note-back.png',
    back: '/images/2010-2019-50000-UGX-Ugandan-Shilling-note-front.png',
    width: 120 
  },
  { 
    value: '20000', 
    front: '/images/2010-2019-20000-UGX-Ugandan-Shilling-note-back.png',
    back: '/images/2010-2019-20000-UGX-Ugandan-Shilling-note-front.png',
    width: 110 
  },
  { 
    value: '10000', 
    front: '/images/2010-2019-10000-UGX-Ugandan-Shilling-note-back.png',
    back: '/images/2010-2019-10000-UGX-Ugandan-Shilling-note-front.png',
    width: 100 
  },
  { 
    value: '5000', 
    front: '/images/2010-2019-5000-UGX-Ugandan-Shilling-note-back.png',
    back: '/images/2010-2019-5000-UGX-Ugandan-Shilling-note-front.png',
    width: 90 
  },
  { 
    value: '2000', 
    front: '/images/2010-2019-2000-UGX-Ugandan-Shilling-note-back.png',
    back: '/images/2010-2019-2000-UGX-Ugandan-Shilling-note-front.png',
    width: 80 
  },
  { 
    value: '1000', 
    front: '/images/2010-2019-1000-UGX-Ugandan-Shilling-note-back.png',
    back: '/images/2010-2019-1000-UGX-Ugandan-Shilling-note-front.png',
    width: 70 
  },
];

const fall = keyframes`
  0% {
    transform: translateY(-150px) rotate(0deg);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
`;

const FallingMoney: React.FC = () => {
  // Create 20 falling bills with random positions
  const bills = Array.from({ length: 20 }, (_, i) => {
    const money = moneyImages[i % moneyImages.length];
    return {
      ...money,
      id: i,
      left: Math.random() * 95, // 0-95% across screen
      delay: Math.random() * 15, // Random start delay
      duration: 12 + Math.random() * 8, // 12-20 seconds fall time
      rotation: Math.random() * 360, // Random starting rotation
      isFront: Math.random() > 0.5, // Randomly choose front or back (if you have both)
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
        pointerEvents: 'none', // Let clicks pass through
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      {bills.map((bill) => (
        <Box
          key={bill.id}
          component="img"
          src={bill.src}
          alt={`UGX ${bill.value}`}
          sx={{
            position: 'absolute',
            left: `${bill.left}%`,
            top: -150,
            width: bill.width,
            height: 'auto',
            borderRadius: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            animation: `${fall} ${bill.duration}s linear infinite`,
            animationDelay: `${bill.delay}s`,
            transform: `rotate(${bill.rotation}deg)`,
            objectFit: 'contain',
            zIndex: 0
          }}
        />
      ))}
      
      {/* Gradient overlay for readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.8) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
};

export default FallingMoney;
