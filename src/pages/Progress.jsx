import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Progress = () => {
  const { subjects, materials, tasks, setTasks } = useAppContext();

  const totalUnits = useMemo(() => subjects.reduce((acc, sub) => acc + sub.units, 0), [subjects]);
  const averageProgress = useMemo(() => subjects.length ? Math.round(subjects.reduce((acc, sub) => acc + sub.progress, 0) / subjects.length) : 0, [subjects]);

  const handleFixPlan = (subName) => {
    toast.success(`Generated Revision Plan for ${subName}!`);
    setTasks(prev => [
      ...prev,
      { id: Date.now(), title: `AI Re-Review: ${subName}`, time: 'Scheduled', completed: false, isLive: false, priority: true }
    ]);
  };

  const containerLoader = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemLoader = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <main className="p-4 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header Cards */}
        <motion.div variants={itemLoader} className="sn-card p-6 lg:p-10 border-t-4 border-primary relative overflow-hidden bg-white shadow-elevated">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <span className="material-symbols-outlined text-[24px]">neurology</span>
                </div>
                Mastery Engine
              </h1>
              <p className="text-on-surface-variant font-medium text-sm lg:text-base pl-14">Real-time quantification of your academic preparedness across all indexed materials.</p>
            </div>
            
            <div className="bg-surface/50 p-5 rounded-2xl border border-outline-variant flex items-center gap-8 shadow-inner-soft relative overflow-hidden shrink-0">
               <div className="text-center relative z-10">
                 <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Global Mastery</span>
                 <span className="text-3xl font-bold text-primary">{averageProgress}%</span>
               </div>
               <div className="h-12 w-[2px] bg-outline-variant/60 relative z-10"></div>
               <div className="text-center relative z-10">
                 <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Materials</span>
                 <span className="text-3xl font-bold text-secondary">{materials.length}</span>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Subject Analytics Cards */}
          <div className="lg:col-span-2 space-y-6">
            <motion.h3 variants={itemLoader} className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant pb-4">
               <span className="material-symbols-outlined text-[20px] text-secondary">donut_large</span> Subject Breakdown
            </motion.h3>
            <motion.div variants={itemLoader} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {subjects.map((sub, i) => {
                const colors = ['primary', 'secondary', 'error', 'tertiary'];
                const color = sub.weak ? 'error' : colors[i % colors.length];
                
                // Color mapping for explicit classes since dynamic classes can be purged by tailwind
                const bgColors = {
                  primary: 'bg-primary', secondary: 'bg-secondary', error: 'bg-error', tertiary: 'bg-tertiary'
                };
                const bgLightColors = {
                  primary: 'bg-primary/10', secondary: 'bg-secondary/10', error: 'bg-error/10', tertiary: 'bg-tertiary/10'
                };
                const borderColors = {
                  primary: 'border-primary/20', secondary: 'border-secondary/20', error: 'border-error/20', tertiary: 'border-tertiary/20'
                };
                const textColors = {
                  primary: 'text-primary', secondary: 'text-secondary', error: 'text-error', tertiary: 'text-primary'
                };
                const strokeColors = {
                  primary: 'stroke-primary', secondary: 'stroke-secondary', error: 'stroke-error', tertiary: 'stroke-tertiary'
                };

                return (
                  <div key={sub.id} className={`bg-white p-6 sm:p-7 rounded-2xl border transition-all hover:-translate-y-1 group ${sub.weak ? 'border-error/30 shadow-[0_4px_20px_rgba(255,82,82,0.1)] hover:shadow-[0_8px_30px_rgba(255,82,82,0.15)]' : 'border-outline-variant shadow-sm hover:border-primary/30 hover:shadow-soft'} relative overflow-hidden flex flex-col`}>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <h3 className="font-bold text-lg w-3/4 leading-tight text-on-surface">{sub.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${bgLightColors[color]} border ${borderColors[color]} px-2 py-1 flex items-center gap-1 rounded ${textColors[color]}`}>
                        {sub.weak ? <><span className="material-symbols-outlined text-[14px]">warning</span> At Risk</> : <><span className="material-symbols-outlined text-[14px]">verified</span> Strong</>}
                      </span>
                    </div>
                    
                    <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center group/svg relative z-10">
                      <svg className="w-full h-full transform -rotate-90 transition-transform duration-500 drop-shadow-sm" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" className="stroke-surface-variant/50" strokeWidth="6" />
                        <circle cx="50" cy="50" r="40" fill="transparent" 
                                className={`${strokeColors[color]} transition-all duration-1500 ease-out`} strokeWidth="6" 
                                strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * sub.progress) / 100} 
                                strokeLinecap="round" />
                      </svg>
                      <div className="absolute text-center flex flex-col items-center">
                        <span className={`text-3xl font-bold tracking-tight ${textColors[color]}`}>{sub.progress}%</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">Syllabus</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto text-center relative z-10 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-surface-variant/30 p-3 rounded-xl border border-outline-variant/50 text-center">
                             <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Retention</span>
                             <span className={`text-base font-bold ${sub.retention > 80 ? 'text-primary' : sub.retention > 60 ? 'text-secondary' : 'text-error'}`}>{sub.retention}%</span>
                          </div>
                          <div className="bg-surface-variant/30 p-3 rounded-xl border border-outline-variant/50 text-center">
                             <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Time In</span>
                             <span className="text-base font-bold text-on-surface">{sub.timeSpent}m</span>
                          </div>
                       </div>

                      {sub.weak ? (
                        <>
                          <button onClick={() => handleFixPlan(sub.name)} className="w-full py-3 bg-error hover:bg-error/90 text-white transition-colors rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-soft mt-2">
                             <span className="material-symbols-outlined text-[20px]">bolt</span> Boost Retention
                          </button>
                        </>
                      ) : (
                        <div className="py-3 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center gap-2 mt-2">
                          <span className="material-symbols-outlined text-[18px] text-primary">psychology</span>
                          <span className="text-[11px] text-primary font-bold uppercase tracking-wider">Optimized State</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Right Column: AI Insights & Radar */}
          <div className="space-y-6">
            <motion.h3 variants={itemLoader} className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant pb-4">
               <span className="material-symbols-outlined text-[20px] text-primary">psychology</span> AI Insights
            </motion.h3>
            
            <motion.div variants={itemLoader} className="sn-card p-6 border-t-4 border-primary shadow-elevated relative overflow-hidden bg-white">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <span className="material-symbols-outlined text-[140px] text-primary">auto_awesome</span>
               </div>
               
               <ul className="space-y-4 relative z-10">
                 <li className="flex gap-4 items-start bg-white p-5 rounded-xl border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-soft transition-all cursor-pointer group">
                   <div className="bg-error/10 border border-error/20 p-2.5 rounded-lg shrink-0 group-hover:bg-error/20 transition-colors">
                     <span className="material-symbols-outlined text-error text-[22px]">psychology_alt</span>
                   </div>
                   <div className="pt-0.5">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-sm text-error">Forgetting Curve Alert</h4>
                       <span className="text-[9px] font-bold uppercase tracking-wider text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded">High Prio</span>
                     </div>
                     <p className="text-[13px] font-medium text-on-surface-variant leading-relaxed">
                       You haven't reviewed <strong className="text-on-surface font-bold">Linear Algebra Unit 1</strong> in 14 days. Retention is dropping below 60%.
                     </p>
                   </div>
                 </li>

                 <li className="flex gap-4 items-start bg-white p-5 rounded-xl border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-soft transition-all cursor-pointer group">
                   <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                     <span className="material-symbols-outlined text-primary text-[22px]">quiz</span>
                   </div>
                   <div className="pt-0.5">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-sm text-primary">Predicted Question</h4>
                       <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">94% Prob</span>
                     </div>
                     <p className="text-[13px] font-medium text-on-surface-variant leading-relaxed">
                       Based on past midterms, expect a 15-mark question on <strong className="text-on-surface font-bold">Dijkstra's Algorithm</strong>. Review your PDF notes.
                     </p>
                   </div>
                 </li>
                 
                 <li className="flex gap-4 items-start bg-white p-5 rounded-xl border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-soft transition-all cursor-pointer group">
                   <div className="bg-secondary/10 border border-secondary/20 p-2.5 rounded-lg shrink-0 group-hover:bg-secondary/20 transition-colors">
                     <span className="material-symbols-outlined text-secondary text-[22px]">trending_up</span>
                   </div>
                   <div className="pt-0.5">
                     <h4 className="font-bold text-sm text-secondary mb-2">Momentum Maintained</h4>
                     <p className="text-[13px] font-medium text-on-surface-variant leading-relaxed">
                       You have completed <strong className="text-on-surface font-bold">{tasks.filter(t => t.completed).length} focus tasks</strong> today. Keep up the high bandwidth!
                     </p>
                   </div>
                 </li>
               </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Progress;
