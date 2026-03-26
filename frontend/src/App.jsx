import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ToastProvider } from './store/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route path="/moderation" element={<ProtectedRoute moderatorOnly><Moderation /></ProtectedRoute>} />
              <Route path="*" element={
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-headline font-extrabold text-gray-200">404</p>
                    <p className="font-headline font-bold text-lg mt-2">Page not found</p>
                    <a href="/" className="text-emerald-600 text-sm mt-4 inline-block hover:underline">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <footer className="border-t border-gray-100 py-8 px-6 md:px-12 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Literacy Leaders Community</p>
              <p>Connecting districts through evidence-based literacy</p>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
