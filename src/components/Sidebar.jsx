import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'inbox', icon: 'inbox', label: 'Materials Inbox', path: '/inbox' },
    { id: 'plan', icon: 'calendar_today', label: 'Mission Planner', path: '/plan' },
    { id: 'exams', icon: 'school', label: 'Priority Subjects', path: '/exams' },
    { id: 'analytics', icon: 'monitoring', label: 'Mastery Engine', path: '/analytics' },
  ];

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center gap-3 relative z-10 border-b border-outline-variant/10">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
          <span className="material-symbols-outlined text-white text-xl">school</span>
        </div>
        <h1 className="text-xl font-headline font-black tracking-widest text-[#e2e8f0]">STUDYNEX</h1>
        
        {/* Mobile Close Button */}
        <button 
          className="lg:hidden ml-auto text-on-surface-variant hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10">
        <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Core Systems</p>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-bold group border ${
                  isActive 
                    ? 'bg-primary/20 text-primary border-primary/30 shadow-[inset_0_0_20px_rgba(79,70,229,0.15)] shadow-[0_0_15px_rgba(79,70,229,0.1)]' 
                    : 'text-on-surface-variant border-transparent hover:bg-surface-container hover:text-white hover:border-outline-variant/20'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(195,192,255,0.6)]' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-outline-variant/10 relative z-10 space-y-2">
        <NavLink 
          to="/profile" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => 
            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-bold group border ${
              isActive 
                ? 'bg-primary/20 text-primary border-primary/30 shadow-[inset_0_0_20px_rgba(79,70,229,0.15)]' 
                : 'text-on-surface-variant border-transparent hover:bg-surface-container hover:text-white hover:border-outline-variant/20'
            }`
        }>
          <span className="material-symbols-outlined">person</span>
          <span className="text-sm tracking-wide">Scholar Identity</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => 
            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-bold group border ${
              isActive 
                ? 'bg-primary/20 text-primary border-primary/30 shadow-[inset_0_0_20px_rgba(79,70,229,0.15)]' 
                : 'text-on-surface-variant border-transparent hover:bg-surface-container hover:text-white hover:border-outline-variant/20'
            }`
        }>
          <span className="material-symbols-outlined">tune</span>
          <span className="text-sm tracking-wide">System Settings</span>
        </NavLink>
      </div>
      
      {/* Abstract Background Blur inside Sidebar */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none z-0"></div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-surface-container-low border-r border-outline-variant/10 fixed top-0 left-0 bottom-0 flex-col neo-glass shadow-2xl z-40 overflow-hidden">
         {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-sm z-[90] lg:hidden"
          >
             <motion.aside
               initial={{ x: '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: '-100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               onClick={(e) => e.stopPropagation()}
               className="w-72 bg-surface-container-low border-r border-outline-variant/20 h-full flex flex-col neo-glass shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-[100] relative overflow-hidden"
             >
                {sidebarContent}
             </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
