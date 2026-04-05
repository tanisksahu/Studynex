import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Progress = () => {
  const { subjects, materials, tasks, setTasks } = useAppContext();

  const totalUnits = useMemo(() => subjects.reduce((acc, sub) => acc + sub.units, 0), [subjects]);
  const averageProgress = useMemo(() => subjects.length ? Math.round(subjects.reduce((acc, sub) => acc + sub.progress, 0) / subjects.length) : 0, [subjects]);

  const handleFixPlan = (subName) => {
    toast.success(`Generated Revision Plan for ${subName}!`, { icon: '🤖', style: { background: '#222', color: '#fff' }});
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <main className="p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8">
        
        {/* Header Cards */}
        <motion.div variants={itemLoader} className="flex flex-wrap gap-6 items-center bg-gradient-to-r from-surface-container-high to-surface-container p-10 rounded-3xl border border-outline-variant/10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="font-headline text-3xl font-black uppercase tracking-wider flex items-center mb-1">
                <span className="material-symbols-outlined mr-4 text-indigo-500 text-4xl">neurology</span>
                Mastery Engine
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">Real-time quantification of your academic preparedness across all indexed materials.</p>
            </div>
            
            <div className="bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 flex items-center gap-6 shadow-inner relative overflow-hidden">
               <div className="text-center relative z-10">
                 <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Global Mastery</span>
                 <span className="font-headline text-4xl font-black text-primary">{averageProgress}%</span>
               </div>
               <div className="h-10 w-[1px] bg-outline-variant/20 relative z-10"></div>
               <div className="text-center relative z-10">
                 <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Materials</span>
                 <span className="font-headline text-4xl font-black text-secondary">{materials.length}</span>
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_3s_infinite]"></div>
            </div>
          </div>
          <div className="absolute left-1/4 top-[-50%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Subject Analytics Cards */}
          <div className="lg:col-span-2 space-y-6">
            <motion.h3 variants={itemLoader} className="font-headline text-xl font-bold uppercase tracking-widest flex items-center pl-2">
               <span className="material-symbols-outlined mr-3 text-secondary">donut_large</span> Subject Breakdown
            </motion.h3>
            <motion.div variants={itemLoader} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {subjects.map((sub, i) => {
                const colors = ['primary', 'secondary', 'error', 'tertiary'];
                const color = sub.weak ? 'error' : colors[i % colors.length];

                return (
                  <div key={sub.id} className={`bg-surface-container p-6 rounded-3xl border transition-transform hover:-translate-y-1 hover:shadow-2xl group ${sub.weak ? 'border-error/30 shadow-error/10 hover:shadow-error/20' : 'border-outline-variant/10 hover:border-primary/30'} relative overflow-hidden`}>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <h3 className="font-headline font-black text-xl w-3/4 leading-tight">{sub.name}</h3>
                      <span className={`text-[0.60rem] font-black uppercase tracking-widest whitespace-nowrap bg-${color}/10 px-2 py-1 flex items-center gap-1 rounded text-${color}`}>
                        {sub.weak ? <><span className="material-symbols-outlined text-[12px]">warning</span> At Risk</> : <><span className="material-symbols-outlined text-[12px]">verified</span> Strong</>}
                      </span>
                    </div>
                    
                    <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center group/svg relative z-10">
                      <svg className="w-full h-full transform -rotate-90 group-hover/svg:scale-105 transition-transform duration-500" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" className="stroke-surface-container-highest" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="transparent" 
                                className={`stroke-${color} transition-all duration-1500 ease-out`} strokeWidth="8" 
                                strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * sub.progress) / 100} 
                                strokeLinecap="round" />
                      </svg>
                      <div className="absolute text-center flex flex-col items-center">
                        <span className={`text-3xl font-headline font-black text-${color}`}>{sub.progress}%</span>
                        <span className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest -mt-1">Syllabus</span>
                      </div>
                    </div>
                    
                    <div className="text-center relative z-10 space-y-4">
                       <div className="grid grid-cols-2 gap-2">
                          <div className="bg-surface-container-highest p-2 rounded-xl border border-outline-variant/10">
                             <span className="block text-[0.5rem] font-bold text-on-surface-variant uppercase">Retention</span>
                             <span className={`text-sm font-black ${sub.retention > 80 ? 'text-[#4edea3]' : sub.retention > 60 ? 'text-primary' : 'text-error'}`}>{sub.retention}%</span>
                          </div>
                          <div className="bg-surface-container-highest p-2 rounded-xl border border-outline-variant/10">
                             <span className="block text-[0.5rem] font-bold text-on-surface-variant uppercase">Time In</span>
                             <span className="text-sm font-black text-white">{sub.timeSpent}m</span>
                          </div>
                       </div>

                      {sub.weak ? (
                        <>
                          <p className="text-[0.6rem] text-error font-bold uppercase tracking-widest bg-error/5 border border-error/10 p-2 rounded-lg">High Probability of Knowledge Decay</p>
                          <button onClick={() => handleFixPlan(sub.name)} className="w-full py-2 bg-error/10 hover:bg-error text-error hover:text-[#0b1326] transition-colors border border-error/20 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-[16px]">bolt</span> Boost Retention
                          </button>
                        </>
                      ) : (
                        <p className="text-[0.6rem] text-primary font-bold uppercase tracking-widest bg-primary/5 border border-primary/10 p-2 rounded-lg flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">psychology</span> Optimized State
                        </p>
                      )}
                    </div>
                    {sub.weak && <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-error/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-error/20 transition-all"></div>}
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Right Column: AI Insights & Radar */}
          <div className="space-y-6">
            <motion.h3 variants={itemLoader} className="font-headline text-xl font-bold uppercase tracking-widest flex items-center pl-2">
               <span className="material-symbols-outlined mr-3 text-tertiary">psychology</span> AI Insights
            </motion.h3>
            
            <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-xl relative overflow-hidden backdrop-blur-md">
               <div className="absolute top-[-2%] right-[-2%] p-4 opacity-5">
                 <span className="material-symbols-outlined text-9xl text-primary animate-pulse">auto_awesome</span>
               </div>
               
               <ul className="space-y-4 relative z-10">
                 <li className="flex gap-4 items-start bg-error/5 p-4 rounded-2xl border border-error/10 shadow-lg shadow-error/5 hover:-translate-y-1 transition-transform cursor-pointer">
                   <div className="bg-error/20 p-2 rounded-lg">
                     <span className="material-symbols-outlined text-error text-xl shrink-0">psychology_alt</span>
                   </div>
                   <div>
                     <div className="flex justify-between items-start">
                       <h4 className="font-bold text-sm text-error mb-1">Forgetting Curve Alert</h4>
                       <span className="text-[0.55rem] font-black uppercase text-error bg-error/10 px-1.5 py-0.5 rounded">High Prio</span>
                     </div>
                     <p className="text-xs text-on-surface-variant leading-relaxed">
                       You haven't reviewed <strong className="text-white">Linear Algebra Unit 1</strong> in 14 days. Retention is dropping below 60%.
                     </p>
                   </div>
                 </li>

                 <li className="flex gap-4 items-start bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-lg shadow-primary/5 hover:-translate-y-1 transition-transform cursor-pointer">
                   <div className="bg-primary/20 p-2 rounded-lg">
                     <span className="material-symbols-outlined text-primary text-xl shrink-0">quiz</span>
                   </div>
                   <div>
                     <div className="flex justify-between items-start">
                       <h4 className="font-bold text-sm text-primary mb-1">Predicted Question</h4>
                       <span className="text-[0.55rem] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">94% Prob</span>
                     </div>
                     <p className="text-xs text-on-surface-variant leading-relaxed">
                       Based on past midterms, expect a 15-mark question on <strong className="text-white">Dijkstra's Algorithm</strong>. Review your PDF notes.
                     </p>
                   </div>
                 </li>
                 
                 <li className="flex gap-4 items-start bg-secondary/5 p-4 rounded-2xl border border-secondary/10 shadow-lg shadow-secondary/5 hover:-translate-y-1 transition-transform cursor-pointer">
                   <div className="bg-secondary/20 p-2 rounded-lg">
                     <span className="material-symbols-outlined text-secondary text-xl shrink-0">trending_up</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-secondary mb-1">Momentum Maintained</h4>
                     <p className="text-xs text-on-surface-variant leading-relaxed">
                       You have completed {tasks.filter(t => t.completed).length} focus tasks today. Keep up the high bandwidth!
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
