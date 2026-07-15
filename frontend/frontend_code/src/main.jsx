import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from '../pages/landing_page.jsx'
import AccountPage from '../pages/account.jsx'
import RetrievalPage from '../pages/features/retrieval.jsx'
import SummaryPage from '../pages/features/summary.jsx'

function App() {
  const [page, setPage] = useState('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/account') {
        setPage('account');
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
    } else if (p === 'retrieval') {
      window.location.hash = '#/features/retrieval';
    } else if (p === 'summary') {
      window.location.hash = '#/features/summary';
    } else {
      window.location.hash = '';
    }
  };

  if (page === 'account') {
    return <AccountPage onNavigate={() => navigateTo('landing')} />;
  }
  if (page === 'retrieval') {
    return <RetrievalPage onNavigate={() => navigateTo('landing')} />;
  }
  if (page === 'summary') {
    return <SummaryPage onNavigate={() => navigateTo('landing')} />;
  }
  return (
    <LandingPage 
      onNavigateToAccount={() => navigateTo('account')} 
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
