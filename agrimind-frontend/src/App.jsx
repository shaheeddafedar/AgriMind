import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Recommendation from './pages/Recommendation';
import SmartIrrigation from './pages/SmartIrrigation';
import Analytics from './pages/Analytics';
import Feedback from './pages/Feedback';
import About from './pages/About';
import Profile from './pages/Profile';
import Signup from './pages/Signup';

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          setUser(null);
          localStorage.removeItem('user');
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);

          localStorage.setItem(
            'user',
            JSON.stringify(data.user)
          );
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Session restore error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);

    localStorage.setItem(
      'user',
      JSON.stringify(loggedInUser)
    );

    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    );
  };

  if (authLoading) {
    return null;
  }

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              user={user}
              onRequireLogin={() => setShowLogin(true)}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommend"
          element={
            <ProtectedRoute user={user}>
              <Recommendation user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendation"
          element={
            <ProtectedRoute user={user}>
              <Recommendation user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/irrigation"
          element={
            <ProtectedRoute user={user}>
              <SmartIrrigation user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <Analytics user={user} />
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute user={user}>
              <Feedback user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <About user={user} />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile
                user={user}
                onUpdateUser={handleUpdateUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <Signup
              onLoginSuccess={handleLoginSuccess}
              onOpenLogin={() => setShowLogin(true)}
            />
          }
        />
      </Routes>

      <Footer />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </BrowserRouter>
  );
};

export default App;