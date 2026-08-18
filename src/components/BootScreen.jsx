import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BootScreen = ({ isReady, error, onRetry, onOffline }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (error) {
      setPhase(4); // Error state
      return;
    }

    // Extended timeline for a more premium, staged loading feel
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => setPhase(4), 2400); // Ready

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [error]);

  return (
    <AnimatePresence>
      {(!isReady || phase < 4) && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-[340px] flex flex-col items-center z-10">
            
            {/* Logo Sequence */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center mb-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container shadow-elevated flex items-center justify-center mb-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/20 blur-sm" />
                 <span className="material-symbols-outlined text-white text-[28px] drop-shadow-sm z-10">school</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">StudyNex</h1>
              <p className="text-sm font-medium text-on-surface-variant mt-2 tracking-wide uppercase">AI-Powered Student OS</p>
            </motion.div>

            <div className="w-full min-h-[120px] flex flex-col items-center">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-error">wifi_off</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-2">Connection Unavailable</p>
                  <p className="text-xs text-on-surface-variant mb-6 text-center max-w-[250px]">StudyNex cannot reach the intelligence engine. Check your connection.</p>
                  
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={onRetry}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition-colors shadow-soft"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={onOffline}
                      className="flex-1 py-2.5 bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant rounded-xl font-bold text-xs transition-colors"
                    >
                      Use Offline
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-start w-full px-8 gap-4">
                  <AnimatePresence>
                    {phase >= 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center gap-4 text-sm text-on-surface-variant w-full"
                      >
                        <div className="w-5 flex justify-center">
                           {phase > 0 ? (
                             <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                           ) : (
                             <span className="material-symbols-outlined text-[16px] animate-spin text-on-surface-variant">sync</span>
                           )}
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${phase > 0 ? "text-on-surface" : "text-on-surface-variant"}`}>Authenticating</span>
                      </motion.div>
                    )}
                    {phase >= 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center gap-4 text-sm text-on-surface-variant w-full"
                      >
                        <div className="w-5 flex justify-center">
                           {phase > 1 ? (
                             <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                           ) : (
                             <span className="material-symbols-outlined text-[16px] animate-spin text-on-surface-variant">sync</span>
                           )}
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${phase > 1 ? "text-on-surface" : "text-on-surface-variant"}`}>Loading academic context</span>
                      </motion.div>
                    )}
                    {phase >= 2 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center gap-4 text-sm text-on-surface-variant w-full"
                      >
                        <div className="w-5 flex justify-center">
                           {phase > 2 ? (
                             <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                           ) : (
                             <span className="material-symbols-outlined text-[16px] animate-spin text-on-surface-variant">sync</span>
                           )}
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${phase > 2 ? "text-on-surface" : "text-on-surface-variant"}`}>Syncing planner</span>
                      </motion.div>
                    )}
                    {phase >= 3 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center gap-4 text-sm text-on-surface-variant w-full"
                      >
                        <div className="w-5 flex justify-center">
                           <span className="material-symbols-outlined text-[16px] animate-spin text-primary">magic_button</span>
                        </div>
                        <span className="font-bold text-primary">Preparing intelligence engine...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* Minimal Progress Bar */}
            {!error && (
               <div className="w-[120px] h-1 bg-surface-variant rounded-full mt-10 overflow-hidden">
                 <motion.div 
                   className="h-full bg-primary"
                   initial={{ width: '0%' }}
                   animate={{ width: `${(phase / 4) * 100}%` }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                 />
               </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
