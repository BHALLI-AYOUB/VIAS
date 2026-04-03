import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HistoriquePage from './pages/HistoriquePage';
import MachineDetailsPage from './pages/MachineDetailsPage';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminOnlyRoute from './components/auth/AdminOnlyRoute';
import AdminLoginPage from './pages/AdminLoginPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminOnlyRoute />}>
              <Route path="/historique" element={<HistoriquePage />} />
              <Route path="/machines/:id" element={<MachineDetailsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
