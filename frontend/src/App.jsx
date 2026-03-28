import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ToastProvider } from './store/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Directory from './pages/Directory';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import MemberDetail from './pages/MemberDetail';
import Moderation from './pages/Moderation';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import Compare from './pages/Compare';
import Onboarding from './pages/Onboarding';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-headline font-extrabold text-gray-100">404</p>
        <h1 className="font-headline font-bold text-xl mt-4">Page not found</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
                <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/messages/:id" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
                <Route path="/members/:id" element={<ProtectedRoute><MemberDetail /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/moderation" element={<ProtectedRoute moderatorOnly><Moderation /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="border-t border-gray-100 py-8 px-6 md:px-12 mt-auto">
              <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} Literacy Leaders Community</p>
                <p>Connecting districts through evidence-based literacy</p>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}
