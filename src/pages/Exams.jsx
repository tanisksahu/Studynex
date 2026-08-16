import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { calculateExamGaps, calculateExamReadiness, detectConflicts } from '../utils/examEngine';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Exams = () => {
  const { exams, subjects } = useAppContext();
  const [view, setView] = useState('timeline'); // 'timeline', 'list'

  // Sort exams chronologically
  const sortedExams = useMemo(() => {
    return [...(exams || [])].sort((a, b) => {
      return dayjs(`${a.date} ${a.startTime || '00:00'}`).diff(dayjs(`${b.date} ${b.startTime || '00:00'}`));
    });
  }, [exams]);

  const upcomingExams = sortedExams.filter(e => dayjs(`${e.date} ${e.startTime || '00:00'}`).isAfter(dayjs().subtract(1, 'day')));
  const nextExam = upcomingExams[0];

  const gaps = useMemo(() => calculateExamGaps(upcomingExams), [upcomingExams]);
  const clusters = useMemo(() => detectConflicts(upcomingExams), [upcomingExams]);

  const getSubjectForExam = (exam) => subjects.find(s => s.id === exam.subjectId) || {};

  return (
    <main className="p-4 lg:p-10 text-on-surface h-full flex flex-col gap-6 max-w-[1400px] mx-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-3">
               Exams & Date Sheet
            </h1>
            <p className="text-on-surface-variant font-medium mt-1">Your academic assessment timeline and pressure analysis.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="bg-surface-variant/40 p-1 rounded-xl flex border border-outline-variant">
               <button onClick={() => setView('timeline')} className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all ${view === 'timeline' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Timeline</button>
               <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>List</button>
            </div>
            <button className="bg-primary text-white hover:bg-primary/90 px-5 py-2.5 rounded-xl font-bold tracking-wider text-sm shadow-sm transition-all flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">add</span> Add Exam
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Main Content Area */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Alerts / Clusters */}
            <AnimatePresence>
               {clusters.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-error/10 border border-error/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                     <span className="material-symbols-outlined text-error text-[28px]">warning</span>
                     <div>
                        <h3 className="font-bold text-error tracking-tight text-lg mb-1">High Exam Pressure Detected</h3>
                        <p className="text-sm font-medium text-error/80 mb-3">{clusters[0].message}. This cluster carries high academic risk.</p>
                        <button className="bg-error text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider hover:bg-error/90 transition-colors">
                           Rebalance Study Plan
                        </button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Timeline View */}
            {view === 'timeline' && (
               <div className="sn-card p-6 lg:p-8 border border-outline-variant bg-white relative">
                  <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-8 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[20px] text-primary">calendar_month</span> Academic Timeline
                  </h2>

                  {upcomingExams.length === 0 ? (
                     <div className="text-center py-10 opacity-50">
                        <span className="material-symbols-outlined text-[48px] mb-2">event_busy</span>
                        <p className="font-medium">No upcoming exams logged.</p>
                     </div>
                  ) : (
                     <div className="relative border-l-2 border-outline-variant/60 ml-4 lg:ml-6 space-y-2 pb-6">
                        {upcomingExams.map((exam, index) => {
                           const readiness = calculateExamReadiness(exam, getSubjectForExam(exam));
                           const gap = gaps.find(g => g.fromExam.id === exam.id);

                           return (
                              <div key={exam.id} className="relative">
                                 {/* Exam Node */}
                                 <div className="flex items-start mb-2 group">
                                    <div className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 bg-primary"></div>
                                    <div className="pl-8 w-full">
                                       <div className="bg-surface-variant/20 border border-outline-variant/50 p-5 rounded-2xl hover:border-primary/40 transition-colors shadow-inner-soft group-hover:shadow-soft">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                             <div>
                                                <div className="flex items-center gap-3 mb-1.5">
                                                   <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-md">{dayjs(exam.date).format('DD MMM YYYY')}</span>
                                                   <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {exam.startTime}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-on-surface mb-1">{exam.subjectName}</h3>
                                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{exam.courseCode}</p>
                                             </div>
                                             
                                             <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="text-right">
                                                   <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Readiness</span>
                                                   <div className="flex items-center gap-2">
                                                      <span className={`text-sm font-bold ${readiness.risk === 'HIGH' ? 'text-error' : readiness.risk === 'MEDIUM' ? 'text-secondary' : 'text-primary'}`}>
                                                         {Math.round(readiness.score)}%
                                                      </span>
                                                      <div className="w-24 h-2 bg-surface-variant rounded-full overflow-hidden">
                                                         <div className={`h-full rounded-full ${readiness.risk === 'HIGH' ? 'bg-error' : readiness.risk === 'MEDIUM' ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${readiness.score}%` }}></div>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Gap Node */}
                                 {gap && (
                                    <div className="pl-8 py-3 w-full">
                                       <div className={`flex items-center justify-center py-2.5 rounded-xl border border-dashed ${gap.isHighRisk ? 'bg-error/5 border-error/30 text-error' : 'bg-secondary/5 border-secondary/30 text-secondary'}`}>
                                          <span className="text-xs font-bold tracking-wider flex items-center gap-2">
                                             <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                             {gap.days > 0 && `${gap.days}d `}{gap.hours}h gap available for preparation
                                          </span>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Sidebar / Insights */}
         <div className="flex flex-col gap-6">
            
            {/* Next Exam Widget */}
            {nextExam && (
               <div className="sn-card p-6 bg-primary text-white shadow-elevated relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <span className="material-symbols-outlined text-[120px]">timer</span>
                  </div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-6 flex items-center gap-2 relative z-10">
                     <span className="material-symbols-outlined text-[16px]">notifications_active</span> Next Exam
                  </h2>
                  <div className="relative z-10">
                     <h3 className="text-2xl font-bold tracking-tight leading-tight mb-1">{nextExam.subjectName}</h3>
                     <p className="text-sm font-medium text-white/80 mb-6">{dayjs(nextExam.date).format('dddd, DD MMMM YYYY')} at {nextExam.startTime}</p>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                           <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Time Left</span>
                           <span className="text-xl font-bold">{dayjs(`${nextExam.date} ${nextExam.startTime}`).fromNow(true)}</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                           <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Readiness</span>
                           <span className="text-xl font-bold">{Math.round(calculateExamReadiness(nextExam, getSubjectForExam(nextExam)).score)}%</span>
                        </div>
                     </div>

                     {/* Preparation Window Panel */}
                     <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[14px]">psychology</span> Preparation Window
                        </h4>
                        <div className="space-y-3">
                           <div>
                              <div className="flex justify-between text-xs font-medium mb-1.5 text-white/90">
                                 <span>Study Time Logged</span>
                                 <span>{Math.round((getSubjectForExam(nextExam)?.timeSpent || 0) / 60)}h / {Math.max(10, Math.round((getSubjectForExam(nextExam)?.units || 10) * 1.5))}h rec.</span>
                              </div>
                              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                                 <div className="bg-secondary h-full" style={{ width: `${Math.min(100, ((getSubjectForExam(nextExam)?.timeSpent || 0) / 60) / Math.max(10, Math.round((getSubjectForExam(nextExam)?.units || 10) * 1.5)) * 100)}%` }}></div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <button className="w-full bg-white text-primary hover:bg-white/90 py-3 rounded-xl font-bold tracking-wider text-sm shadow-sm transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">menu_book</span> Generate Focus Plan
                     </button>
                  </div>
               </div>
            )}

            {/* Exam Load */}
            <div className="sn-card p-6 border border-outline-variant bg-white">
               <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary">monitoring</span> Exam Load Analysis
               </h2>

               <div className="space-y-5">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-on-surface-variant">Total Upcoming</span>
                     <span className="text-lg font-bold text-on-surface">{upcomingExams.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-on-surface-variant">Avg Gap Duration</span>
                     <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        {gaps.length > 0 ? `${Math.round(gaps.reduce((acc, g) => acc + g.totalHours, 0) / gaps.length / 24)} days` : 'N/A'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-on-surface-variant">Shortest Gap</span>
                     <span className="text-sm font-bold text-error bg-error/10 px-3 py-1 rounded-lg">
                        {gaps.length > 0 ? (() => {
                           const shortest = [...gaps].sort((a,b) => a.totalHours - b.totalHours)[0];
                           return `${shortest.days}d ${shortest.hours}h`;
                        })() : 'N/A'}
                     </span>
                  </div>
               </div>
            </div>

         </div>

      </div>
    </main>
  );
};

export default Exams;
