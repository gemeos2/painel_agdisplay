import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Elevators from './pages/Elevators';
import TVs from './pages/TVs';
import CalendarPage from './pages/Calendar';
import Clients from './pages/Clients';
import DebugSupabase from './pages/DebugSupabase';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute() {
  const { session, loading } = useAuth();
  console.log("ProtectedRoute: loading", loading, "session", session);

  if (loading) return null; // Or a loading spinner

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="elevators" element={<Elevators />} />
              <Route path="tvs" element={<TVs />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="debug" element={<DebugSupabase />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
