import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Releases from './pages/Releases';
import Whitelist from './pages/Whitelist';
import CMS from './pages/CMS';
import Payments from './pages/Payments';
import YouTubeCriteria from './pages/YouTubeCriteria';
import Revenue from './pages/Revenue';
import MusicPublication from './pages/MusicPublication';
import Notifications from './pages/Notifications';
import Artists from './pages/Artists';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="artists" element={<Artists />} />
            <Route path="releases" element={<Releases />} />
            <Route path="whitelist" element={<Whitelist />} />
            <Route path="cms" element={<CMS />} />
            <Route path="payments" element={<Payments />} />
            <Route path="youtube" element={<YouTubeCriteria />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="music-publication" element={<MusicPublication />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
