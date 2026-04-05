import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Planner = () => {
  const { tasks, setTasks, addXp } = useAppContext();
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask) return;
    const newTaskObj = {
      id: Date.now(),
      title: newTask,
      time: newTime || 'Pending',
      completed: false,
      isLive: false,
      priority: false
    };
    setTasks([...tasks, newTaskObj]);
    setNewTask('');
    setNewTime('');
    toast.success('Task Added to Queue!', { style: { background: '#222', color: '#fff' }});
  };

  const toggleTask = (id) => {
    setTasks(prev => {
      let newlyCompleted = false;
      const updated = prev.map(t => {
        if (t.id === id) {
          if (!t.completed) newlyCompleted = true;
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      if (newlyCompleted) {
        toast.success("Task Complete! +100 XP", { icon: "🔥", style: { background: '#333', color: '#fff' }});
        addXp(100);
      }
      return updated;
    });
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
               <span className="material-symbols-outlined mr-4 text-secondary text-4xl">calendar_month</span>
               Mission Planner
             </h2>
             <p className="text-on-surface-variant text-sm font-medium pl-14">Queue up focused study nodes. Timeblock for maximum retention.</p>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <motion.div variants={itemLoader} className="lg:col-span-4">
             <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-xl sticky top-8">
               <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6 border-b border-outline-variant/10 pb-4">Initialize Task</h3>
               <form onSubmit={handleAddTask} className="space-y-4">
                 <div>
                   <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Objective</label>
                   <input 
                     type="text" 
                     value={newTask} 
                     onChange={(e) => setNewTask(e.target.value)} 
                     placeholder="e.g. Read Chapter 4" 
                     className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-secondary text-sm px-4 py-3 rounded-xl transition-all outline-none"
                   />
                 </div>
                 <div>
                   <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Timeblock (Optional)</label>
                   <input 
                     type="time" 
                     value={newTime} 
                     onChange={(e) => setNewTime(e.target.value)}
                     className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-secondary text-sm px-4 py-3 rounded-xl transition-all outline-none text-white color-scheme-dark"
                   />
                 </div>
                 <button type="submit" className="w-full bg-secondary hover:bg-[#3ec48e] text-[#0b1326] font-black uppercase tracking-widest text-[0.75rem] px-6 py-4 flex items-center justify-center rounded-xl transition-all shadow-[0_0_15px_rgba(78,222,163,0.3)] hover:shadow-[0_0_25px_rgba(78,222,163,0.5)] active:scale-95">
                   <span className="material-symbols-outlined mr-2">add</span> Attach Node
                 </button>
               </form>
               <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none"></div>
             </div>
          </motion.div>

          {/* Task Feed Area */}
          <motion.div variants={itemLoader} className="lg:col-span-8">
             <div className="bg-surface-container-high p-8 rounded-3xl border border-outline-variant/10 shadow-lg min-h-full">
               <div className="flex justify-between items-center mb-6 border-b border-outline-variant/10 pb-4">
                 <h3 className="font-headline text-lg font-bold uppercase tracking-widest">Active Queue</h3>
                 <span className="px-3 py-1 bg-surface-container-highest text-xs font-bold uppercase rounded-lg text-on-surface-variant">
                   {tasks.filter(t => !t.completed).length} Remaining
                 </span>
               </div>
               
               <div className="space-y-4 relative">
                 <div className="absolute left-[24px] top-4 bottom-4 w-[2px] bg-outline-variant/10 z-0"></div>
                 
                 <AnimatePresence>
                   {tasks.map(task => (
                     <motion.div 
                       key={task.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="relative z-10 pl-16 group"
                     >
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0b1326] border-2 border-outline-variant/30 rounded-full"></div>
                       
                       <div 
                         onClick={() => toggleTask(task.id)}
                         className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${task.completed ? 'bg-surface-container/50 border-outline-variant/5 shadow-none opacity-60' : 'bg-surface-container border-outline-variant/20 shadow-md hover:border-secondary/50 hover:-translate-y-0.5'}`}
                       >
                         <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${task.completed ? 'bg-secondary border-secondary text-[#0b1326]' : 'border-outline-variant/50 text-transparent group-hover:border-secondary/50'}`}>
                           <span className="material-symbols-outlined text-sm font-black">check</span>
                         </div>
                         <div className="flex-1">
                           <h4 className={`text-base font-bold ${task.completed ? 'line-through text-on-surface-variant' : 'text-white'}`}>{task.title}</h4>
                           <div className="flex items-center gap-2 mt-1">
                             <p className="text-[0.65rem] text-on-surface-variant font-bold uppercase tracking-widest">{task.time}</p>
                             {task.priority && <span className="bg-error/10 border border-error/20 text-error px-2 py-0.5 text-[0.5rem] rounded font-black uppercase">Priority</span>}
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                   {tasks.length === 0 && (
                     <div className="text-center py-20 text-on-surface-variant opacity-70 relative z-10 bg-surface-container-high">
                       <span className="material-symbols-outlined text-5xl mb-3">fact_check</span>
                       <p className="font-bold text-sm uppercase tracking-widest">Queue is clear</p>
                     </div>
                   )}
                 </AnimatePresence>
               </div>
             </div>
          </motion.div>

        </div>
      </motion.div>
    </main>
  );
};

export default Planner;
