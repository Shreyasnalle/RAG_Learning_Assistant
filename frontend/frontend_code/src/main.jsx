import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from '../pages/landing_page.jsx'
import AccountPage from '../pages/account.jsx'

function App() {
  const [page, setPage] = useState('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/account') {
        setPage('account');
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
    } else {
      window.location.hash = '';
    }
  };

  if (page === 'account') {
    return <AccountPage onNavigate={() => navigateTo('landing')} />;
  }
  return <LandingPage onNavigateToAccount={() => navigateTo('account')} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
