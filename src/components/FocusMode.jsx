import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const FocusMode = () => {
  const { isFocusModeOpen, setIsFocusModeOpen, subjects, addXp } = useAppContext();
  
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins default
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionTarget, setSessionTarget] = useState(null);

  // Pick a target
  useEffect(() => {
    if (isFocusModeOpen && !sessionTarget) {
      const highestPriority = subjects && subjects.length > 0 
        ? [...subjects].sort((a,b) => (b.priorityScore || 0) - (a.priorityScore || 0))[0] 
        : { name: 'General Study' };
      setSessionTarget(highestPriority);
      setTimeLeft(25 * 60);
      setIsActive(false);
      setIsCompleted(false);
    }
  }, [isFocusModeOpen, subjects, sessionTarget]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      setIsCompleted(true);
      addXp(100);
      toast.success('Focus session complete! +100 XP');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, addXp]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const finishSession = () => {
    setIsFocusModeOpen(false);
    setSessionTarget(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isFocusModeOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed inset-0 z-[300] bg-surface flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background Ambient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-surface-variant/20 pointer-events-none"></div>

        <button 
          onClick={() => setIsFocusModeOpen(false)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {!isCompleted ? (
          <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 text-center">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
              Deep Work
            </span>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-on-surface tracking-tight mb-2">
              Focusing on {sessionTarget?.name}
            </h2>
            <p className="text-on-surface-variant font-medium text-sm lg:text-base mb-12">
              Stay focused. All notifications are muted.
            </p>

            {/* Timer Ring */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-outline-variant opacity-50" />
                <circle 
                  cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" 
                  strokeDasharray="301" 
                  strokeDashoffset={301 - (301 * (timeLeft / (25 * 60)))} 
                  className="text-primary transition-all duration-1000 ease-linear" 
                />
              </svg>
              <div className="text-6xl md:text-7xl font-bold text-on-surface font-sans tracking-tighter">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTimer}
                className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 shadow-elevated"
              >
                <span className="material-symbols-outlined text-[32px]">{isActive ? 'pause' : 'play_arrow'}</span>
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center bg-white p-10 rounded-3xl shadow-elevated border border-outline-variant max-w-sm w-full mx-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-4xl">celebration</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Session Complete!</h2>
            <p className="text-on-surface-variant text-sm font-medium mb-6">
              You've successfully completed a 25-minute deep work block for {sessionTarget?.name}.
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={finishSession}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Log & Return
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusMode;
