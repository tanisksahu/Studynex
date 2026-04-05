import React, { Suspense, useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppContext } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';

// Lazy loaded page components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MaterialsInbox = React.lazy(() => import('./pages/MaterialsInbox'));
const SubjectsView = React.lazy(() => import('./pages/SubjectsView'));
const Planner = React.lazy(() => import('./pages/Planner'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

const FloatingAssistant = () => {
  const [open, setOpen] = useState(false);
  const { dispatchAiAction, executeAction } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'System initialized. You can ask me to "Mark Data Structures Unit 2 complete" or "Plan my day"!' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open, isTyping]);

  const handleSend = async (overrideText = null) => {
    const text = overrideText || inputVal;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputVal('');
    setIsTyping(true);

    const aiResponse = await dispatchAiAction(text);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: aiResponse.message, 
      action: aiResponse.proposedAction 
    }]);
  };

  const confirmAction = (index, action) => {
    executeAction(action);
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, action: null, text: '✅ Action executed successfully.' } : m));
  };

  const quickActions = [
    "Plan my day",
    "Mark Data Structures Unit 1 complete",
    "What are my weak subjects?"
  ];

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             className="mb-4 w-[calc(100vw-3rem)] sm:w-96 max-w-md bg-surface-container-high/95 border border-outline-variant/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col"
             style={{ maxHeight: '60vh' }}
           >
             <div className="flex gap-2 items-center mb-4 border-b border-outline-variant/10 pb-3 shrink-0">
               <span className="material-symbols-outlined text-primary shadow-[0_0_10px_rgba(195,192,255,0.4)] rounded-full">smart_toy</span>
               <div>
                 <h4 className="font-bold text-sm text-white">Studynex Autonomous Agent</h4>
                 <p className="text-[0.55rem] text-primary uppercase tracking-widest font-black animate-pulse">Monitoring Global Context</p>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto min-h-[200px] mb-4 space-y-3 pr-2 scrollbar-none flex flex-col">
                {messages.map((m, i) => (
                  <div key={i} className={`text-sm p-3 rounded-xl max-w-[85%] ${m.role === 'ai' ? 'bg-[#0b1326] text-[#c7c4d8] self-start border border-primary/20' : 'bg-primary text-white self-end border border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.2)]'}`}>
                    <p>{m.text}</p>
                    {m.action && (
                      <button 
                        onClick={() => confirmAction(i, m.action)}
                        className="mt-3 w-full bg-[#4edea3]/20 hover:bg-[#4edea3]/40 border border-[#4edea3]/40 text-[#4edea3] py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                         <span className="material-symbols-outlined text-sm">check_circle</span>
                         Approve Action
                      </button>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="text-sm p-3 rounded-xl max-w-[85%] bg-[#0b1326] text-[#c7c4d8] self-start border border-primary/20 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150"></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-300"></span>
                  </div>
                )}
                <div ref={endRef} />
             </div>

             <div className="flex gap-2 relative shrink-0 flex-wrap mb-2">
                {quickActions.map((a, i) => (
                  <button key={i} onClick={() => handleSend(a)} className="text-[0.6rem] bg-surface-container rounded-full px-2 py-1 border border-outline-variant/20 hover:border-primary text-on-surface-variant hover:text-white transition-colors">
                    {a}
                  </button>
                ))}
             </div>

             <div className="flex gap-2 relative shrink-0">
               <input 
                 type="text" 
                 value={inputVal}
                 onChange={e => setInputVal(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Command the AI..." 
                 className="w-full bg-[#0b1326]/80 border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:border-primary transition-all outline-none" 
               />
               <button 
                 onClick={() => handleSend()}
                 className="bg-primary hover:bg-indigo-400 text-white rounded-xl px-3 flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(195,192,255,0.4)]"
               >
                 <span className="material-symbols-outlined text-sm">send_spark</span>
               </button>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-shadow hover:shadow-[0_0_30px_rgba(79,70,229,0.8)] border border-indigo-400 pointer-events-auto"
      >
        <span className="material-symbols-outlined text-3xl">{open ? 'close' : 'smart_toy'}</span>
      </motion.button>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Toaster position="top-center" toastOptions={{ 
            duration: 3000, 
            className: 'font-headline font-bold text-sm tracking-wide !bg-surface-container-high !text-white !border !border-outline-variant/20 !shadow-2xl'
          }} 
        />
        <Router>
          <div className="flex min-h-screen text-on-surface relative">
            <Sidebar />
            
            {/* Main Content Wrapper - Adapts spacing on desktop, overlaps on mobile */}
            <div className="flex-1 flex flex-col min-h-screen relative lg:pl-64 transition-all duration-300 w-full overflow-hidden">
              <TopAppBar />
              
              <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-4 pb-20 lg:pb-4 relative z-0">
                 <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/inbox" element={<MaterialsInbox />} />
                      <Route path="/plan" element={<Planner />} />
                      <Route path="/exams" element={<SubjectsView />} />
                      <Route path="/analytics" element={<Progress />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                 </Suspense>
              </div>
              <FloatingAssistant />
            </div>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
