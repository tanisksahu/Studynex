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
    toast.success('Task Added to Queue!');
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
        toast.success("Task Complete! +100 XP", { icon: "🔥" });
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

  const activeTasks = tasks.filter(t => !t.completed).length;

  return (
    <main className="p-4 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div variants={itemLoader} className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-outline-variant pb-6">
           <div>
             <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface mb-1 flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                 <span className="material-symbols-outlined text-[24px]">calendar_month</span>
               </div>
               Mission Planner
             </h1>
             <p className="text-on-surface-variant font-medium text-sm lg:text-base pl-14">Queue up focused study nodes. Timeblock for maximum retention.</p>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <motion.div variants={itemLoader} className="lg:col-span-4">
             <div className="sn-card p-6 lg:p-8 border-t-4 border-t-secondary shadow-elevated sticky top-8">
               <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[20px] text-primary">add_task</span>
                 Initialize Task
               </h3>
               <form onSubmit={handleAddTask} className="space-y-6">
                 <div>
                   <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Objective</label>
                   <input 
                     type="text" 
                     value={newTask} 
                     onChange={(e) => setNewTask(e.target.value)} 
                     placeholder="e.g. Read Chapter 4" 
                     className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-soft"
                   />
                 </div>
                 <div>
                   <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Timeblock (Optional)</label>
                   <input 
                     type="time" 
                     value={newTime} 
                     onChange={(e) => setNewTime(e.target.value)}
                     className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-soft"
                   />
                 </div>
                 <div className="pt-2">
                   <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-wide text-sm px-6 py-3.5 flex items-center justify-center gap-1.5 rounded-lg transition-all shadow-soft mt-2">
                     <span className="material-symbols-outlined text-[20px]">add</span> Attach Node
                   </button>
                 </div>
               </form>
             </div>
          </motion.div>

          {/* Task Feed Area */}
          <motion.div variants={itemLoader} className="lg:col-span-8">
             <div className="sn-card p-6 lg:p-8 min-h-full">
               <div className="flex justify-between items-center mb-8 border-b border-outline-variant pb-4">
                 <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                   <span className="material-symbols-outlined text-[20px] text-primary">view_timeline</span>
                   Active Queue
                 </h3>
                 <span className="px-3 py-1.5 bg-surface-variant border border-outline-variant text-xs font-bold rounded-lg text-on-surface-variant uppercase tracking-wider">
                   {activeTasks} Remaining
                 </span>
               </div>
               
               <div className="space-y-4 relative">
                 <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-outline-variant/60 z-0 hidden sm:block"></div>
                 
                 <AnimatePresence>
                   {tasks.map((task, idx) => (
                     <motion.div 
                       key={task.id}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="relative z-10 sm:pl-16 group"
                     >
                       <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-outline-variant rounded-full hidden sm:block group-hover:border-primary transition-colors"></div>
                       
                       <div 
                         onClick={() => toggleTask(task.id)}
                         className={`p-4 sm:p-5 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${task.completed ? 'bg-surface-variant/30 border-outline-variant/50 shadow-none opacity-60' : 'bg-white border-outline-variant shadow-sm hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5'}`}
                       >
                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${task.completed ? 'bg-primary border-primary text-white' : 'border-outline-variant text-transparent group-hover:border-primary/50'}`}>
                           <span className="material-symbols-outlined text-sm font-bold">check</span>
                         </div>
                         <div className="flex-1 min-w-0 pt-0.5">
                           <h4 className={`text-sm sm:text-base font-bold truncate transition-colors ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface group-hover:text-primary'}`}>{task.title}</h4>
                           <div className="flex items-center gap-3 mt-1.5">
                             <p className="text-[10px] sm:text-[11px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
                               <span className="material-symbols-outlined text-[14px]">schedule</span>
                               {task.time}
                             </p>
                             {task.priority && <span className="bg-error/10 border border-error/20 text-error px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider">Priority</span>}
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                   {tasks.length === 0 && (
                     <div className="text-center py-20 text-on-surface-variant relative z-10 bg-surface-variant/30 border-2 border-dashed border-outline-variant rounded-2xl mx-auto max-w-sm mt-4">
                       <span className="material-symbols-outlined text-[48px] mb-4 opacity-40">fact_check</span>
                       <p className="font-bold text-sm uppercase tracking-wider text-on-surface">Queue is clear</p>
                       <p className="text-xs font-medium mt-1">Add tasks to build your mission plan</p>
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
