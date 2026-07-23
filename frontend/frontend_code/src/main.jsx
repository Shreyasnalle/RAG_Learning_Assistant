import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from '../pages/landing_page.jsx'
import AccountPage from '../pages/account.jsx'
import SettingsPage from '../pages/settings.jsx'
import RetrievalPage from '../pages/features/retrieval.jsx'
import SummaryPage from '../pages/features/summary.jsx'

function App() {
  const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  const isSessionValid = () => {
    const ts = localStorage.getItem('login_timestamp');
    if (!ts) return false;
    return (Date.now() - parseInt(ts, 10)) < SESSION_DURATION_MS;
  };

  const [page, setPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // On first render, validate session age
    if (localStorage.getItem('isLoggedIn') === 'true' && isSessionValid()) {
      return true;
    }
    // Session expired or never set — clear stale data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    localStorage.removeItem('access_token');
    localStorage.removeItem('name');
    localStorage.removeItem('mobile_number');
    localStorage.removeItem('login_timestamp');
    return false;
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('login_timestamp', Date.now().toString());
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    localStorage.removeItem('access_token');
    localStorage.removeItem('name');
    localStorage.removeItem('mobile_number');
    localStorage.removeItem('login_timestamp');
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/account') {
        setPage('account');
      } else if (hash === '#/settings') {
        setPage('settings');
      } else if (hash === '#/features/retrieval') {
        setPage('retrieval');
      } else if (hash === '#/features/summary') {
        setPage('summary');
      } else {
        setPage('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (p) => {
    if (p === 'account') {
      window.location.hash = '#/account';
    } else if (p === 'settings') {
      window.location.hash = '#/settings';
    } else if (p === 'retrieval') {
      window.location.hash = '#/features/retrieval';
    } else if (p === 'summary') {
      window.location.hash = '#/features/summary';
    } else {
      window.location.hash = '';
    }
  };

  if (page === 'account') {
    return (
      <AccountPage 
        onNavigate={() => navigateTo('landing')} 
        onLoginSuccess={() => {
          handleLoginSuccess();
          navigateTo('landing');
        }}
      />
    );
  }
  if (page === 'settings') {
    return (
      <SettingsPage
        onNavigate={() => navigateTo('landing')}
        onLogout={handleLogout}
      />
    );
  }
  if (page === 'retrieval') {
    return <RetrievalPage onNavigate={() => navigateTo('landing')} />;
  }
  if (page === 'summary') {
    return <SummaryPage onNavigate={() => navigateTo('landing')} />;
  }
  return (
    <LandingPage 
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      onNavigateToAccount={() => navigateTo('account')} 
      onNavigateToSettings={() => navigateTo('settings')}
      onNavigateToRetrieval={() => navigateTo('retrieval')}
      onNavigateToSummary={() => navigateTo('summary')}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
