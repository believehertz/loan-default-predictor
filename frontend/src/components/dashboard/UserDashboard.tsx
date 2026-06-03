import React from 'react';
import { Box, Grid } from '@mui/material';
import SummaryCards from './SummaryCards';
import ChartSection from './ChartSection';
import QuickActions from './QuickActions';
import ActivityTable from './ActivityTable';

interface Props {
  darkMode: boolean;
}

const UserDashboard: React.FC<Props> = ({ darkMode }) => {
  return (
    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <SummaryCards darkMode={darkMode} />
      
      <Grid container spacing={3} sx={{ mt: 1, flexGrow: 0 }}>
        <Grid item xs={12} lg={8}>
          <ChartSection darkMode={darkMode} />
        </Grid>
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <QuickActions />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, flexGrow: 1, overflow: 'auto' }}>
        <ActivityTable darkMode={darkMode} />
      </Box>
    </Box>
  );
};

export default UserDashboard;
