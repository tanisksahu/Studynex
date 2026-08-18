import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEFAULT_WIDGETS = [
  { id: 'hero', visible: true, order: 0, title: 'Hero Banner', region: 'main' },
  { id: 'ai_brief', visible: true, order: 1, title: 'Daily AI Study Brief', region: 'main' },
  { id: 'metrics', visible: true, order: 2, title: 'Quick Metrics', region: 'main' },
  { id: 'progress', visible: true, order: 3, title: 'Study Progress', region: 'main' },
  { id: 'plan', visible: true, order: 4, title: 'Today\'s Plan', region: 'main' },
  { id: 'upcoming_exams', visible: true, order: 5, title: 'Upcoming Exams', region: 'main' },
  { id: 'streak', visible: true, order: 6, title: 'Study Streak', region: 'right' },
  { id: 'weekly_focus', visible: true, order: 7, title: 'Weekly Focus', region: 'right' },
  { id: 'deadlines', visible: true, order: 8, title: 'Upcoming Deadlines', region: 'right' },
  { id: 'tip', visible: true, order: 9, title: 'StudyNex Tip', region: 'right' },
  { id: 'quick_actions', visible: true, order: 10, title: 'Quick Actions', region: 'main' },
];

const Dashboard = () => {
  const { subjects, tasks, profile, activityData, toggleTask, settings, updateSettings, exams, setIsFocusModeOpen } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localWidgets, setLocalWidgets] = useState([]);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const navigate = useNavigate();

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

  // Calculate Data
  const nextExam = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date))[0];
  const daysToExam = nextExam ? Math.max(0, Math.floor((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const highestPriority = subjects && subjects.length > 0 
    ? [...subjects].sort((a,b) => (b.priorityScore || 0) - (a.priorityScore || 0))[0] 
    : null;

  // Weakest subject calculation
  const weakestSubject = subjects && subjects.length > 0
    ? [...subjects].sort((a,b) => (a.progress || 0) - (b.progress || 0))[0]
    : null;
    
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  // Donut chart calculations
  const totalHours = activityData.reduce((acc, val) => acc + val.hours, 0);
  const studyHours = totalHours * 0.6;
  const assignmentsHours = totalHours * 0.25;
  const breakHours = totalHours * 0.15;
  const donutData = [
    { name: 'Study', value: studyHours, color: '#176B4D' },
    { name: 'Assignments', value: assignmentsHours, color: '#83f0c3' },
    { name: 'Breaks', value: breakHours, color: '#D1D1CD' }
  ];

  const formatHours = (hours) => {
     const h = Math.floor(hours);
     const m = Math.round((hours - h) * 60);
     if (h === 0) return `${m}m`;
     if (m === 0) return `${h}h`;
     return `${h}h ${m}m`;
  };

  const renderWidgetContent = (widgetId) => {
    switch(widgetId) {
      case 'hero':
        return (
          <div className="bg-[#fcfcfc] border border-outline-variant/60 rounded-xl overflow-hidden flex flex-col md:flex-row relative group min-h-[220px]">
             <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center relative z-10">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight">
                    Continue your focus
                  </h2>
               </div>
               
               <p className="text-on-surface-variant text-sm mb-1 max-w-sm font-medium">
                 Your next recommended session is <span className="font-semibold text-on-surface">{highestPriority?.name || 'Review'}</span>.
               </p>
               {nextExam && (
                 <p className="text-on-surface-variant text-sm mb-6 max-w-sm font-medium">
                   You have an upcoming exam approaching in {daysToExam} days.
                 </p>
               )}
               
               <div className="flex flex-wrap gap-3 mt-2">
                 <button onClick={() => setIsFocusModeOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all shadow-sm">
                   Start session
                 </button>
                 <Link to="/plan" className="bg-white hover:bg-surface-variant border border-outline-variant text-on-surface px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all">
                   View session plan
                 </Link>
               </div>
             </div>
             
             <div className="hidden md:flex w-[40%] relative items-center justify-center">
                <img src="https://illustrations.popsy.co/emerald/student-going-to-school.svg" alt="Study Workspace" className="w-64 h-64 object-contain opacity-90 drop-shadow-sm" />
             </div>
          </div>
        );
        
      case 'ai_brief':
        return (
          <div className="bg-gradient-to-r from-primary/10 to-primary-container/20 border border-primary/20 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <span className="material-symbols-outlined text-8xl text-primary">auto_awesome</span>
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[20px]">magic_button</span>
                <h3 className="font-bold text-primary text-[15px] uppercase tracking-wider">Daily AI Study Brief</h3>
              </div>
              
              <div className="text-[14px] text-on-surface font-medium leading-relaxed max-w-2xl">
                <p>
                  You have <strong>{pendingTasksCount} tasks</strong> due today{nextExam ? ` and a ${nextExam.subjectName} exam approaching` : ''}. 
                  {weakestSubject && ` Your weakest area currently is ${weakestSubject.name}.`}
                </p>
                <div className="mt-4 bg-white/60 p-4 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm">
                   <h4 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Recommended Plan</h4>
                   <ul className="space-y-2">
                     {highestPriority && (
                       <li className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                         <span className="text-[13px]"><span className="font-bold text-primary">Focus:</span> {highestPriority.name} revision</span>
                       </li>
                     )}
                     {pendingTasksCount > 0 && (
                       <li className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                         <span className="text-[13px]"><span className="font-bold text-primary">Execute:</span> Complete pending tasks</span>
                       </li>
                     )}
                     {weakestSubject && (
                       <li className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                         <span className="text-[13px]"><span className="font-bold text-[#D97706]">Review:</span> {weakestSubject.name} concepts</span>
                       </li>
                     )}
                   </ul>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 shrink-0 self-stretch flex items-center">
               <button onClick={() => navigate('/command')} className="bg-primary text-white hover:bg-primary/90 transition-colors px-6 py-3 rounded-xl font-bold text-[13px] shadow-sm flex items-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">terminal</span>
                 Open Agent
               </button>
            </div>
          </div>
        );
      
      case 'metrics':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
             <div className="bg-white border border-outline-variant/60 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center mb-3">
                   <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-2xl font-bold text-on-surface leading-none mb-1">{pendingTasksCount}</span>
                   <span className="text-[13px] font-semibold text-on-surface mb-0.5">Tasks due</span>
                   <span className="text-[11px] text-on-surface-variant">Today</span>
                </div>
             </div>
             
             <div className="bg-white border border-outline-variant/60 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center mb-3">
                   <span className="material-symbols-outlined text-[#D97706] text-[20px]">event</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-2xl font-bold text-on-surface leading-none mb-1">{exams?.length || 0}</span>
                   <span className="text-[13px] font-semibold text-on-surface mb-0.5">Upcoming exam</span>
                   <span className="text-[11px] text-on-surface-variant">{nextExam ? `In ${daysToExam} days` : 'None'}</span>
                </div>
             </div>

             <div className="bg-white border border-outline-variant/60 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center mb-3">
                   <span className="material-symbols-outlined text-[#4F46E5] text-[20px]">description</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-2xl font-bold text-on-surface leading-none mb-1">{subjects.length}</span>
                   <span className="text-[13px] font-semibold text-on-surface mb-0.5">Materials to review</span>
                   <span className="text-[11px] text-on-surface-variant">This week</span>
                </div>
             </div>

             <div className="bg-white border border-outline-variant/60 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center mb-3">
                   <span className="material-symbols-outlined text-primary text-[20px]">local_fire_department</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-2xl font-bold text-on-surface leading-none mb-1">{profile.streak || 1}</span>
                   <span className="text-[13px] font-semibold text-on-surface mb-0.5">Day streak</span>
                   <span className="text-[11px] text-on-surface-variant">Keep it up!</span>
                </div>
             </div>
          </div>
        );

      case 'progress':
        return (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-[15px] text-on-surface">Study progress</h2>
              <Link to="/subjects" className="text-xs font-semibold text-primary hover:underline flex items-center">
                 View all subjects <span className="material-symbols-outlined text-[14px] ml-0.5">chevron_right</span>
              </Link>
            </div>
            <div className="space-y-6 mt-2 flex-1">
              {subjects.slice(0, 4).map(sub => (
                <div key={sub.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-[13px] text-on-surface truncate pr-4">{sub.name}</h3>
                    <span className="text-[13px] font-bold text-on-surface-variant">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000 rounded-full" style={{ width: `${sub.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'plan':
        return (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-bold text-[15px] text-on-surface">Today's plan</h2>
               <Link to="/plan" className="text-xs font-semibold text-primary hover:underline">View planner</Link>
            </div>
            <div className="relative pl-3 mt-2 space-y-6 flex-1">
              <div className="absolute left-[17px] top-2 bottom-2 w-px bg-outline-variant z-0"></div>
              
              {tasks.length > 0 ? tasks.map((task, idx) => (
                <div key={task.id} 
                     onClick={() => toggleTask(task.id)}
                     className={`group relative flex items-start gap-4 cursor-pointer transition-opacity z-10`}>
                  
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 z-10 mt-[-2px]">
                     {task.completed ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                           <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                        </div>
                     ) : idx === 0 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-white"></div>
                     ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-outline-variant bg-white"></div>
                     )}
                  </div>

                  <div className="flex-1 mt-[-2px]">
                     <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className={`text-[13px] font-semibold ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{task.title}</p>
                        {task.priority && !task.completed && (
                           <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded">High Priority</span>
                        )}
                     </div>
                     <p className="text-[12px] font-medium text-on-surface-variant">{task.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-on-surface-variant">
                  <p className="text-sm">Your schedule is clear.</p>
                </div>
              )}
            </div>
            <button onClick={() => navigate('/plan')} className="mt-6 flex items-center gap-2 text-primary font-bold text-[13px] hover:underline">
               <span className="material-symbols-outlined text-[16px]">add</span> Add task
            </button>
          </div>
        );

      case 'upcoming_exams':
        const nextExamsMain = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 2);
        return (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
               <h2 className="font-bold text-[15px] text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span> Upcoming Exams
               </h2>
               <Link to="/exams" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </div>
            {nextExamsMain.length > 0 ? (
               <div className="space-y-4">
                  {nextExamsMain.map(exam => {
                     const examDate = new Date(exam.date);
                     const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));
                     return (
                     <div key={exam.id} className="flex flex-col gap-2 p-4 bg-surface rounded-xl border border-outline-variant">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="font-bold text-sm text-on-surface mb-0.5">{exam.subjectName}</h3>
                              <p className="text-[12px] font-medium text-on-surface-variant">{exam.date} · {exam.startTime}</p>
                           </div>
                           <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${daysLeft <= 3 ? 'text-error bg-error/10' : 'text-primary bg-primary-container'}`}>
                              {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                           </span>
                        </div>
                     </div>
                  )})}
               </div>
            ) : (
               <div className="text-center py-6 text-on-surface-variant opacity-70">
                  <span className="material-symbols-outlined text-[24px] mb-2">event_available</span>
                  <p className="text-[13px] font-semibold">No exams coming up</p>
               </div>
            )}
          </div>
        );

      case 'quick_actions':
        return (
          <div className="flex flex-wrap gap-4 pt-4 mt-2">
             <button onClick={() => navigate('/command')} className="flex items-center gap-2 text-[13px] font-bold text-on-surface hover:text-primary transition-colors bg-white border border-outline-variant rounded-xl px-5 py-3 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                Command Center
             </button>
             <button onClick={() => navigate('/plan')} className="flex items-center gap-2 text-[13px] font-bold text-on-surface hover:text-primary transition-colors bg-white border border-outline-variant rounded-xl px-5 py-3 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                Add Task
             </button>
             <button onClick={() => navigate('/inbox')} className="flex items-center gap-2 text-[13px] font-bold text-on-surface hover:text-primary transition-colors bg-white border border-outline-variant rounded-xl px-5 py-3 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">note_add</span>
                Add Material
             </button>
          </div>
        );

      case 'streak':
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        return (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm">
             <h2 className="font-bold text-[14px] text-on-surface mb-4 flex items-center gap-1.5">
                Study streak <span className="text-lg leading-none">🔥</span>
             </h2>
             <div className="mb-6">
                <div className="text-[32px] font-extrabold text-on-surface mb-0 leading-none">{profile.streak || 1} day{(profile.streak || 1) !== 1 ? 's' : ''}</div>
                <div className="text-[12px] font-semibold text-on-surface-variant mt-1.5">Best: 5 days</div>
             </div>
             
             <div className="flex justify-between items-end h-24 px-1">
                {days.map((d, i) => {
                   const isPast = i <= currentDayIdx;
                   const isToday = i === currentDayIdx;
                   const deterministicHeights = [30, 75, 45, 85, 50, 65, 40];
                   const height = isPast ? deterministicHeights[i % 7] : 10;
                   return (
                      <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                         <div className={`w-3.5 rounded-full transition-all ${isToday ? 'bg-primary' : isPast ? 'bg-outline-variant' : 'bg-surface-variant'}`} style={{ height: `${height}%` }}></div>
                         <span className={`text-[11px] font-bold ${isToday ? 'text-on-surface' : 'text-on-surface-variant'}`}>{d}</span>
                      </div>
                   )
                })}
             </div>
          </div>
        );

      case 'weekly_focus':
        return (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-[14px] text-on-surface mb-4">Weekly focus</h2>
            <div className="flex items-center justify-between gap-4 mt-4">
               <div className="w-[100px] h-[100px] shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="flex-1 space-y-3">
                  {donutData.map(item => (
                     <div key={item.name} className="flex justify-between items-center text-[12px]">
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                           <span className="font-medium text-on-surface-variant">{item.name}</span>
                        </div>
                        <span className="font-bold text-on-surface">{formatHours(item.value)}</span>
                     </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-outline-variant flex justify-between items-center text-[12px]">
                     <span className="font-bold text-on-surface pl-4">Total</span>
                     <span className="font-bold text-on-surface">{formatHours(totalHours)}</span>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'deadlines':
        const deadlinesExams = [...(exams || [])].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 2);
        
        return (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
               <h2 className="font-bold text-[14px] text-on-surface">Upcoming deadlines</h2>
               <Link to="/exams" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </div>
            {deadlinesExams.length > 0 ? (
              <ul className="space-y-5">
                {deadlinesExams.map(exam => {
                  const examDate = new Date(exam.date);
                  const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));
                  const isUrgent = daysLeft <= 3;
                  
                  return (
                    <li key={exam.id} className="flex gap-3.5 items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isUrgent ? 'bg-error/10 text-error' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                        <span className="material-symbols-outlined text-[18px]">event</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[13px] text-on-surface truncate">{exam.subjectName}</h4>
                        <p className="text-[12px] font-medium text-on-surface-variant truncate">
                           {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                         <div className={`text-[13px] font-bold ${isUrgent ? 'text-error' : 'text-[#D97706]'}`}>
                           {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                         </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center py-6 text-on-surface-variant">
                <p className="text-[13px]">No upcoming deadlines.</p>
              </div>
            )}
          </div>
        );

      case 'tip':
        return (
           <div className="bg-primary-container border border-primary/10 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <span className="material-symbols-outlined text-6xl text-primary">lightbulb</span>
              </div>
              <h2 className="font-bold text-[14px] text-primary mb-3 flex items-center gap-2 relative z-10">
                 <span className="material-symbols-outlined text-[18px]">emoji_objects</span>
                 StudyNex tip
               </h2>
              <p className="text-[13px] font-medium text-on-surface-variant leading-relaxed text-on-primary-container/90 relative z-10">
                 Break large topics into smaller goals. Your brain learns better in steps. Try the Pomodoro technique for focus.
              </p>
           </div>
        );

      default: return null;
    }
  };

  const visibleWidgets = localWidgets.filter(w => w.visible);
  
  const mainWidgets = visibleWidgets.filter(w => w.region === 'main' || !w.region).sort((a,b) => a.order - b.order);
  const rightWidgets = visibleWidgets.filter(w => w.region === 'right').sort((a,b) => a.order - b.order);

  return (
    <main className="p-6 lg:p-10 text-on-surface max-w-[1400px] mx-auto min-h-screen pb-16">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
         <div>
           <h1 className="text-3xl lg:text-[34px] font-extrabold tracking-tight text-on-surface mb-2">
             Good morning, {profile.firstName || 'Student'} 👋
           </h1>
           <p className="text-on-surface-variant font-medium text-sm lg:text-[15px]">
             {currentDate}
           </p>
         </div>
         
         <div className="flex items-center gap-3">
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[13px] font-bold text-on-surface hover:text-primary transition-colors bg-white border border-outline-variant rounded-lg px-4 py-2.5 shadow-sm">
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
               <button onClick={() => saveLayout()} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-soft">
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
            className="overflow-hidden mb-8"
          >
            <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[15px] text-on-surface mb-4">Drag to reorder or toggle visibility</h3>
              <div className="flex flex-wrap gap-3">
                {localWidgets.map(widget => (
                  <div key={widget.id} draggable={true} onDragStart={(e) => handleDragStart(e, widget.id)} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, widget.id)} className="flex items-center bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm cursor-move">
                     <button onClick={() => toggleWidgetVisibility(widget.id)} className={`px-4 py-2 border-r border-outline-variant flex items-center justify-center transition-colors ${widget.visible ? 'text-primary bg-primary/5 hover:bg-primary/10' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                       <span className="material-symbols-outlined text-[18px]">{widget.visible ? 'visibility' : 'visibility_off'}</span>
                     </button>
                     <span className={`px-4 py-2 text-[13px] font-semibold ${widget.visible ? 'text-on-surface' : 'text-on-surface-variant'}`}>{widget.title}</span>
                     <div className="flex border-l border-outline-variant">
                       <button onClick={() => moveWidget(widget.id, 'up')} className="px-2 py-2 hover:bg-surface-variant text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_upward</span></button>
                       <button onClick={() => moveWidget(widget.id, 'down')} className="px-2 py-2 hover:bg-surface-variant text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_downward</span></button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2-Column Layout */}
      <div className="flex flex-col xl:flex-row gap-8 lg:gap-10">
         
         {/* Main Content Area */}
         <div className="flex-1 min-w-0">
            <motion.div variants={containerLoader} initial="hidden" animate="show" className="flex flex-col space-y-6 lg:space-y-8">
               
               {/* Hero */}
               {mainWidgets.find(w => w.id === 'hero') && renderWidgetContent('hero')}
               
               {/* AI Brief */}
               {mainWidgets.find(w => w.id === 'ai_brief') && renderWidgetContent('ai_brief')}

               {/* Metrics */}
               {mainWidgets.find(w => w.id === 'metrics') && renderWidgetContent('metrics')}
               
               {/* Middle Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-2">
                  {mainWidgets.find(w => w.id === 'progress') && renderWidgetContent('progress')}
                  {mainWidgets.find(w => w.id === 'plan') && renderWidgetContent('plan')}
               </div>

               {/* Bottom Full Width or Additional Row */}
               {mainWidgets.find(w => w.id === 'upcoming_exams') && (
                  <div className="mt-2">
                     {renderWidgetContent('upcoming_exams')}
                  </div>
               )}
               
               {/* Quick Actions */}
               {mainWidgets.find(w => w.id === 'quick_actions') && renderWidgetContent('quick_actions')}

            </motion.div>
         </div>

         {/* Right Sidebar Column */}
         <div className="w-full xl:w-[320px] 2xl:w-[360px] shrink-0">
            <motion.div variants={containerLoader} initial="hidden" animate="show" className="flex flex-col space-y-6 lg:space-y-8">
               {rightWidgets.map(widget => (
                  <motion.div key={widget.id} variants={itemLoader}>
                     {renderWidgetContent(widget.id)}
                  </motion.div>
               ))}
            </motion.div>
         </div>

      </div>
      
      <div className="mt-16 border-t border-outline-variant pt-6 flex flex-col md:flex-row justify-between items-center text-[13px] font-medium text-on-surface-variant">
         <p>© 2026 StudyNex. All rights reserved.</p>
         <div className="flex gap-6 mt-3 md:mt-0">
            <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-on-surface transition-colors">Help Center</a>
         </div>
      </div>
    </main>
  );
};

export default Dashboard;
