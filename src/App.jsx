import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppContext } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalCommandCenter from './components/CommandCenter/GlobalCommandCenter';
import BootScreen from './components/BootScreen';
import CommandPalette from './components/CommandPalette';
import FocusMode from './components/FocusMode';

// Lazy loaded page components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MaterialsInbox = React.lazy(() => import('./pages/MaterialsInbox'));
const SubjectsView = React.lazy(() => import('./pages/SubjectsView'));
const Exams = React.lazy(() => import('./pages/Exams'));
const Planner = React.lazy(() => import('./pages/Planner'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    let keyBuffer = '';
    let bufferTimeout;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;

      // Cmd/Ctrl + K for Command Center
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Command Center now handled by global component
        return;
      }
      
      // Sequence Shortcuts (e.g., G -> D)
      keyBuffer += e.key.toLowerCase();
      if (bufferTimeout) clearTimeout(bufferTimeout);
      bufferTimeout = setTimeout(() => { keyBuffer = ''; }, 750); // Reset buffer after 750ms

      if (keyBuffer === 'gd') { navigate('/'); keyBuffer = ''; }
      else if (keyBuffer === 'gs') { navigate('/subjects'); keyBuffer = ''; }
      else if (keyBuffer === 'gp') { navigate('/plan'); keyBuffer = ''; }
      else if (keyBuffer === 'ge') { navigate('/exams'); keyBuffer = ''; }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><Dashboard /></motion.div>} />
        <Route path="/inbox" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><MaterialsInbox /></motion.div>} />
        <Route path="/plan" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><Planner /></motion.div>} />
        <Route path="/subjects" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><SubjectsView /></motion.div>} />
        <Route path="/exams" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><Exams /></motion.div>} />
        <Route path="/analytics" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><Progress /></motion.div>} />
        <Route path="/profile" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><Profile /></motion.div>} />
        <Route path="/settings" element={<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><Settings /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { settings } = useAppContext();
  const isCollapsed = settings?.layout?.sidebarCollapsed || false;

  return (
    <div className="flex min-h-screen text-on-surface bg-background">
      <Sidebar />
      
      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 w-full overflow-hidden ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <TopAppBar />
        
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-4 pb-24 lg:pb-8 relative z-0">
           <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
           </Suspense>
        </div>
      </div>

      <MobileBottomNav />
      <GlobalCommandCenter />
      <CommandPalette />
      <FocusMode />
    </div>
  );
};

function App() {
  const [bootReady, setBootReady] = React.useState(false);
  const [bootError, setBootError] = React.useState(false);

  // Simulate network sync delay or actual API sync status
  React.useEffect(() => {
    // Check if network fetch succeeds
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/subjects', { method: 'GET' }).catch(() => null);
        if (!res || !res.ok) {
          // Could be offline or failing
        }
        // Just delay for visual polish (1.8s)
        setTimeout(() => setBootReady(true), 1800);
      } catch (e) {
        setBootError(true);
      }
    };
    checkStatus();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Toaster position="bottom-right" toastOptions={{ 
              duration: 3000, 
              className: 'font-body text-sm !bg-surface !text-on-surface !border !border-outline-variant !shadow-elevated rounded-xl'
            }} 
          />
          <BootScreen 
            isReady={bootReady} 
            error={bootError} 
            onRetry={() => { setBootError(false); setTimeout(() => setBootReady(true), 1800); }}
            onOffline={() => { setBootError(false); setBootReady(true); }}
          />
          {bootReady && <AppContent />}
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
