import { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LoanForm from './components/LoanForm';
import ResultCard from './components/ResultCard';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
});

function App() {
  // This matches the API response exactly
  const [prediction, setPrediction] = useState<{
    loan_paid_back_probability: number;
    loan_will_be_paid_back: boolean;
    risk_level: string;
    confidence: string;
  } | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LoanForm onResult={setPrediction} />
        <ResultCard data={prediction} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
