import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HistoriquePage from './pages/HistoriquePage';
import MachineDetailsPage from './pages/MachineDetailsPage';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/historique" element={<HistoriquePage />} />
        <Route path="/machines/:id" element={<MachineDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
