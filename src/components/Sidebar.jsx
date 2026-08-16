import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Logo from './Logo';

const Sidebar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen, settings, updateSettings, setCommandCenterState } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = settings?.layout?.sidebarCollapsed || false;

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Overview', path: '/' },
    { id: 'subjects', icon: 'auto_stories', label: 'Subjects', path: '/subjects' },
    { id: 'inbox', icon: 'inbox', label: 'Materials', path: '/inbox' },
    { id: 'plan', icon: 'check_circle', label: 'Planner', path: '/plan' },
    { id: 'exams', icon: 'calendar_month', label: 'Exams', path: '/exams' },
    { id: 'analytics', icon: 'monitoring', label: 'Progress', path: '/analytics' },
  ];

  const toggleSidebar = () => {
    updateSettings('layout', 'sidebarCollapsed', !isCollapsed);
  };

  const toggleCommandCenter = () => {
    setCommandCenterState('panel');
  };

  return (
    <aside className={`hidden lg:flex bg-surface border-r border-outline-variant fixed top-0 left-0 bottom-0 flex-col z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`h-16 flex items-center border-b border-outline-variant px-5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-8 h-8 shrink-0" />
          {!isCollapsed && <h1 className="text-xl font-bold text-on-surface tracking-tight whitespace-nowrap">StudyNex</h1>}
        </div>
        {!isCollapsed && (
          <button onClick={toggleSidebar} className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {isCollapsed && (
          <button onClick={toggleSidebar} className="w-full mb-4 flex justify-center text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
          </button>
        )}
        
        <nav className="space-y-1">
          <button
            onClick={toggleCommandCenter}
            className={`
              group relative flex w-full items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 my-1 rounded-lg font-medium transition-all duration-200
              text-on-surface-variant hover:bg-surface-variant hover:text-on-surface
            `}
            title={isCollapsed ? "Command Center" : undefined}
          >
            <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110`}>terminal</span>
            
            {!isCollapsed && (
              <span className="text-sm">Command Center</span>
            )}
          </button>

          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container' 
                    : 'text-on-surface hover:bg-surface-variant'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={`p-4 border-t border-outline-variant space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <NavLink 
          to="/profile"
          title={isCollapsed ? 'Profile' : undefined}
          className={({ isActive }) => 
            `flex items-center ${isCollapsed ? 'justify-center px-0 w-10 h-10' : 'gap-3 px-3'} py-2.5 rounded-lg transition-colors font-medium text-sm ${
              isActive 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface hover:bg-surface-variant'
            }`
        }>
          <span className="material-symbols-outlined text-[20px]">person</span>
          {!isCollapsed && <span>Profile</span>}
        </NavLink>
        
        <NavLink 
          to="/settings"
          title={isCollapsed ? 'Settings' : undefined}
          className={({ isActive }) => 
            `flex items-center ${isCollapsed ? 'justify-center px-0 w-10 h-10' : 'gap-3 px-3'} py-2.5 rounded-lg transition-colors font-medium text-sm ${
              isActive 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface hover:bg-surface-variant'
            }`
        }>
          <span className="material-symbols-outlined text-[20px]">tune</span>
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

