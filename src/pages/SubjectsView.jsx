import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getDaysRemaining, getUrgencyText } from '../utils/dateUtils';
import toast from 'react-hot-toast';

const SubjectsView = () => {
  const { 
    subjects, rawSubjects, units, materials,
    toggleUnitCompletion, addSubject, removeSubject,
    addMaterialToUnit, updateUnitName, deleteMaterial
  } = useAppContext();
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | number (unit)
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [newSub, setNewSub] = useState({ name: '', code: '', examDate: '', totalUnits: 1, difficulty: 'Medium' });

  const handleRegister = (e) => {
    e.preventDefault();
    const success = addSubject({
       ...newSub,
       totalUnits: parseInt(newSub.totalUnits)
    });
    if(success) {
       setIsRegisterModalOpen(false);
       setNewSub({ name: '', code: '', examDate: '', totalUnits: 1, difficulty: 'Medium' });
    }
  };

  // --- OVERVIEW GRID / LIST ---
  if (!activeSubjectId) {
    return (
      <main className="p-4 lg:p-10 text-on-surface w-full overflow-hidden relative min-h-screen">
        
        {/* Registration Modal Overlay */}
        <AnimatePresence>
          {isRegisterModalOpen && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm"
             >
               <motion.div 
                 initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
                 className="bg-white border border-outline-variant p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-elevated relative overflow-hidden"
               >
                 <div className="flex justify-between items-center mb-6 border-b border-outline-variant/50 pb-4">
                    <div>
                      <h3 className="font-bold text-xl text-on-surface tracking-tight">Register Subject</h3>
                    </div>
                    <button onClick={() => setIsRegisterModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-md hover:bg-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                 </div>

                 <form onSubmit={handleRegister} className="space-y-4 relative z-10">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Subject Name</label>
                        <input required type="text" placeholder="e.g. Machine Learning" value={newSub.name} onChange={e=>setNewSub({...newSub, name: e.target.value})} className="w-full bg-surface border border-outline-variant text-on-surface text-sm px-3 py-2.5 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-soft" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Subject Code</label>
                        <input required type="text" placeholder="e.g. CS401" value={newSub.code} onChange={e=>setNewSub({...newSub, code: e.target.value})} className="w-full bg-surface border border-outline-variant text-on-surface text-sm px-3 py-2.5 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase shadow-soft" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Exam Date</label>
                        <input required type="date" value={newSub.examDate} onChange={e=>setNewSub({...newSub, examDate: e.target.value})} className="w-full bg-surface border border-outline-variant text-on-surface text-sm px-3 py-2.5 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-soft" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Total Units</label>
                        <input required type="number" min="1" max="25" value={newSub.totalUnits} onChange={e=>setNewSub({...newSub, totalUnits: e.target.value})} className="w-full bg-surface border border-outline-variant text-on-surface text-sm px-3 py-2.5 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-soft" />
                      </div>
                   </div>
                   
                   <div>
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5 mt-2">Difficulty Tier</label>
                      <div className="flex gap-2">
                        {['Easy', 'Medium', 'Hard'].map(d => (
                          <button key={d} type="button" onClick={() => setNewSub({...newSub, difficulty: d})} className={`flex-1 py-2 text-xs font-semibold uppercase rounded-lg border transition-all ${newSub.difficulty === d ? d==='Hard' ? 'bg-error/10 border-error text-error' : d==='Medium' ? 'bg-warning/10 border-warning text-warning' : 'bg-primary/10 border-primary text-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-outline hover:bg-surface-variant shadow-soft'}`}>
                             {d}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="pt-2">
                     <button type="submit" className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-soft">
                       Initialize Subject
                     </button>
                   </div>
                 </form>
               </motion.div>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 max-w-7xl mx-auto border-b border-outline-variant pb-6">
           <div>
             <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface mb-1">Subjects</h1>
             <p className="text-on-surface-variant font-medium text-sm lg:text-base">Manage your academic focus areas.</p>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="flex items-center bg-surface-variant rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                   <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                   <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
             </div>
             
             <button onClick={() => setIsRegisterModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-soft flex items-center gap-1.5">
               <span className="material-symbols-outlined text-[18px]">add</span>
               Add Subject
             </button>
           </div>
        </div>

        <div className={`max-w-7xl mx-auto ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-3'}`}>
          <AnimatePresence>
            {subjects.map((sub, i) => {
               const daysLeft = getDaysRemaining(sub.examDate);
               const incomplete = sub.units - (sub.units * (sub.progress / 100)); // Rough math
               const urgency = getUrgencyText(daysLeft, incomplete);

               if (viewMode === 'grid') {
                 return (
                   <motion.div 
                     key={sub.id}
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                     onClick={() => { setActiveSubjectId(sub.id); setActiveTab('overview'); }}
                     className="sn-card-interactive p-5 flex flex-col justify-between h-56 relative group overflow-hidden"
                   >
                      <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Remove "${sub.name}"?`)) removeSubject(sub.id); }} className="absolute top-3 right-3 z-20 w-8 h-8 rounded-md bg-white border border-outline-variant hover:border-error hover:text-error hover:bg-error/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-on-surface-variant shadow-sm" title="Remove subject">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>

                      <div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${sub.difficulty === 'Hard' ? 'bg-error/5 border-error/20 text-error' : sub.difficulty === 'Medium' ? 'bg-warning/5 border-warning/20 text-warning' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                            {sub.difficulty}
                          </span>
                          <span className="font-bold text-on-surface text-lg">{sub.progress}%</span>
                        </div>
                        <h3 className="font-bold text-lg text-on-surface z-10 relative pr-10 leading-tight">{sub.name}</h3>
                        <p className="text-xs font-semibold text-on-surface-variant mt-1">{sub.code}</p>
                      </div>

                      <div className="relative z-10 mt-4">
                         <p className={`text-[11px] font-bold tracking-wider ${urgency.color} mb-1.5 line-clamp-1`}>{urgency.text}</p>
                         <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${sub.progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full ${sub.progress < 50 ? 'bg-error' : 'bg-primary'}`}></motion.div>
                         </div>
                         <p className="text-[10px] text-on-surface-variant font-semibold text-right mt-2 uppercase tracking-wider">
                           Exam: {new Date(sub.examDate).toLocaleDateString()} (-{daysLeft}d)
                         </p>
                      </div>
                   </motion.div>
                 );
               } else {
                 return (
                   <motion.div 
                     key={sub.id}
                     initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                     onClick={() => { setActiveSubjectId(sub.id); setActiveTab('overview'); }}
                     className="sn-card-interactive p-4 flex items-center justify-between gap-4 group"
                   >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-base text-on-surface leading-tight truncate">{sub.name}</h3>
                           <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded uppercase">{sub.code}</span>
                           <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${sub.difficulty === 'Hard' ? 'bg-error/5 border-error/20 text-error' : sub.difficulty === 'Medium' ? 'bg-warning/5 border-warning/20 text-warning' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                             {sub.difficulty}
                           </span>
                        </div>
                        <div className="flex items-center gap-3">
                           <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Exam: {new Date(sub.examDate).toLocaleDateString()} (-{daysLeft}d)</p>
                           <span className={`text-[11px] font-bold ${urgency.color}`}>{urgency.text}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="flex flex-col items-end w-24 hidden sm:flex">
                           <span className="font-bold text-on-surface text-sm mb-1">{sub.progress}%</span>
                           <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${sub.progress}%` }} transition={{ duration: 0.8 }} className={`h-full ${sub.progress < 50 ? 'bg-error' : 'bg-primary'}`}></motion.div>
                           </div>
                        </div>
                        
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Remove "${sub.name}"?`)) removeSubject(sub.id); }} className="w-8 h-8 rounded-md bg-white border border-outline-variant hover:border-error hover:text-error hover:bg-error/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-on-surface-variant shadow-sm shrink-0" title="Remove subject">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                   </motion.div>
                 );
               }
            })}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  // --- DETAILED INNER VIEW ---
  const activeSub = subjects.find(s => s.id === activeSubjectId);
  if (!activeSub) return null;

  const subjectUnits = units.filter(u => u.subjectId === activeSub.id);

  return (
    <motion.main initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-4 lg:p-10 text-on-surface flex flex-col h-full w-full max-w-7xl mx-auto">
       
       {/* Breadcrumb Navbar */}
       <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
           <button onClick={() => setActiveSubjectId(null)} className="p-1.5 hover:bg-surface-variant rounded-md transition-colors flex items-center justify-center text-on-surface-variant hover:text-on-surface border border-outline-variant bg-white shadow-soft">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
           </button>
           <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">{activeSub.name}</h1>
           <span className="px-2 py-0.5 bg-surface-variant rounded text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">{activeSub.code}</span>
       </div>

       <div className="flex flex-col lg:flex-row gap-8 items-start">
         
         {/* Sidebar Tabs (Desktop) / Horizontal Tabs (Mobile) */}
         <div className="w-full lg:w-64 shrink-0 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-2 lg:pb-0 custom-scrollbar border-b lg:border-b-0 lg:border-r border-outline-variant pr-0 lg:pr-4">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors text-left flex-shrink-0 whitespace-nowrap lg:whitespace-normal ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'}`}
             >
               Overview
             </button>
             {Array.from({ length: activeSub.units }).map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveTab(i + 1)}
                 className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors text-left flex-shrink-0 whitespace-nowrap lg:whitespace-normal flex items-center justify-between gap-2 ${activeTab === i + 1 ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'}`}
               >
                 Unit {i + 1}
                 {subjectUnits.find(u => u.unitNumber === i + 1 && u.completed) && <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>}
               </button>
             ))}
         </div>

         {/* Dynamic Tab Content Area */}
         <div className="flex-1 w-full min-w-0 pb-20">
              {activeTab === 'overview' ? (
                  <OverviewTab sub={activeSub} units={units} materials={materials} updateUnitName={updateUnitName} />
               ) : (
                 <UnitWorkspace
                   sub={activeSub}
                   unitNumber={activeTab}
                   units={units}
                   materials={materials}
                   toggleUnitCompletion={toggleUnitCompletion}
                   addMaterialToUnit={addMaterialToUnit}
                   updateUnitName={updateUnitName}
                   deleteMaterial={deleteMaterial}
                 />
               )}
          </div>
       </div>
     </motion.main>
  );
};

// ─── Overview Tab: Stats + Syllabus Engine ────────────────────────────────
const OverviewTab = ({ sub, units, materials, updateUnitName }) => {
  const [syllabusText, setSyllabusText] = useState('');
  const [parsedUnits, setParsedUnits] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const subjectMaterials = materials.filter(m => m.subjectId === sub.id);
  const completedUnits = units.filter(u => u.subjectId === sub.id && u.completed).length;

  const parseSyllabus = () => {
    if (!syllabusText.trim()) return toast.error('Paste your syllabus text first');
    setIsParsing(true);
    setTimeout(() => {
      // Regex: match lines starting with number/bullet/Unit/Chapter keywords
      const lines = syllabusText.split('\n').map(l => l.trim()).filter(Boolean);
      const extracted = lines
        .filter(l => /^(unit|chapter|module|topic|\d+[\.\)])/i.test(l))
        .map((l, i) => ({
          unitNumber: i + 1,
          name: l.replace(/^(unit|chapter|module|topic|\d+[\.\):\-\s]+)/i, '').trim() || `Unit ${i + 1}`
        }))
        .slice(0, sub.totalUnits);

      // Fallback: take first N non-empty lines if no pattern matched
      if (extracted.length === 0) {
        lines.slice(0, sub.totalUnits).forEach((l, i) => extracted.push({ unitNumber: i + 1, name: l }));
      }

      setParsedUnits(extracted);
      setIsParsing(false);
      setConfirmed(false);
      toast.success(`Extracted ${extracted.length} units from syllabus`);
    }, 1200);
  };

  const confirmParsed = () => {
    parsedUnits.forEach(u => updateUnitName(sub.id, u.unitNumber, u.name));
    setConfirmed(true);
    setSyllabusText('');
    setParsedUnits([]);
    toast.success('Syllabus applied — units updated!');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Progress', value: `${sub.progress}%`, icon: 'donut_large', color: 'text-primary' },
          { label: 'Units Done', value: `${completedUnits}/${sub.totalUnits}`, icon: 'layers', color: 'text-secondary' },
          { label: 'Materials', value: subjectMaterials.length, icon: 'folder', color: 'text-primary' },
          { label: 'Retention', value: `${sub.retention || 0}%`, icon: 'psychology', color: sub.retention > 70 ? 'text-secondary' : 'text-error' },
        ].map(stat => (
          <div key={stat.label} className="sn-card p-5 text-center flex flex-col items-center justify-center">
            <span className={`material-symbols-outlined text-[24px] ${stat.color} mb-2 block opacity-80`}>{stat.icon}</span>
            <p className={`font-bold text-2xl ${stat.color} leading-none mb-1`}>{stat.value}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sn-card p-6 border-l-4 border-l-primary bg-primary/5">
          <h3 className="font-bold text-on-surface mb-1 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">timer</span> Focus Sprint
          </h3>
          <p className="text-xs font-medium text-on-surface-variant mb-4">Engage Pomodoro timer with background UI dimming.</p>
          <button onClick={() => toast('Focus Sprint launching...')} className="w-full py-2.5 rounded-lg bg-white border border-outline-variant flex items-center justify-center gap-1.5 text-on-surface font-semibold text-sm hover:bg-surface transition-colors shadow-soft">
            Initialize Sprint
          </button>
        </div>
        <div className="sn-card p-6 border-l-4 border-l-secondary bg-secondary/5">
          <h3 className="font-bold text-on-surface mb-1 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-secondary text-[18px]">warning</span> Exam Mode
          </h3>
          <p className="text-xs font-medium text-on-surface-variant mb-4">AI surfaces only incomplete topics relevant to your exam date.</p>
          <button onClick={() => toast('Exam Mode engaging...')} className="w-full py-2.5 rounded-lg bg-white border border-outline-variant flex items-center justify-center gap-1.5 text-on-surface font-semibold text-sm hover:bg-surface transition-colors shadow-soft">
            Engage Exam Mode
          </button>
        </div>
      </div>

      {/* Syllabus Engine */}
      <div className="sn-card overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-outline-variant flex items-center justify-between bg-surface-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_stories</span>
            <h3 className="font-bold text-sm text-on-surface">Syllabus Engine</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">AI Powered</span>
        </div>

        <div className="p-5 lg:p-6 space-y-4">
          <p className="text-sm font-medium text-on-surface-variant">Paste your syllabus text below. AI will extract unit names and auto-populate your unit tabs.</p>
          <textarea
            value={syllabusText}
            onChange={e => setSyllabusText(e.target.value)}
            placeholder={"Unit 1: Introduction to Algorithms\nUnit 2: Sorting & Searching\nUnit 3: Trees and Graphs\n..."}
            rows={5}
            className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none custom-scrollbar shadow-inner-soft"
          />
          <button
            onClick={parseSyllabus}
            disabled={isParsing}
            className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-primary/20"
          >
            {isParsing ? <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Parsing...</> : <><span className="material-symbols-outlined text-[18px]">auto_fix_high</span> Parse Syllabus</>}
          </button>

          {/* Parsed Unit Preview */}
          {parsedUnits.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-outline-variant">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Extracted {parsedUnits.length} Units — Review & Confirm:</p>
              <div className="flex flex-wrap gap-2">
                {parsedUnits.map(u => (
                  <div key={u.unitNumber} className="flex items-center gap-1.5 bg-surface border border-outline-variant rounded-md px-2.5 py-1.5 shadow-soft">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1 rounded">U{u.unitNumber}</span>
                    <span className="text-xs font-semibold text-on-surface truncate max-w-[200px]">{u.name}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmParsed}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-soft"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Apply to Subject Units
              </button>
            </motion.div>
          )}
          {confirmed && (
            <p className="text-sm text-center text-primary font-semibold bg-primary/5 p-3 rounded-lg border border-primary/20">Syllabus applied — check your unit tabs!</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Unit Workspace Component ──────────────────────────────────────────────
const TYPE_ICONS = {
  pdf: { icon: 'picture_as_pdf', cls: 'bg-error/10 text-error border-error/20' },
  image: { icon: 'image', cls: 'bg-secondary/10 text-secondary border-secondary/20' },
  youtube: { icon: 'smart_display', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
  link: { icon: 'link', cls: 'bg-primary/10 text-primary border-primary/20' },
  text: { icon: 'description', cls: 'bg-primary/10 text-primary border-primary/20' },
};

const UnitWorkspace = ({ sub, unitNumber, units, materials, toggleUnitCompletion, addMaterialToUnit, updateUnitName, deleteMaterial }) => {
  const [inputTab, setInputTab] = useState('file'); // 'file'|'link'|'text'
  const [isDragging, setIsDragging] = useState(false);
  const [linkVal, setLinkVal] = useState('');
  const [textVal, setTextVal] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [unitNameVal, setUnitNameVal] = useState('');
  const fileInputRef = useRef(null);

  const unitRecord = units.find(u => u.subjectId === sub.id && u.unitNumber === unitNumber);
  const isCompleted = unitRecord?.completed || false;
  const unitName = unitRecord?.name || `Unit ${unitNumber}`;
  const unitMaterials = materials.filter(m => m.subjectId === sub.id && m.unitNumber === unitNumber);

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const type = file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'text';
    addMaterialToUnit(sub.id, unitNumber, { title: file.name, type, content: '' });
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'text';
    addMaterialToUnit(sub.id, unitNumber, { title: file.name, type, content: '' });
    e.target.value = '';
  };

  const handleLinkSubmit = () => {
    if (!linkVal.trim()) return toast.error('Paste a valid URL');
    const type = linkVal.includes('youtube') || linkVal.includes('youtu.be') ? 'youtube' : 'link';
    const title = type === 'youtube' ? 'YouTube Reference' : new URL(linkVal.startsWith('http') ? linkVal : 'https://' + linkVal).hostname;
    addMaterialToUnit(sub.id, unitNumber, { title, type, content: linkVal });
    setLinkVal('');
  };

  const handleTextSubmit = () => {
    if (!textTitle.trim() || !textVal.trim()) return toast.error('Title and notes are required');
    addMaterialToUnit(sub.id, unitNumber, { title: textTitle, type: 'text', content: textVal });
    setTextTitle(''); setTextVal('');
  };

  const handleSaveName = () => {
    if (unitNameVal.trim()) updateUnitName(sub.id, unitNumber, unitNameVal.trim());
    setEditingName(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Unit Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sn-card p-5 sm:p-6 gap-4 bg-surface-variant/30">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white border border-outline-variant text-primary flex items-center justify-center shrink-0 shadow-soft">
            <span className="material-symbols-outlined text-[24px]">layers</span>
          </div>
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={unitNameVal}
                onChange={e => setUnitNameVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="bg-surface border border-primary text-on-surface text-sm font-semibold px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary flex-1 min-w-0 shadow-inner-soft"
                placeholder={unitName}
              />
              <button onClick={handleSaveName} className="text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors border border-primary/20">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </button>
              <button onClick={() => setEditingName(false)} className="text-on-surface-variant bg-white border border-outline-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-lg transition-colors shadow-soft">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col min-w-0 group cursor-pointer" onClick={() => { setUnitNameVal(unitName); setEditingName(true); }}>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-on-surface truncate">{unitName}</h2>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
              </div>
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">
                {unitMaterials.length} resource{unitMaterials.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => toggleUnitCompletion(sub.id, unitNumber)}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto shadow-soft ${
            isCompleted
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-variant'}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCompleted ? 'verified' : 'radio_button_unchecked'}
          </span>
          {isCompleted ? 'Unit Certified' : 'Mark Complete'}
        </button>
      </div>

      {/* Input Panel */}
      <div className="sn-card overflow-hidden">
        {/* Input Tab Bar */}
        <div className="flex border-b border-outline-variant bg-surface-variant/30">
          {[
            { id: 'file', icon: 'upload_file', label: 'Upload' },
            { id: 'link', icon: 'link', label: 'Link' },
            { id: 'text', icon: 'edit_note', label: 'Notes' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setInputTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] uppercase tracking-wider font-bold transition-colors border-b-2 ${
                inputTab === t.id ? 'bg-white text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 bg-white">
          {/* File Upload Tab */}
          {inputTab === 'file' && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-variant/30'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,image/*,.txt" className="hidden" onChange={handleFileInput} />
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-surface-variant border border-outline-variant text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[28px]">
                  {isDragging ? 'file_download' : 'cloud_upload'}
                </span>
              </div>
              <p className="font-bold text-on-surface text-sm mb-1">{isDragging ? 'Drop to import' : 'Drag & Drop or Click to Upload'}</p>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">PDF, Images, or Text files</p>
            </div>
          )}

          {/* Link Tab */}
          {inputTab === 'link' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-sm font-medium text-on-surface-variant text-center mb-6">Save a reference to a YouTube video, Google Drive folder, or any website.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={linkVal}
                  onChange={e => setLinkVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLinkSubmit()}
                  placeholder="https://..."
                  className="flex-1 bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-soft"
                />
                <button onClick={handleLinkSubmit} className="px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-soft whitespace-nowrap">
                  Add Link
                </button>
              </div>
            </div>
          )}

          {/* Text Notes Tab */}
          {inputTab === 'text' && (
            <div className="space-y-4">
              <input
                value={textTitle}
                onChange={e => setTextTitle(e.target.value)}
                placeholder="Note title (e.g. 'Lecture 3 summary')"
                className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-bold px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-soft"
              />
              <textarea
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                placeholder="Paste your raw notes here..."
                rows={5}
                className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none custom-scrollbar shadow-inner-soft"
              />
              <div className="flex justify-end">
                <button onClick={handleTextSubmit} className="px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-soft">
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Material Feed */}
      <div className="space-y-4 pt-4 border-t border-outline-variant">
        <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">folder_open</span>
          Unit Materials ({unitMaterials.length})
        </h3>

        <AnimatePresence>
          {unitMaterials.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl bg-surface">
              <span className="material-symbols-outlined text-[32px] mb-2 opacity-40">inventory_2</span>
              <p className="font-bold text-sm text-on-surface">Workspace is empty</p>
              <p className="text-xs font-medium mt-1">Use the panel above to add your first resource</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unitMaterials.map((mat, i) => {
                const typeInfo = TYPE_ICONS[mat.type] || TYPE_ICONS.text;
                return (
                  <motion.div
                    key={mat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                    className="sn-card-interactive p-4 flex flex-col gap-4 group justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border shrink-0 ${typeInfo.cls}`}>
                        <span className="material-symbols-outlined text-[20px]">{typeInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">{mat.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded">{mat.type}</span>
                          {mat.summary && <span className="text-[9px] text-secondary font-bold uppercase tracking-wider bg-secondary/10 px-1.5 py-0.5 rounded">Summarized</span>}
                        </div>
                      </div>
                    </div>
  
                    {/* Action Belt */}
                    <div className="flex items-center justify-between border-t border-outline-variant/50 pt-3">
                      <span className="text-[10px] font-semibold text-on-surface-variant">
                          Added {new Date(mat.createdAt || mat.addedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toast('AI summary generating...')}
                          title="AI Summarize"
                          className="w-7 h-7 rounded bg-secondary/5 border border-secondary/20 flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        </button>
                        <button
                          onClick={() => toast(`Previewing: ${mat.title}`)}
                          title="Preview"
                          className="w-7 h-7 rounded bg-primary/5 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`Remove "${mat.title}"?`)) deleteMaterial(mat.id); }}
                          title="Delete"
                          className="w-7 h-7 rounded bg-error/5 border border-error/20 flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubjectsView;
