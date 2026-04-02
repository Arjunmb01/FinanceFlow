
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Records } from './pages/Records';
import { Analyst } from './pages/Analyst';
import { AdminDashboard } from './pages/AdminDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Viewer Routes */}
            <Route path="/login" element={<Login role="viewer" />} />
            <Route path="/signup" element={<Signup role="viewer" />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="records" element={<Records />} />
            </Route>

            {/* Analyst Routes */}
            <Route path="/analyst/login" element={<Login role="analyst" />} />
            <Route path="/analyst/signup" element={<Signup role="analyst" />} />
            <Route path="/analyst" element={<Layout />}>
              <Route index element={<Analyst />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login role="admin" />} />
            <Route path="/admin" element={<Layout />}>
              <Route index element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
