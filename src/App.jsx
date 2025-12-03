import { useState, useEffect } from 'react';
import Setup from './pages/Setup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';

function App() {
  const [isConfigured, setIsConfigured] = useState(null); // null = loading
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    checkConfiguration();
    
    // Écouter les changements de navigation depuis le menu
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onNavigateTo((page) => {
        setCurrentPage(page);
      });
      
      return () => cleanup && cleanup();
    }
  }, []);

  const checkConfiguration = async () => {
    if (window.electronAPI) {
      const config = await window.electronAPI.checkConfig();
      setIsConfigured(config.isConfigured && config.hasApiKey);
    } else {
      // Mode développement sans Electron
      setIsConfigured(false);
    }
  };

  const handleSetupComplete = () => {
    setIsConfigured(true);
  };

  // Loading state
  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Setup screen
  if (!isConfigured) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  // Main app
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
