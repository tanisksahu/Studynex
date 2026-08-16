import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BootScreen = ({ isReady, error, onRetry, onOffline }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Logo (0-400ms)
    // Phase 1: Preparing workspace (400-900ms)
    // Phase 2: Syncing academic data (900-1400ms)
    // Phase 3: Intelligence ready (1400-1800ms)
    
    if (error) {
      setPhase(4); // Error state
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [error]);

  const messages = [
    "",
    "Preparing your workspace...",
    "Syncing your academic data...",
    "StudyNex Intelligence ready."
  ];

  return (
    <AnimatePresence>
      {(!isReady || phase < 3) && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center"
        >
          <div className="w-[300px] flex flex-col items-center">
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-12 h-12 rounded-full border-[3px] border-primary flex items-center justify-center mb-4 relative">
                 <div className="w-3 h-3 bg-primary rounded-full absolute"></div>
                 {phase < 3 && !error && (
                   <motion.div 
                     animate={{ rotate: 360 }} 
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     className="absolute inset-[-3px] rounded-full border-[3px] border-transparent border-t-primary"
                   />
                 )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">StudyNex</h1>
              <p className="text-sm font-medium text-on-surface-variant mt-1">Your academic command center</p>
            </motion.div>

            <div className="w-full h-px bg-outline-variant/50 mb-8" />

            <div className="w-full min-h-[100px] flex flex-col items-center">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <p className="text-sm font-bold text-error mb-4">Unable to connect to your StudyNex account.</p>
                  <p className="text-xs text-on-surface-variant mb-6 text-center">StudyNex is having trouble reaching the server.</p>
                  
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={onRetry}
                      className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition-colors"
                    >
                      Try again
                    </button>
                    <button 
                      onClick={onOffline}
                      className="flex-1 py-2 bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant rounded-xl font-bold text-xs transition-colors"
                    >
                      Continue offline
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-start w-full px-6 gap-3">
                  <AnimatePresence>
                    {phase >= 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                        className="flex items-center gap-3 text-sm text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">{phase > 1 ? 'check_circle' : 'hourglass_empty'}</span>
                        <span className={phase > 1 ? "text-on-surface" : ""}>Connecting account</span>
                      </motion.div>
                    )}
                    {phase >= 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                        className="flex items-center gap-3 text-sm text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">{phase > 2 ? 'check_circle' : 'hourglass_empty'}</span>
                        <span className={phase > 2 ? "text-on-surface" : ""}>Loading subjects</span>
                      </motion.div>
                    )}
                    {phase >= 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                        className="flex items-center gap-3 text-sm text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                        <span className="text-on-surface font-medium">Preparing intelligence</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
