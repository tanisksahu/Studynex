import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// --- Reusable Settings Components ---
const SettingsSection = ({ title, description, children }) => (
  <div className="mb-10">
    <div className="mb-4">
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      {description && <p className="text-sm font-medium text-on-surface-variant mt-1">{description}</p>}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SettingsToggle = ({ title, description, checked, onChange, disabled }) => (
  <div className={`flex items-center justify-between p-5 bg-surface rounded-2xl border border-outline-variant shadow-soft transition-colors ${disabled ? 'opacity-50' : 'hover:border-primary/30 group'}`}>
    <div className="pr-4">
      <h4 className="font-bold text-sm text-on-surface mb-1">{title}</h4>
      <p className="text-[13px] font-medium text-on-surface-variant leading-relaxed max-w-sm">{description}</p>
    </div>
    <button 
      disabled={disabled}
      onClick={() => onChange(!checked)} 
      className={`w-14 h-7 shrink-0 rounded-full relative transition-colors ${checked ? 'bg-primary border-primary shadow-soft' : 'bg-surface-variant border border-outline-variant group-hover:border-outline'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full transition-all shadow-sm flex items-center justify-center ${checked ? 'right-[4px]' : 'left-[4px]'}`}>
          {checked && <span className="material-symbols-outlined text-[12px] text-primary">check</span>}
      </div>
    </button>
  </div>
);

const SettingsSelect = ({ title, description, options, value, onChange }) => (
  <div className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-outline-variant shadow-soft hover:border-primary/30 transition-colors">
    <div className="pr-4">
      <h4 className="font-bold text-sm text-on-surface mb-1">{title}</h4>
      <p className="text-[13px] font-medium text-on-surface-variant leading-relaxed max-w-sm">{description}</p>
    </div>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm font-bold px-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-soft cursor-pointer"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);


const Settings = () => {
  const { settings, updateSettings, profile, setProfile } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabId, setActiveTabId] = useState('appearance');

  const tabs = [
    { id: 'appearance', icon: 'palette', label: 'Appearance' },
    { id: 'layout', icon: 'dashboard_customize', label: 'Layout' },
    { id: 'profile', icon: 'account_circle', label: 'Profile' },
    { id: 'study', icon: 'trending_up', label: 'Study Preferences' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'ai', icon: 'psychology', label: 'Command Center & AI' },
    { id: 'data', icon: 'privacy_tip', label: 'Data & Privacy' }
  ];

  const handleWipeData = () => {
     if(window.confirm("CRITICAL WARNING: This will permanently delete all your local StudyNex data. Proceed?")) {
       localStorage.clear();
       window.location.reload();
     }
  };

  // Filter tabs based on search
  const filteredTabs = useMemo(() => {
    if (!searchQuery) return tabs;
    const q = searchQuery.toLowerCase();
    return tabs.filter(t => t.label.toLowerCase().includes(q) || t.id.includes(q));
  }, [searchQuery]);

  const containerLoader = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemLoader = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' } } };

  return (
    <main className="p-4 lg:p-8 xl:p-12 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="max-w-[1200px] mx-auto">
        
        {/* Header & Search */}
        <motion.div variants={itemLoader} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
           <div>
             <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-on-surface mb-2 flex items-center gap-4">
               Settings
             </h1>
             <p className="text-on-surface-variant font-medium text-sm lg:text-base">
               Customize your academic workspace and intelligence engine.
             </p>
           </div>
           
           <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                placeholder="Search settings..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
           </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-[65vh]">
          
          {/* Settings Sidebar */}
          <motion.div variants={itemLoader} className="w-full lg:w-72 shrink-0">
             <div className="sticky top-24 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible custom-scrollbar pb-2">
                {filteredTabs.length === 0 ? (
                  <p className="text-sm text-on-surface-variant p-4">No settings found.</p>
                ) : (
                  filteredTabs.map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`flex items-center gap-3 whitespace-nowrap lg:w-full text-left px-4 py-3.5 rounded-xl transition-all font-bold text-sm tracking-wide ${activeTabId === tab.id ? 'bg-primary text-white shadow-soft' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface border border-transparent'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))
                )}
             </div>
          </motion.div>

          {/* Settings Content Area */}
          <motion.div variants={itemLoader} className="flex-1 relative">
             <div className="sn-card p-6 lg:p-10 relative min-h-[500px] border-none bg-transparent lg:bg-surface lg:border lg:border-outline-variant shadow-none lg:shadow-elevated">
                
                <AnimatePresence mode="wait">
                  {activeTabId === 'appearance' && (
                    <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Theme Preferences" description="Adjust the visual style of StudyNex.">
                        <SettingsSelect 
                          title="Color Theme" 
                          description="Choose between light and dark modes."
                          value={settings.appearance?.theme || 'light'}
                          onChange={(v) => updateSettings('appearance', 'theme', v)}
                          options={[
                            { label: 'Light Mode', value: 'light' },
                            { label: 'Dark Mode (Pro)', value: 'dark' },
                            { label: 'System Default', value: 'system' }
                          ]}
                        />
                        <SettingsSelect 
                          title="Accent Color" 
                          description="Change the primary brand color."
                          value={settings.appearance?.colorMode || 'emerald'}
                          onChange={(v) => updateSettings('appearance', 'colorMode', v)}
                          options={[
                            { label: 'Emerald (Default)', value: 'emerald' },
                            { label: 'Indigo', value: 'indigo' },
                            { label: 'Rose', value: 'rose' }
                          ]}
                        />
                        <SettingsSelect 
                          title="UI Density" 
                          description="Control the spacing and size of interface elements."
                          value={settings.appearance?.density || 'comfortable'}
                          onChange={(v) => updateSettings('appearance', 'density', v)}
                          options={[
                            { label: 'Comfortable', value: 'comfortable' },
                            { label: 'Compact', value: 'compact' }
                          ]}
                        />
                      </SettingsSection>
                    </motion.div>
                  )}

                  {activeTabId === 'layout' && (
                    <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Global Layout" description="Customize how the application shell is structured.">
                        <SettingsToggle 
                          title="Collapse Sidebar" 
                          description="Keep the navigation sidebar minimized by default to save space."
                          checked={settings.layout?.sidebarCollapsed || false}
                          onChange={(v) => updateSettings('layout', 'sidebarCollapsed', v)}
                        />
                        <SettingsSelect 
                          title="Sidebar Position" 
                          description="Move the sidebar to the left or right side of the screen."
                          value={settings.layout?.sidebarPosition || 'left'}
                          onChange={(v) => updateSettings('layout', 'sidebarPosition', v)}
                          options={[
                            { label: 'Left', value: 'left' },
                            { label: 'Right', value: 'right' }
                          ]}
                        />
                      </SettingsSection>
                    </motion.div>
                  )}

                  {activeTabId === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Personal Information" description="Your identity across StudyNex.">
                        <div className="flex flex-col md:flex-row gap-6 p-6 bg-surface rounded-2xl border border-outline-variant shadow-soft mb-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-variant relative group shrink-0">
                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                               <span className="material-symbols-outlined text-white">edit</span>
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                     const reader = new FileReader();
                                     reader.onloadend = () => {
                                        setProfile({ ...profile, avatarUrl: reader.result });
                                        toast.success('Profile photo updated');
                                     };
                                     reader.readAsDataURL(file);
                                  }
                               }} />
                            </label>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">First Name</label>
                                <input type="text" value={profile.firstName} onChange={e=>setProfile({...profile, firstName: e.target.value})} className="w-full bg-surface-variant border border-outline-variant text-on-surface font-medium text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all shadow-inner-soft" />
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Last Name</label>
                                <input type="text" value={profile.lastName} onChange={e=>setProfile({...profile, lastName: e.target.value})} className="w-full bg-surface-variant border border-outline-variant text-on-surface font-medium text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all shadow-inner-soft" />
                              </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Institution</label>
                                <input type="text" value={profile.institution} onChange={e=>setProfile({...profile, institution: e.target.value})} className="w-full bg-surface-variant border border-outline-variant text-on-surface font-medium text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all shadow-inner-soft" />
                            </div>
                          </div>
                        </div>
                      </SettingsSection>
                    </motion.div>
                  )}

                  {activeTabId === 'study' && (
                    <motion.div key="study" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Academic Goals" description="Set your baseline targets for the semester.">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2 sm:col-span-1 border border-outline-variant rounded-2xl p-5 bg-surface shadow-soft">
                              <h4 className="font-bold text-sm text-on-surface mb-3">Target GPA</h4>
                              <div className="flex items-center gap-3 mt-1">
                                 <input type="number" step="0.1" value={profile.targetGpa} onChange={e=>setProfile({...profile, targetGpa: parseFloat(e.target.value)})} className="bg-surface-variant/50 border border-outline-variant text-on-surface w-full px-4 py-3 rounded-xl font-bold focus:border-primary outline-none transition-all shadow-inner-soft" />
                                 <span className="text-sm text-on-surface-variant font-bold">/ 4.0</span>
                              </div>
                           </div>
                           <div className="col-span-2 sm:col-span-1 border border-outline-variant rounded-2xl p-5 bg-surface shadow-soft">
                              <h4 className="font-bold text-sm text-on-surface mb-3">Daily Focus Hours</h4>
                              <div className="flex items-center gap-3 mt-1">
                                 <input type="number" step="0.5" value={settings.study?.dailyFocusHours || 2} onChange={e=>updateSettings('study', 'dailyFocusHours', parseFloat(e.target.value))} className="bg-surface-variant/50 border border-outline-variant text-on-surface w-full px-4 py-3 rounded-xl font-bold focus:border-primary outline-none transition-all shadow-inner-soft" />
                                 <span className="text-sm text-on-surface-variant font-bold">Hrs</span>
                              </div>
                           </div>
                        </div>
                      </SettingsSection>
                    </motion.div>
                  )}

                  {activeTabId === 'notifications' && (
                    <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Alert Preferences" description="Manage how StudyNex interrupts you.">
                        <SettingsToggle 
                          title="Push Notifications" 
                          description="Allow browser-level notifications for crucial alerts."
                          checked={settings.notifications?.push || false}
                          onChange={(v) => updateSettings('notifications', 'push', v)}
                        />
                        <SettingsToggle 
                          title="Task Reminders" 
                          description="Receive alerts 15 minutes before scheduled tasks."
                          checked={settings.notifications?.reminders || false}
                          onChange={(v) => updateSettings('notifications', 'reminders', v)}
                        />
                        <SettingsToggle 
                          title="AI Agent Feedback" 
                          description="Show toast notifications when the AI performs background tasks."
                          checked={settings.notifications?.agentFeedback || false}
                          onChange={(v) => updateSettings('notifications', 'agentFeedback', v)}
                        />
                      </SettingsSection>
                    </motion.div>
                  )}

                  {activeTabId === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Intelligence Engine" description="Configure the autonomous capabilities of the Command Center.">
                        <SettingsToggle 
                          title="Context Injection" 
                          description="Allow the AI to read your Subjects and Exam schedules to provide personalized answers."
                          checked={settings.ai?.autoInjection || false}
                          onChange={(v) => updateSettings('ai', 'autoInjection', v)}
                        />
                        <SettingsToggle 
                          title="Proactive Suggestions" 
                          description="Permit the AI to suggest new tasks or schedule adjustments without being prompted."
                          checked={settings.ai?.proactiveSuggestions || false}
                          onChange={(v) => updateSettings('ai', 'proactiveSuggestions', v)}
                        />
                      </SettingsSection>
                    </motion.div>
                  )}

                  {activeTabId === 'data' && (
                    <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      <SettingsSection title="Data & Privacy" description="Take control of your footprint.">
                        <SettingsToggle 
                          title="Public Profile" 
                          description="Allow your leaderboard rank to be visible to others at your institution."
                          checked={settings.privacy?.publicProfile || false}
                          onChange={(v) => updateSettings('privacy', 'publicProfile', v)}
                        />
                        <div className="flex items-center justify-between p-5 bg-error/5 rounded-2xl border border-error/20 mt-8">
                          <div>
                            <h4 className="font-bold text-sm text-error mb-1">Danger Zone: Wipe State</h4>
                            <p className="text-[13px] font-medium text-error/80 max-w-sm">Permanently deletes current local state and resets all progress.</p>
                          </div>
                          <button onClick={handleWipeData} className="px-5 py-2.5 bg-error hover:bg-error/90 text-white font-bold text-sm rounded-xl shadow-soft">
                             Factory Reset
                          </button>
                        </div>
                      </SettingsSection>
                    </motion.div>
                  )}

                </AnimatePresence>
                
             </div>
          </motion.div>

        </div>
      </motion.div>
    </main>
  );
};

export default Settings;
