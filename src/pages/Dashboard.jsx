import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEFAULT_WIDGETS = [
  { id: 'hero', visible: true, order: 0, title: 'Hero Banner' },
  { id: 'summary', visible: true, order: 1, title: 'Overview Stats' },
  { id: 'progress', visible: true, order: 2, title: 'Study Progress' },
  { id: 'consistency', visible: true, order: 3, title: 'Consistency Chart' },
  { id: 'plan', visible: true, order: 4, title: 'Today\'s Plan' },
  { id: 'upcoming_exams', visible: true, order: 5, title: 'Upcoming Exams' },
  { id: 'deadlines', visible: true, order: 6, title: 'Deadlines' },
  { id: 'quick_actions', visible: true, order: 7, title: 'Quick Actions' },
];

const Dashboard = () => {
  const { subjects, tasks, profile, activityData, toggleTask, settings, updateSettings, exams, setIsFocusModeOpen } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localWidgets, setLocalWidgets] = useState([]);
  const [draggedItemId, setDraggedItemId] = useState(null);

  useEffect(() => {
    if (settings.dashboard?.widgets && settings.dashboard.widgets.length > 0) {
      const merged = DEFAULT_WIDGETS.map(dw => {
        const existing = settings.dashboard.widgets.find(sw => sw.id === dw.id);
        return existing ? { ...dw, ...existing } : dw;
      });
      setLocalWidgets(merged.sort((a, b) => a.order - b.order));
    } else {
      setLocalWidgets(DEFAULT_WIDGETS);
    }
  }, [settings.dashboard?.widgets]);

  const saveLayout = (widgetsToSave = localWidgets) => {
    updateSettings('dashboard', 'widgets', widgetsToSave);
    setIsEditing(false);
    toast.success('Dashboard layout saved');
  };

  const resetLayout = () => {
    setLocalWidgets(DEFAULT_WIDGETS);
    updateSettings('dashboard', 'widgets', DEFAULT_WIDGETS);
    toast.success('Dashboard layout reset');
  };

  const toggleWidgetVisibility = (id) => {
    setLocalWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const moveWidget = (id, direction) => {
    const idx = localWidgets.findIndex(w => w.id === id);
    if (direction === 'up' && idx > 0) {
      const newArr = [...localWidgets];
      [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
      newArr.forEach((w, i) => w.order = i);
      setLocalWidgets(newArr);
    } else if (direction === 'down' && idx < localWidgets.length - 1) {
      const newArr = [...localWidgets];
      [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
      newArr.forEach((w, i) => w.order = i);
      setLocalWidgets(newArr);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to generate before setting opacity
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItemId(null);
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;
    
    const sourceIdx = localWidgets.findIndex(w => w.id === draggedItemId);
    const targetIdx = localWidgets.findIndex(w => w.id === targetId);
    
    const newArr = [...localWidgets];
    const [moved] = newArr.splice(sourceIdx, 1);
    newArr.splice(targetIdx, 0, moved);
    newArr.forEach((w, i) => w.order = i);
    
    setLocalWidgets(newArr);
  };

  const containerLoader = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemLoader = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const renderWidgetContent = (widgetId) => {
    switch(widgetId) {
      case 'hero':
        const nextHeroExam = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date))[0];
        const daysToHeroExam = nextHeroExam ? Math.max(0, Math.floor((new Date(nextHeroExam.date) - new Date()) / (1000 * 60 * 60 * 24))) : null;
        
        // Priority Engine logic
        const highestPriority = subjects && subjects.length > 0 
          ? [...subjects].sort((a,b) => (b.priorityScore || 0) - (a.priorityScore || 0))[0] 
          : null;

        return (
          <div className="sn-card bg-surface overflow-hidden flex flex-col md:flex-row relative group h-full min-h-[220px]">
             {/* Left Text Side */}
             <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center relative z-10">
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> StudyNex Brief
               </span>
               <h2 className="text-2xl lg:text-3xl font-bold text-on-surface mb-3 tracking-tight">
                 {highestPriority ? `Focus on ${highestPriority.name}` : "Ready to Learn"}
               </h2>
               <p className="text-on-surface-variant text-sm mb-8 max-w-sm leading-relaxed font-medium">
                 {highestPriority 
                   ? `This subject requires your attention. It's marked as ${highestPriority.priorityLabel} priority because you are at ${highestPriority.progress}% completion with an upcoming exam.`
                   : `You have no high priority tasks right now. Great time to focus on your personal projects or read ahead!`
                 }
               </p>
               <div className="flex flex-wrap gap-3">
                 <button onClick={() => setIsFocusModeOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">play_circle</span> What should I study now?
                 </button>
                 <Link to="/command" className="bg-white hover:bg-surface-variant border border-outline-variant text-on-surface px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center gap-2 group-hover:border-outline">
                   <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Command Center
                 </Link>
               </div>
             </div>
             
             {/* Right Visual Side */}
             <div className="hidden md:flex w-[40%] bg-surface-variant/30 relative items-center justify-center border-l border-outline-variant/50">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
               <div className="relative z-10 w-48 h-48 rounded-full border-[6px] border-white shadow-elevated flex items-center justify-center bg-surface">
                  <div className="text-center">
                     <span className="block text-4xl font-bold text-primary">68%</span>
                     <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Readiness</span>
                  </div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90 text-primary" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="289" strokeDashoffset="92" className="opacity-100" />
                  </svg>
               </div>
             </div>
          </div>
        );
      case 'summary':
        const nextSummaryExam = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date))[0];
        const daysToSummaryExam = nextSummaryExam ? Math.max(0, Math.floor((new Date(nextSummaryExam.date) - new Date()) / (1000 * 60 * 60 * 24))) : 0;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="sn-card p-5">
               <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1 block">Today</span>
               <div className="flex items-end gap-2">
                 <span className="text-2xl font-bold text-on-surface leading-none">{tasks.filter(t => !t.completed).length}</span>
                 <span className="text-sm font-medium text-on-surface-variant pb-0.5">tasks due</span>
               </div>
             </div>
             <div className="sn-card p-5">
               <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1 block">Upcoming</span>
               <div className="flex items-end gap-2">
                 <span className="text-2xl font-bold text-on-surface leading-none">{exams?.length || 0}</span>
                 <span className="text-sm font-medium text-on-surface-variant pb-0.5">
                   {nextSummaryExam ? `exam in ${daysToSummaryExam} days` : 'exams'}
                 </span>
               </div>
             </div>
             <div className="sn-card p-5">
               <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1 block">Inbox</span>
               <div className="flex items-end gap-2">
                 <span className="text-2xl font-bold text-on-surface leading-none">{subjects.length}</span>
                 <span className="text-sm font-medium text-on-surface-variant pb-0.5">active subjects</span>
               </div>
             </div>
          </div>
        );
      case 'progress':
        return (
          <div className="sn-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-base text-on-surface">Study progress</h2>
              <Link to="/exams" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-5">
              {subjects.slice(0, 3).map(sub => (
                <div key={sub.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm text-on-surface truncate pr-4">{sub.name}</h3>
                    <span className="text-xs font-bold text-on-surface-variant">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${sub.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'consistency':
        return (
          <div className="sn-card p-6">
            <h2 className="font-semibold text-base text-on-surface mb-4">Weekly focus</h2>
            <div className="h-40 w-full -ml-4 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <XAxis dataKey="day" stroke="#A3A3A0" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E5E0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }} 
                    itemStyle={{ color: '#176B4D', fontWeight: 600, fontSize: '13px' }} 
                    cursor={{ fill: '#F5F5F0' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#176B4D" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#ffffff', stroke: '#176B4D', strokeWidth: 2 }} 
                    activeDot={{ r: 5, fill: '#176B4D', stroke: '#ffffff', strokeWidth: 2 }} 
                    animationDuration={1000} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'plan':
        return (
          <div className="sn-card p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-semibold text-base text-on-surface">Today's plan</h2>
               <Link to="/plan" className="text-xs font-semibold text-primary hover:underline">Full planner</Link>
            </div>
            <div className="space-y-5">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} 
                     onClick={() => toggleTask(task.id)}
                     className={`group flex items-start gap-4 cursor-pointer transition-opacity ${task.completed ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="mt-0.5 text-[11px] font-semibold text-on-surface-variant w-12 shrink-0">
                     {task.time.split(' - ')[0]}
                  </div>
                  <div className="flex-1 border-l-2 border-outline-variant pl-4 group-hover:border-primary transition-colors">
                     <p className={`text-sm font-medium ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{task.title}</p>
                     <p className="text-xs text-on-surface-variant mt-1">{task.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-on-surface-variant">
                  <p className="text-sm">Your schedule is clear.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'upcoming_exams':
        const nextExams = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 2);
        return (
          <div className="sn-card p-6 border border-outline-variant/60 bg-white">
            <div className="flex justify-between items-center mb-5">
               <h2 className="font-semibold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">notifications_active</span> Upcoming Exams
               </h2>
               <Link to="/exams" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </div>
            {nextExams.length > 0 ? (
               <div className="space-y-4">
                  {nextExams.map(exam => (
                     <div key={exam.id} className="flex flex-col gap-2 p-3 bg-surface-variant/30 rounded-xl border border-outline-variant/50">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="font-bold text-sm text-on-surface">{exam.subjectName}</h3>
                              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{exam.date} · {exam.startTime}</p>
                           </div>
                           <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full border border-error/20">
                              {Math.max(0, Math.floor((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)))} days left
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="text-center py-6 text-on-surface-variant opacity-70">
                  <span className="material-symbols-outlined text-[32px] mb-2">event_available</span>
                  <p className="text-xs font-semibold">No exams coming up</p>
               </div>
            )}
          </div>
        );
      case 'deadlines':
        const deadlinesExams = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
        
        return (
          <div className="sn-card p-6">
            <h2 className="font-semibold text-base text-on-surface mb-6">Upcoming deadlines</h2>
            {deadlinesExams.length > 0 ? (
              <ul className="space-y-5">
                {deadlinesExams.map(exam => {
                  const examDate = new Date(exam.date);
                  const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));
                  const isUrgent = daysLeft <= 3;
                  
                  return (
                    <li key={exam.id} className="flex gap-4 items-start">
                      <div className={`text-xs font-bold w-12 shrink-0 text-right pr-2 border-r-2 ${isUrgent ? 'border-error text-error' : 'border-warning text-warning'}`}>
                        {examDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <h4 className="font-semibold text-sm text-on-surface truncate">{exam.subjectName}</h4>
                        <p className={`text-xs font-medium mt-1 ${isUrgent ? 'text-error' : 'text-warning'}`}>
                          {daysLeft === 0 ? 'Today' : `In ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center py-6 text-on-surface-variant">
                <p className="text-sm">No upcoming deadlines.</p>
              </div>
            )}
          </div>
        );
      case 'quick_actions':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <Link to="/command" className="sn-card-interactive p-4 flex flex-col items-center justify-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[24px]">terminal</span>
                <span className="text-xs font-semibold">Command Center</span>
             </Link>
             <button className="sn-card-interactive p-4 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[24px]">add_task</span>
                <span className="text-xs font-semibold">Add Task</span>
             </button>
             <button className="sn-card-interactive p-4 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[24px]">note_add</span>
                <span className="text-xs font-semibold">Add Material</span>
             </button>
             <button className="sn-card-interactive p-4 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[24px]">book</span>
                <span className="text-xs font-semibold">New Subject</span>
             </button>
          </div>
        );
      default: return null;
    }
  };

  const visibleWidgets = localWidgets.filter(w => w.visible);

  return (
    <main className="p-4 lg:p-10 text-on-surface">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6">
           <div>
             <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-on-surface mb-2">
               Good morning, {profile.firstName}.
             </h1>
             <p className="text-on-surface-variant font-medium text-sm lg:text-base flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">calendar_today</span>
               {currentDate}
               <span className="mx-2 opacity-30">•</span>
               <span className="text-primary font-bold">You're on track for today's plan.</span>
             </p>
           </div>
           
           <div className="flex items-center gap-3">
             {!isEditing ? (
               <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface bg-surface-variant px-4 py-2 rounded-lg transition-colors">
                 <span className="material-symbols-outlined text-[18px]">tune</span>
                 Customize layout
               </button>
             ) : (
               <div className="flex items-center gap-2">
                 <button onClick={resetLayout} className="text-sm font-semibold text-on-surface-variant hover:text-error px-3 py-2 transition-colors">
                   Reset
                 </button>
                 <button onClick={() => setIsEditing(false)} className="text-sm font-semibold text-on-surface-variant hover:text-on-surface px-3 py-2 transition-colors">
                   Cancel
                 </button>
                 <button onClick={saveLayout} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-soft">
                   Save Layout
                 </button>
               </div>
             )}
           </div>
        </div>

        {/* Editing Mode Panel */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="sn-card p-5 mb-8 bg-surface-variant border-primary/20">
                <h3 className="font-semibold text-sm text-on-surface mb-3">Drag to reorder or toggle visibility</h3>
                <div className="flex flex-wrap gap-2">
                  {localWidgets.map(widget => (
                    <div key={widget.id} className="flex items-center bg-white border border-outline-variant rounded-lg overflow-hidden shadow-soft">
                       <button onClick={() => toggleWidgetVisibility(widget.id)} className={`px-3 py-2 border-r border-outline-variant flex items-center justify-center transition-colors ${widget.visible ? 'text-primary bg-primary/5 hover:bg-primary/10' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                         <span className="material-symbols-outlined text-[18px]">{widget.visible ? 'visibility' : 'visibility_off'}</span>
                       </button>
                       <span className={`px-3 py-2 text-xs font-semibold ${widget.visible ? 'text-on-surface' : 'text-on-surface-variant'}`}>{widget.title}</span>
                       <div className="flex border-l border-outline-variant">
                         <button onClick={() => moveWidget(widget.id, 'up')} className="px-1.5 py-2 hover:bg-surface-variant text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_upward</span></button>
                         <button onClick={() => moveWidget(widget.id, 'down')} className="px-1.5 py-2 hover:bg-surface-variant text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_downward</span></button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Widget Grid */}
        <motion.div variants={containerLoader} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
          {visibleWidgets.map(widget => (
            <motion.div 
              key={widget.id}
              variants={itemLoader}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              className={`
                transition-all duration-300
                ${isEditing ? 'cursor-move ring-2 ring-transparent hover:ring-outline-variant' : ''}
                ${(widget.id === 'hero' || widget.id === 'summary' || widget.id === 'quick_actions') ? 'col-span-1 md:col-span-12' : ''}
                ${(widget.id === 'progress' || widget.id === 'consistency') ? 'col-span-1 md:col-span-7 lg:col-span-8' : ''}
                ${(widget.id === 'plan' || widget.id === 'deadlines' || widget.id === 'upcoming_exams') ? 'col-span-1 md:col-span-5 lg:col-span-4' : ''}
              `}
            >
              {renderWidgetContent(widget.id)}
            </motion.div>
          ))}
        </motion.div>

      </div>
    </main>
  );
};

export default Dashboard;
