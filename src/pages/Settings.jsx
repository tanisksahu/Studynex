import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
  const { settings, updateSettings, setProfile, profile } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');

  const handleWipeData = () => {
     if(window.confirm("Are you sure? This will reset your profile XP and settings.")) {
       localStorage.clear();
       window.location.reload();
     }
  };

  const containerLoader = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemLoader = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <main className="p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8">
        
        <motion.div variants={itemLoader} className="flex justify-between items-end mb-6">
           <div>
             <h2 className="font-headline text-3xl font-black uppercase tracking-widest flex items-center mb-1">
               <span className="material-symbols-outlined mr-4 text-indigo-500 text-4xl">tune</span>
               System Settings
             </h2>
             <p className="text-on-surface-variant text-sm font-medium pl-14">Configure interface, intelligence nodes, and data states.</p>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[60vh]">
          
          {/* Settings Sidebar Tabs (3 Cols) */}
          <motion.div variants={itemLoader} className="lg:col-span-3">
             <div className="bg-surface-container-low p-4 rounded-3xl border border-outline-variant/10 shadow-lg sticky top-8 flex flex-col gap-2">
                {[
                  { id: 'general', icon: 'palette', label: 'UI & Theme' },
                  { id: 'profile', icon: 'account_circle', label: 'Account' },
                  { id: 'study', icon: 'trending_up', label: 'Study Focus' },
                  { id: 'ai', icon: 'psychology', label: 'Intelligence' },
                  { id: 'notifications', icon: 'notifications', label: 'Alerts' },
                  { id: 'data', icon: 'privacy_tip', label: 'Data & Privacy' },
                  { id: 'advanced', icon: 'developer_board', label: 'Advanced' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-widest ${activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(195,192,255,0.1)]' : 'text-on-surface-variant hover:bg-surface-container hover:text-white border border-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
             </div>
          </motion.div>

          {/* Settings Content Area (9 Cols) */}
          <motion.div variants={itemLoader} className="lg:col-span-9 relative">
             <div className="bg-surface-container p-8 lg:p-12 rounded-3xl border border-outline-variant/10 shadow-2xl backdrop-blur-xl relative z-10 min-h-full">
                
                {activeTab === 'general' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4">UI & Theme</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5">
                      <div>
                        <h4 className="font-bold text-white mb-1">Theme Interface</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">System relies on Neon Dark Glassmorphism.</p>
                      </div>
                      <button onClick={() => toast.error('Light theme locked for prototype stability', { style: { background: '#222', color: '#ff5c5c' }})} className="w-14 h-8 bg-primary rounded-full relative shadow-[0_0_15px_rgba(195,192,255,0.4)] border border-indigo-300">
                        <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                           <span className="material-symbols-outlined text-primary text-[14px]">dark_mode</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4">Account Configuration</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2 sm:col-span-1">
                          <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">First Name</label>
                          <input type="text" disabled value={profile.firstName} className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl opacity-50 cursor-not-allowed" />
                       </div>
                       <div className="col-span-2 sm:col-span-1">
                          <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Institution</label>
                          <input type="text" disabled value={profile.institution} className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl opacity-50 cursor-not-allowed" />
                       </div>
                    </div>
                    <p className="text-xs text-on-surface-variant">Profile modifications are handled exclusively in the Scholar Identity page.</p>
                  </motion.div>
                )}

                {activeTab === 'study' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined">trending_up</span> Study Preferences
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2 sm:col-span-1 border border-outline-variant/10 rounded-2xl p-6 bg-surface-container-highest">
                          <h4 className="font-bold text-white mb-1">Target GPA</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <input type="number" step="0.1" value={profile.targetGpa} onChange={e=>setProfile({...profile, targetGpa: parseFloat(e.target.value)})} className="bg-[#0b1326]/80 text-white w-20 px-3 py-2 rounded-lg text-center font-bold" />
                             <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">/ 4.0</span>
                          </div>
                       </div>
                       <div className="col-span-2 sm:col-span-1 border border-outline-variant/10 rounded-2xl p-6 bg-surface-container-highest">
                          <h4 className="font-bold text-white mb-1">XP Goal / Day</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <input type="number" step="10" placeholder="500" className="bg-[#0b1326]/80 text-white w-20 px-3 py-2 rounded-lg text-center font-bold" />
                             <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">XP</span>
                          </div>
                          <button onClick={() => toast.success('Target lock confirmed!')} className="mt-4 px-4 py-2 w-full bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/40 transition-colors">Lock Goal</button>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4 flex items-center gap-2 text-primary">
                       <span className="material-symbols-outlined">auto_awesome</span> Intelligence Engine
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5 hover:border-primary/20 transition-colors group">
                      <div>
                        <h4 className="font-bold text-white mb-1">AI Context Injection</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Allow AI to passively scan your uploaded notes and generate spontaneous Mock Exams.</p>
                      </div>
                      <button 
                        onClick={() => updateSettings('aiInjection', !settings.aiInjection)} 
                        className={`w-14 h-8 rounded-full relative transition-colors ${settings.aiInjection ? 'bg-primary shadow-[0_0_15px_rgba(195,192,255,0.4)] border border-indigo-300' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.aiInjection ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5">
                      <div>
                        <h4 className="font-bold text-white mb-1">Auto-Suggest Planning</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Agent attempts to preemptively drop Tasks into mission protocol.</p>
                      </div>
                      <button 
                        onClick={() => toast.success('Toggle saved into memory state')} 
                        className="w-14 h-8 bg-primary rounded-full relative shadow-[0_0_15px_rgba(195,192,255,0.4)] border border-indigo-300"
                      >
                        <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'advanced' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined">developer_board</span> Advanced / Developer
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5">
                      <div>
                        <h4 className="font-bold text-white mb-1">Hardware Acceleration UI</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Attempt strictly WebGL renders for holographic animations.</p>
                      </div>
                      <button className="px-4 py-1 text-[0.65rem] border border-primary/50 text-primary bg-primary/10 rounded-full font-bold tracking-widest uppercase cursor-not-allowed opacity-50">Locked</button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'data' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4 text-error">Data & Privacy</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5">
                      <div>
                        <h4 className="font-bold text-white mb-1">Export Academic Record</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Download raw JSON of syllabus map and completion rates.</p>
                      </div>
                      <button onClick={() => toast.success('JSON payload constructing...')} className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 font-black uppercase tracking-widest text-[0.65rem] rounded-xl transition-all">
                         Export State
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-error/5 rounded-2xl border border-error/10 hover:border-error/30 transition-colors">
                      <div>
                        <h4 className="font-bold text-error mb-1">Local Storage Wipe</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Permanently deletes current mock state, resets gamification XP, and flushes Materials buffer.</p>
                      </div>
                      <button onClick={handleWipeData} className="px-6 py-2 bg-error hover:bg-error/80 text-[#0b1326] font-black uppercase tracking-widest text-xs rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,92,92,0.3)]">
                         Wipe State
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="font-headline text-xl font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-4">Alert Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5">
                        <div>
                          <h4 className="font-bold text-white mb-1">Study Reminders & Exam Deadlines</h4>
                          <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Push notifications for scheduled tasks.</p>
                        </div>
                        <button 
                          onClick={() => updateSettings('reminders', !settings.reminders)} 
                          className={`w-14 h-8 rounded-full relative transition-colors ${settings.reminders ? 'bg-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)] border border-[#4edea3]' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.reminders ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/5">
                        <div>
                          <h4 className="font-bold text-white mb-1">Agent Feedback</h4>
                          <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Toast popups upon Autonomous Action execution.</p>
                        </div>
                        <button 
                          onClick={() => updateSettings('notifications', !settings.notifications)} 
                          className={`w-14 h-8 rounded-full relative transition-colors ${settings.notifications ? 'bg-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)] border border-[#4edea3]' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
             </div>
             
             {/* Abstract BG blob */}
             {activeTab === 'ai' && <div className="absolute right-[-10%] top-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>}
             {activeTab === 'data' && <div className="absolute right-[-10%] top-1/4 w-64 h-64 bg-error/10 rounded-full blur-[80px] pointer-events-none"></div>}
          </motion.div>

        </div>
      </motion.div>
    </main>
  );
};

export default Settings;
