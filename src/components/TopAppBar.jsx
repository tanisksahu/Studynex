import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const TopAppBar = () => {
  const location = useLocation();
  const { profile, setIsMobileMenuOpen, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/inbox': return 'Materials Intelligence';
      case '/plan': return 'Mission Planning';
      case '/exams': return 'Priority Focus';
      case '/analytics': return 'Mastery Engine';
      case '/profile': return 'Scholar Identity';
      case '/settings': return 'System Settings';
      default: return 'Studynex';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shadow-sm neo-glass rounded-none w-full border-t-0 border-l-0 border-r-0">
      
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/20 hover:border-primary/50 text-white transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div>
          <h2 className="text-xl font-headline font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{getPageTitle()}</h2>
          <p className="text-[0.65rem] font-bold text-primary tracking-widest uppercase">Sync <span className="material-symbols-outlined text-[10px] animate-pulse">wifi_tethering</span> Active</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <motion.button 
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/20 hover:border-secondary/50 text-white transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-secondary transition-colors">notifications</span>
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full shadow-[0_0_8px_rgba(255,92,92,0.8)] animate-pulse"></span>}
          </motion.button>
          
          {/* Transparent click catcher not needed due to ref logic */}
          <AnimatePresence>
             {showNotifications && (
               <motion.div 
                 initial={{ opacity: 0, y: 15, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute right-0 top-14 w-80 bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
               >
                 <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-[#0b1326]/50">
                    <h4 className="font-bold text-sm text-white">System Logs</h4>
                    <div className="flex gap-2">
                       <button onClick={markAllNotificationsRead} className="text-[0.65rem] font-bold text-primary hover:text-indigo-300 uppercase tracking-widest">Mark Valid</button>
                       <span className="text-on-surface-variant text-[0.65rem]">|</span>
                       <button onClick={clearNotifications} className="text-[0.65rem] font-bold text-error hover:text-red-300 uppercase tracking-widest">Wipe</button>
                    </div>
                 </div>
                 
                 <div className="max-h-80 overflow-y-auto scrollbar-none p-2 space-y-1">
                    {notifications.length === 0 ? (
                       <div className="text-center p-6 text-on-surface-variant">
                          <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_off</span>
                          <p className="text-xs">No active logs</p>
                       </div>
                    ) : (
                       notifications.map(n => (
                          <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 rounded-xl flex gap-3 cursor-pointer transition-colors ${n.read ? 'opacity-60 hover:bg-surface-container' : 'bg-primary/10 border border-primary/20 hover:bg-primary/20'}`}>
                             <span className={`material-symbols-outlined text-lg mt-0.5 ${n.type === 'alert' ? 'text-error' : 'text-primary'}`}>
                               {n.type === 'alert' ? 'warning' : 'auto_awesome'}
                             </span>
                             <div>
                                <p className="text-sm text-white leading-snug">{n.message}</p>
                                <p className="text-[0.6rem] text-on-surface-variant font-bold tracking-widest uppercase mt-1">
                                  {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                             </div>
                             {!n.read && <span className="w-2 h-2 rounded-full bg-primary justify-self-end mt-1 shrink-0"></span>}
                          </div>
                       ))
                    )}
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
        
        <div className="flex items-center gap-3 bg-surface-container-high px-2 py-1.5 md:px-4 md:py-2 rounded-full border border-outline-variant/10 shadow-inner cursor-pointer hover:bg-surface-container-highest transition-colors group">
          <div className="hidden md:flex flex-col items-end">
             <span className="font-bold text-xs text-white">{profile.firstName}</span>
             <span className="text-[0.55rem] font-black uppercase tracking-widest text-[#4edea3]">Lvm {profile.level}</span>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary/50 overflow-hidden group-hover:border-primary transition-colors shadow-[0_0_10px_rgba(79,70,229,0.3)] shrink-0">
            <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

    </header>
  );
};

export default TopAppBar;
