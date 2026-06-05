import React from 'react';
import { Box, Grid } from '@mui/material';
import SummaryCards from './SummaryCards';
import ChartSection from './ChartSection';
import QuickActions from './QuickActions';
import ActivityTable from './ActivityTable';
import BonusHistory from './BonusHistory';

interface Props {
  darkMode: boolean;
}

const UserDashboard: React.FC<Props> = ({ darkMode }) => {
  return (
    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SummaryCards darkMode={darkMode} />
      
      <Grid container spacing={3} sx={{ flexGrow: 0 }}>
        <Grid item xs={12} lg={8}>
          <ChartSection darkMode={darkMode} />
        </Grid>
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <QuickActions />
        </Grid>
      </Grid>

      <ActivityTable darkMode={darkMode} />

      <BonusHistory darkMode={darkMode} />
    </Box>
  );
};

export default UserDashboard;
