import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const MobileBottomNav = () => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const { profile, setCommandCenterState } = useAppContext();

  const toggleCommandCenter = () => {
    setCommandCenterState('fullscreen');
  };

  const primaryNavItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Overview', path: '/' },
    { id: 'command', icon: 'magic_button', label: 'AI', action: toggleCommandCenter },
    { id: 'subjects', icon: 'auto_stories', label: 'Subjects', path: '/subjects' },
    { id: 'plan', icon: 'check_circle', label: 'Planner', path: '/plan' },
  ];

  const moreNavItems = [
    { id: 'inbox', icon: 'inbox', label: 'Materials Inbox', path: '/inbox' },
    { id: 'exams', icon: 'calendar_month', label: 'Exam Datesheet', path: '/exams' },
    { id: 'analytics', icon: 'monitoring', label: 'Study Progress', path: '/analytics' },
    { id: 'profile', icon: 'account_circle', label: 'Scholar Identity', path: '/profile' },
    { id: 'settings', icon: 'tune', label: 'System Settings', path: '/settings' },
  ];

  const handleNavigate = (path) => {
    setShowMore(false);
    navigate(path);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant pb-safe z-[60] flex justify-between px-2 pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {primaryNavItems.map(item => (
          item.action ? (
            <button
              key={item.id}
              onClick={item.action}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all rounded-xl mx-1 mb-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-[24px] mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-bold tracking-tight truncate max-w-full">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => 
                `flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all rounded-xl mx-1 mb-1 ${
                  isActive 
                    ? 'text-primary bg-primary-container' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[24px] mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold tracking-tight truncate max-w-full">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        ))}
        
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all rounded-xl mx-1 mb-1 ${
            showMore 
              ? 'text-on-surface bg-surface-variant' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] mb-0.5">
            {showMore ? 'close' : 'menu'}
          </span>
          <span className="text-[10px] font-bold tracking-tight truncate max-w-full">
            Menu
          </span>
        </button>
      </nav>

      {/* More Options Bottom Sheet */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-[50] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-[68px] left-2 right-2 bg-surface rounded-3xl shadow-elevated z-[55] overflow-hidden border border-outline-variant pb-safe"
            >
              <div className="p-4 border-b border-outline-variant bg-surface-variant/30 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden shrink-0">
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="font-bold text-sm text-on-surface">{profile.firstName} {profile.lastName}</p>
                    <p className="text-[11px] font-medium text-on-surface-variant">{profile.institution}</p>
                 </div>
              </div>
              <div className="p-2 space-y-1">
                {moreNavItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-variant text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px] text-on-surface-variant">{item.icon}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;
