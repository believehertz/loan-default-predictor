import { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LoanForm from './components/LoanForm';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  const [prediction, setPrediction] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <LoanForm onResult={setPrediction} />
        <ResultCard data={prediction} />
        <HistoryList />
      </Container>
    </ThemeProvider>
  );
}

export default App;