import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Logo from './Logo';

const Sidebar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen, settings, updateSettings, setCommandCenterState, profile } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = settings?.layout?.sidebarCollapsed || false;

  const navItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Overview', path: '/' },
    { id: 'subjects', icon: 'school', label: 'Subjects', path: '/subjects' },
    { id: 'inbox', icon: 'menu_book', label: 'Materials', path: '/inbox' },
    { id: 'plan', icon: 'check_circle', label: 'Planner', path: '/plan' },
    { id: 'analytics', icon: 'monitoring', label: 'Progress', path: '/analytics' },
  ];

  const toggleSidebar = () => {
    updateSettings('layout', 'sidebarCollapsed', !isCollapsed);
  };

  const toggleCommandCenter = () => {
    setCommandCenterState('panel');
  };

  return (
    <aside className={`hidden lg:flex bg-white border-r border-outline-variant fixed top-0 left-0 bottom-0 flex-col z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-[260px]'}`}>
      <div className={`h-20 flex items-center px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-8 h-8 shrink-0 text-primary" />
          {!isCollapsed && <h1 className="text-xl font-bold text-on-surface tracking-tight whitespace-nowrap">StudyNex</h1>}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
        {isCollapsed && (
          <button onClick={toggleSidebar} className="w-full mb-4 flex justify-center text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
          </button>
        )}
        
        <nav className="space-y-1.5 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActive 
                    ? 'bg-primary-container text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={`px-4 pb-4 space-y-1.5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <NavLink 
          to="/profile"
          title={isCollapsed ? 'Profile' : undefined}
          className={({ isActive }) => 
            `flex items-center ${isCollapsed ? 'justify-center px-0 w-10 h-10' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
              isActive 
                ? 'bg-primary-container text-primary shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`
        }>
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>person</span>
              {!isCollapsed && <span>Profile</span>}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/settings"
          title={isCollapsed ? 'Settings' : undefined}
          className={({ isActive }) => 
            `flex items-center ${isCollapsed ? 'justify-center px-0 w-10 h-10' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
              isActive 
                ? 'bg-primary-container text-primary shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`
        }>
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>tune</span>
              {!isCollapsed && <span>Settings</span>}
            </>
          )}
        </NavLink>
      </div>

      {!isCollapsed && profile && (
        <div className="p-4 border-t border-outline-variant flex items-center justify-between hover:bg-surface-variant cursor-pointer transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant shrink-0">
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-on-surface truncate leading-tight">{profile.firstName} {profile.lastName}</span>
              <span className="text-[11px] text-on-surface-variant truncate font-medium">{profile.institution || 'Stanford University'}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">unfold_more</span>
        </div>
      )}
      {isCollapsed && profile && (
         <div className="p-4 border-t border-outline-variant flex justify-center">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant shrink-0 cursor-pointer hover:opacity-80">
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
         </div>
      )}
    </aside>
  );
};

export default Sidebar;

