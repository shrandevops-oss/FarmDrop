import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import AuthPage   from '@/pages/AuthPage';
import CustomerApp from '@/pages/CustomerApp';
import FarmerApp  from '@/pages/FarmerApp';
import AgentApp   from '@/pages/AgentApp';

// Mobile shell wrapper (max 430px centered)
function Shell({ children }) {
  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      boxShadow: '0 0 80px rgba(0,0,0,.5)',
      position: 'relative', overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, role } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRole && role !== allowedRole) {
    const dest = role === 'farmer' ? '/farmer' : role === 'agent' ? '/agent' : '/';
    return <Navigate to={dest} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useApp();
  return (
    <Shell>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/" element={<ProtectedRoute allowedRole="customer"><CustomerApp /></ProtectedRoute>} />
        <Route path="/farmer" element={<ProtectedRoute allowedRole="farmer"><FarmerApp /></ProtectedRoute>} />
        <Route path="/agent" element={<ProtectedRoute allowedRole="agent"><AgentApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
