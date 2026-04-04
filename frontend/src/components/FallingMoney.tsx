import React from 'react';
import { Box, keyframes } from '@mui/material';

const moneyImages = [
  { 
    value: '50000', 
    front: '/images/2010-2019-50000-UGX-Ugandan-Shilling-note-front.png',
    back: '/images/2010-2019-50000-UGX-Ugandan-Shilling-note-back.png',
    width: 140 
  },
  { 
    value: '20000', 
    front: '/images/2010-2019-20000-UGX-Ugandan-Shilling-note-front.png',
    back: '/images/2010-2019-20000-UGX-Ugandan-Shilling-note-back.png',
    width: 130 
  },
  { 
    value: '10000', 
    front: '/images/2010-2019-10000-UGX-Ugandan-Shilling-note-front.png',
    back: '/images/2010-2019-10000-UGX-Ugandan-Shilling-note-back.png',
    width: 120 
  },
  { 
    value: '5000', 
    front: '/images/2010-2019-5000-UGX-Ugandan-Shilling-note-FRONT.png', 
    back: '/images/2010-2019-5000-UGX-Ugandan-Shilling-note-back.png',
    width: 110 
  },
  { 
    value: '2000', 
    front: '/images/2010-2019-2000-UGX-Ugandan-Shilling-note-front.png',
    back: '/images/2010-2019-2000-UGX-Ugandan-Shilling-note-back.png',
    width: 100 
  },
  { 
    value: '1000', 
    front: '/images/2010-2019-1000-UGX-Ugandan-Shilling-note-front.png',
    back: '/images/2010-2019-1000-UGX-Ugandan-Shilling-note-back.png',
    width: 90 
  },
];

const fall = keyframes`
  0% { transform: translateY(-150px) rotate(0deg); opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
`;

const FallingMoney: React.FC = () => {
  const bills = Array.from({ length: 25 }, (_, i) => {
    const money = moneyImages[i % moneyImages.length];
    const isFront = Math.random() > 0.5; // Randomly choose front or back
    
    return {
      ...money,
      id: i,
      left: Math.random() * 95, // 0-95% across screen
      delay: Math.random() * 15, // Random start delay
      duration: 10 + Math.random() * 8, // 10-18 seconds fall time
      rotation: Math.random() * 360, // Random starting rotation
      isFront, // Store which side to show
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
          src={bill.isFront ? bill.front : bill.back} // ✅ Correct: use ternary operator
          alt={`UGX ${bill.value}`}
          sx={{
            position: 'absolute',
            left: `${bill.left}%`,
            top: -150,
            width: bill.width,
            height: 'auto',
            borderRadius: 0,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            opacity: 0.15,
            filter: 'blur(2px)',
            animation: `${fall} ${bill.duration}s linear infinite`,
            animationDelay: `${bill.delay}s`,
            transform: `rotate(${bill.rotation}deg)`,
            objectFit: 'contain',
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
