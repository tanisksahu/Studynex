import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { subjects, tasks, profile, activityData, toggleTask } = useAppContext();

  const containerLoader = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemLoader = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <main className="p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8">
        
        {/* Top Header Section */}
        <motion.div variants={itemLoader} className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
           <div>
             <h1 className="text-3xl font-black text-white tracking-widest font-headline uppercase mb-2">Welcome Back, {profile.firstName}</h1>
             <p className="text-[#c7c4d8] text-sm">You are on a <span className="text-primary font-bold"><span className="material-symbols-outlined text-[1rem] align-middle -mt-1 text-primary">local_fire_department</span> {profile.streak} Day Study Streak</span>. Keep the momentum.</p>
           </div>
           <div className="flex gap-4">
             <div className="bg-surface-container-high px-6 py-3 rounded-xl border border-outline-variant/10 shadow-lg">
               <p className="text-[0.65rem] text-on-surface-variant font-bold uppercase tracking-widest mb-1 flex items-center justify-between">XP Progression <span className="text-primary font-black ml-4">{profile.xp} XP</span></p>
               <div className="flex items-center gap-3">
                 <span className="text-xl font-black text-indigo-400 font-headline">Lvm {profile.level}</span>
                 <div className="w-32 bg-surface-container h-2 rounded-full overflow-hidden">
                   <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(profile.xp % 200) / 2}%` }}></div>
                 </div>
               </div>
             </div>
           </div>
        </motion.div>

        {/* CSS GRID Layout: 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
             {/* Trend Chart */}
             <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-xl group">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h2 className="font-headline font-bold text-lg uppercase tracking-widest flex items-center">
                    <span className="material-symbols-outlined mr-2 text-indigo-400">monitoring</span>
                    Weekly Consistency
                  </h2>
                  <span className="px-3 py-1 bg-surface-container-highest text-xs text-on-surface-variant font-bold uppercase rounded-lg">Last 7 Days</span>
                </div>
                <div className="h-56 w-full -ml-4 mt-8 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <XAxis dataKey="day" stroke="#464555" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0b1326', border: '1px solid #464555', borderRadius: '8px' }} itemStyle={{ color: '#c3c0ff' }} cursor={{ stroke: 'rgba(195,192,255,0.1)', strokeWidth: 40 }} />
                      <Line type="monotone" dataKey="hours" stroke="#c3c0ff" strokeWidth={4} dot={{ r: 4, fill: '#0b1326', stroke: '#c3c0ff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#c3c0ff' }} animationDuration={1500} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-1000"></div>
             </motion.div>

             {/* Detailed Subject Cards */}
             <motion.div variants={itemLoader} className="space-y-4">
                 <div className="flex justify-between items-end mb-2">
                    <h2 className="font-headline font-bold text-lg uppercase tracking-widest">Priority Subjects</h2>
                    <Link to="/exams" className="text-[0.65rem] text-primary hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors">View All</Link>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {subjects.slice(0, 2).map(sub => (
                     <div key={sub.id} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
                       <div className="flex justify-between items-start mb-4 relative z-10">
                         <div>
                           <h3 className="font-headline font-bold text-lg leading-tight mb-1">{sub.name}</h3>
                           <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest">{sub.units} Units Total</p>
                         </div>
                         <span className={`px-2 py-1 rounded text-[0.6rem] font-bold uppercase tracking-widest ${sub.weak ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'}`}>
                           {sub.weak ? 'At Risk' : 'Strong'}
                         </span>
                       </div>
                       <div className="space-y-4 relative z-10 mt-6">
                         <div>
                           <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">
                             <span>Mastery</span><span className={sub.weak ? 'text-error' : 'text-secondary'}>{sub.progress}%</span>
                           </div>
                           <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${sub.weak ? 'bg-error' : 'bg-secondary'}`} style={{ width: `${sub.progress}%` }}></div>
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
             </motion.div>
          </div>

          {/* Right Sidebar Area (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Today's Action Plan */}
            <motion.div variants={itemLoader} className="bg-gradient-to-b from-surface-container to-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-2xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6 relative z-10">
                 <h2 className="font-headline font-bold text-lg uppercase tracking-widest flex items-center">
                   <span className="material-symbols-outlined mr-2 text-primary">assignment_turned_in</span>
                   Today's Plan
                 </h2>
                 <Link to="/plan" className="text-[0.65rem] text-on-surface-variant hover:text-white font-bold uppercase tracking-widest transition-colors">Manage</Link>
              </div>
              <div className="space-y-3 relative z-10">
                {tasks.map(task => (
                  <div key={task.id} 
                       onClick={() => toggleTask(task.id)}
                       className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex gap-3 items-start ${task.completed ? 'bg-surface-container/30 border-outline-variant/5 shadow-none' : task.isLive ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5 hover:border-primary/50' : 'bg-surface-container-high border-outline-variant/30 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(195,192,255,0.1)]'}`}>
                    <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 mt-0.5 transition-colors ${task.completed ? 'bg-secondary border-secondary text-[#0b1326]' : 'border-outline-variant/60 text-transparent'}`}>
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold transition-all ${task.completed ? 'line-through text-on-surface-variant' : 'text-white'}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[0.65rem] text-on-surface-variant font-black uppercase tracking-widest">{task.time}</p>
                        {task.isLive && <span className="text-[0.55rem] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Live</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
            </motion.div>
            
            {/* Upcoming Deadlines Widget */}
            <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
              <h2 className="font-headline font-bold text-lg uppercase tracking-widest flex items-center mb-6">
                 <span className="material-symbols-outlined mr-2 text-error">event_upcoming</span>
                 Deadlines
              </h2>
              <ul className="space-y-4">
                 <li className="flex gap-4 items-center">
                   <div className="bg-error/10 text-error p-3 rounded-xl flex flex-col items-center justify-center min-w-[3.5rem] border border-error/20">
                     <span className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5">Nov</span>
                     <span className="text-xl font-black font-headline">24</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-white">Data Structures Midterm</h4>
                     <p className="text-[0.65rem] text-on-surface-variant font-bold uppercase tracking-widest mt-1">In 2 Days • 8 Units assigned</p>
                   </div>
                 </li>
                 <li className="flex gap-4 items-center opacity-70">
                   <div className="bg-tertiary/10 text-tertiary p-3 rounded-xl flex flex-col items-center justify-center min-w-[3.5rem] border border-tertiary/20">
                     <span className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5">Dec</span>
                     <span className="text-xl font-black font-headline">02</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-white">Systems Architecture Final</h4>
                     <p className="text-[0.65rem] text-on-surface-variant font-bold uppercase tracking-widest mt-1">In 10 Days • 6 Units assigned</p>
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

export default Dashboard;
