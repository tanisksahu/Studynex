import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const TopAppBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, isSearchOpen, setIsSearchOpen } = useAppContext();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/inbox': return 'Materials';
      case '/plan': return 'Planner';
      case '/exams': return 'Subjects';
      case '/analytics': return 'Analytics';
      case '/profile': return 'Profile';
      case '/settings': return 'Settings';
      default: return 'StudyNex';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-outline-variant flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all w-full">
      
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-on-surface tracking-tight hidden lg:block">{getPageTitle()}</h2>
        {/* Mobile Page Title */}
        <h2 className="text-lg font-bold text-on-surface tracking-tight lg:hidden">{getPageTitle()}</h2>
      </div>

      <div className="flex flex-1 max-w-md mx-4 lg:mx-8 items-center">
         <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center justify-between bg-surface-variant hover:bg-[#EAEAE5] border border-outline-variant rounded-lg px-3 py-2 transition-colors group">
            <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-on-surface">
               <span className="material-symbols-outlined text-[18px]">search</span>
               <span className="text-sm font-medium">Search StudyNex...</span>
            </div>
            <kbd className="hidden lg:flex items-center gap-1 font-sans text-[10px] font-semibold text-on-surface-variant bg-white border border-outline-variant px-1.5 py-0.5 rounded opacity-70">
               <span className="text-[12px]">⌘</span> K
            </kbd>
         </button>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        
        {/* Calendar Shortcut */}
        <button 
          onClick={() => navigate('/plan')}
          className="hidden md:flex w-9 h-9 rounded-md items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
          title="Planner"
        >
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
        </button>

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative w-9 h-9 rounded-md flex items-center justify-center transition-colors ${showNotifications ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>}
          </button>
          
          <AnimatePresence>
             {showNotifications && (
               <motion.div 
                 initial={{ opacity: 0, y: 5, scale: 0.98 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 5, scale: 0.98 }}
                 transition={{ duration: 0.15 }}
                 className="absolute right-0 top-12 w-80 bg-white border border-outline-variant rounded-xl shadow-elevated overflow-hidden z-[100]"
               >
                 <div className="p-3 border-b border-outline-variant flex justify-between items-center bg-surface">
                    <h4 className="font-semibold text-sm text-on-surface">Notifications</h4>
                    <div className="flex gap-3">
                       <button onClick={markAllNotificationsRead} className="text-xs font-medium text-primary hover:text-on-primary-container">Mark all read</button>
                       <button onClick={clearNotifications} className="text-xs font-medium text-on-surface-variant hover:text-error">Clear</button>
                    </div>
                 </div>
                 
                 <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {notifications.length === 0 ? (
                       <div className="text-center p-6 text-on-surface-variant">
                          <span className="material-symbols-outlined text-2xl mb-1 opacity-50">notifications_off</span>
                          <p className="text-sm">No new notifications</p>
                       </div>
                    ) : (
                       notifications.map(n => (
                          <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 rounded-lg flex gap-3 cursor-pointer transition-colors ${n.read ? 'opacity-60 hover:bg-surface-variant' : 'bg-primary-container hover:bg-primary/10'}`}>
                             <span className={`material-symbols-outlined text-[18px] mt-0.5 ${n.type === 'alert' ? 'text-error' : 'text-primary'}`}>
                               {n.type === 'alert' ? 'warning' : 'auto_awesome'}
                             </span>
                             <div>
                                <p className="text-sm text-on-surface leading-tight font-medium">{n.message}</p>
                                <p className="text-xs text-on-surface-variant mt-1">
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
        
        <div className="h-5 w-px bg-outline-variant hidden md:block mx-1"></div>
        
        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 group p-1 pr-2 rounded-md hover:bg-surface-variant transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant group-hover:border-primary transition-colors shrink-0">
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="hidden lg:block text-sm font-medium text-on-surface">{profile.firstName}</span>
            <span className="hidden lg:block material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
          </button>

          <AnimatePresence>
             {showProfileMenu && (
               <motion.div 
                 initial={{ opacity: 0, y: 5, scale: 0.98 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 5, scale: 0.98 }}
                 transition={{ duration: 0.15 }}
                 className="absolute right-0 top-12 w-56 bg-white border border-outline-variant rounded-xl shadow-elevated overflow-hidden z-[100]"
               >
                 <div className="p-4 border-b border-outline-variant">
                    <p className="text-sm font-semibold text-on-surface truncate">{profile.firstName} {profile.lastName}</p>
                    <p className="text-xs text-on-surface-variant truncate">{profile.email}</p>
                 </div>
                 <div className="p-2 space-y-1">
                    <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                      Your Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
                      Settings
                    </button>
                 </div>
                 <div className="p-2 border-t border-outline-variant">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>

    </header>
  );
};

export default TopAppBar;

