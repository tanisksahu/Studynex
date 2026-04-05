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

  // --- OVERVIEW GRID ---
  if (!activeSubjectId) {
    return (
      <main className="p-6 lg:p-10 text-on-surface w-full overflow-hidden relative min-h-screen">
        
        {/* Registration Modal Overlay */}
        <AnimatePresence>
          {isRegisterModalOpen && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             >
               <motion.div 
                 initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                 className="bg-surface-container-high border border-outline-variant/20 p-8 rounded-3xl w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
               >
                 <div className="flex justify-between items-center mb-6 border-b border-outline-variant/10 pb-4">
                    <div>
                      <h3 className="font-headline font-black text-2xl text-white tracking-widest uppercase">Register Course</h3>
                      <p className="text-xs text-primary font-bold tracking-widest uppercase mt-1">Initiate Protocol</p>
                    </div>
                    <button onClick={() => setIsRegisterModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                 </div>

                 <form onSubmit={handleRegister} className="space-y-4 relative z-10">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Subject Name</label>
                        <input required type="text" placeholder="e.g. Machine Learning" value={newSub.name} onChange={e=>setNewSub({...newSub, name: e.target.value})} className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Subject Code</label>
                        <input required type="text" placeholder="e.g. CS401" value={newSub.code} onChange={e=>setNewSub({...newSub, code: e.target.value})} className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all uppercase" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Exam Date</label>
                        <input required type="date" value={newSub.examDate} onChange={e=>setNewSub({...newSub, examDate: e.target.value})} className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Total Units</label>
                        <input required type="number" min="1" max="25" value={newSub.totalUnits} onChange={e=>setNewSub({...newSub, totalUnits: e.target.value})} className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all" />
                      </div>
                   </div>
                   
                   <div>
                      <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Difficulty Tier</label>
                      <div className="flex gap-2">
                        {['Easy', 'Medium', 'Hard'].map(d => (
                          <button key={d} type="button" onClick={() => setNewSub({...newSub, difficulty: d})} className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl border transition-all ${newSub.difficulty === d ? d==='Hard' ? 'bg-error/20 border-error text-error' : d==='Medium' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-primary/20 border-primary text-primary' : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline-variant'}`}>
                             {d}
                          </button>
                        ))}
                      </div>
                   </div>

                   <button type="submit" className="w-full py-4 mt-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all">
                     Initialize Subject
                   </button>
                 </form>
               </motion.div>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-10">
           <div>
             <h1 className="text-3xl font-headline font-black tracking-widest uppercase z-10 relative drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">Master Database</h1>
             <p className="text-on-surface-variant z-10 relative font-medium mt-1">Select a subject layer to expand inner modules.</p>
           </div>
           <button onClick={() => setIsRegisterModalOpen(true)} className="bg-primary hover:bg-indigo-400 text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95">
             + Register Course
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {subjects.map((sub, i) => {
               const daysLeft = getDaysRemaining(sub.examDate);
               const incomplete = sub.units - (sub.units * (sub.progress / 100)); // Rough math, using specific units later
               const urgency = getUrgencyText(daysLeft, incomplete);

               return (
                 <motion.div 
                   key={sub.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   onClick={() => { setActiveSubjectId(sub.id); setActiveTab('overview'); }}
                   className="neo-glass p-6 rounded-3xl cursor-pointer neo-glow-hover flex flex-col justify-between h-56 relative overflow-hidden group border border-outline-variant/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                       <span className="font-headline font-black text-6xl text-white">{sub.code}</span>
                    </div>

                    {/* Delete Button — stops card click propagation */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Remove "${sub.name}" from the system? This cannot be undone.`)) {
                          removeSubject(sub.id);
                        }
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-error/0 hover:bg-error/20 border border-transparent hover:border-error/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-error"
                      title="Remove subject"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>

                    <div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${sub.difficulty === 'Hard' ? 'bg-error/20 text-error border border-error/30' : sub.difficulty === 'Medium' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                          {sub.difficulty}
                        </span>
                        <span className="font-headline font-black text-white text-lg">{sub.progress}%</span>
                      </div>
                      <h3 className="font-headline font-bold text-xl text-white z-10 relative pr-10">{sub.name}</h3>
                    </div>

                    <div className="relative z-10">
                       <p className={`text-xs font-bold font-body tracking-wider ${urgency.color} mb-2 line-clamp-1`}>{urgency.text}</p>
                       <div className="w-full bg-[#0b1326] h-2 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${sub.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${sub.progress < 50 ? 'bg-error shadow-[0_0_10px_rgba(255,92,92,0.8)]' : 'bg-primary shadow-[0_0_10px_rgba(79,70,229,0.8)]'}`}
                          ></motion.div>
                       </div>
                       <p className="text-[0.65rem] text-on-surface-variant font-bold text-right mt-2 uppercase tracking-widest">
                         Exam: {new Date(sub.examDate).toLocaleDateString()} (-{daysLeft} Days)
                       </p>
                    </div>
                 </motion.div>
               )
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
    <motion.main initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-6 lg:p-10 text-on-surface flex flex-col h-full w-full">
       {/* Breadcrumb Navbar */}
       <div className="flex items-center gap-3 mb-8">
           <button onClick={() => setActiveSubjectId(null)} className="p-2 hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <h1 className="text-2xl font-headline font-black tracking-widest text-white uppercase">{activeSub.name}</h1>
           <span className="px-3 py-1 bg-[#0b1326] rounded-full text-[0.65rem] font-bold tracking-widest border border-outline-variant/30 text-primary">{activeSub.code}</span>
       </div>

       {/* Tabs Row */}
       <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-none border-b border-outline-variant/10">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-6 py-2 rounded-t-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'overview' ? 'bg-primary border-b-2 border-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-surface-container-low text-on-surface-variant hover:text-white'}`}
           >
             Overview Hub
           </button>
           {Array.from({ length: activeSub.units }).map((_, i) => (
             <button 
               key={i} 
               onClick={() => setActiveTab(i + 1)}
               className={`px-6 py-2 rounded-t-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 ${activeTab === i + 1 ? 'bg-surface-container-high border-b-2 border-white text-white' : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
             >
               Unit {i + 1}
               {subjectUnits.find(u => u.unitNumber === i + 1 && u.completed) && <span className="material-symbols-outlined text-[12px] text-primary">check_circle</span>}
             </button>
           ))}
       </div>

       {/* Dynamic Tab Content Area */}
       <div className="flex-1 w-full bg-surface-container-low/30 rounded-3xl border border-outline-variant/10 p-6 relative overflow-y-auto neo-glass">
            
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
      toast.success(`Extracted ${extracted.length} units from syllabus`, { icon: '📋' });
    }, 1200);
  };

  const confirmParsed = () => {
    parsedUnits.forEach(u => updateUnitName(sub.id, u.unitNumber, u.name));
    setConfirmed(true);
    setSyllabusText('');
    setParsedUnits([]);
    toast.success('Syllabus applied — units updated!', { icon: '✅', style: { background: '#222', color: '#4edea3' } });
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Progress', value: `${sub.progress}%`, icon: 'donut_large', color: 'text-primary' },
          { label: 'Units Done', value: `${completedUnits}/${sub.totalUnits}`, icon: 'layers', color: 'text-secondary' },
          { label: 'Materials', value: subjectMaterials.length, icon: 'folder', color: 'text-primary' },
          { label: 'Retention', value: `${sub.retention || 0}%`, icon: 'psychology', color: sub.retention > 70 ? 'text-secondary' : 'text-error' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0b1326]/60 rounded-2xl border border-outline-variant/10 p-4 text-center">
            <span className={`material-symbols-outlined text-2xl ${stat.color} mb-1 block`}>{stat.icon}</span>
            <p className={`font-headline font-black text-xl ${stat.color}`}>{stat.value}</p>
            <p className="text-[0.6rem] text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0b1326]/50 p-5 rounded-2xl border border-primary/20">
          <h3 className="font-headline font-bold text-white mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">timer</span> Focus Sprint
          </h3>
          <p className="text-xs text-on-surface-variant mb-3">Engage Pomodoro timer with background UI dimming.</p>
          <button onClick={() => toast('Focus Sprint launching...', { icon: '⏱️' })} className="w-full py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center gap-2 text-white font-bold tracking-widest uppercase text-xs hover:bg-primary/20 transition-colors">
            Initialize Sprint
          </button>
        </div>
        <div className="bg-[#0b1326]/50 p-5 rounded-2xl border border-secondary/20">
          <h3 className="font-headline font-bold text-white mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">warning</span> Exam Mode
          </h3>
          <p className="text-xs text-on-surface-variant mb-3">AI surfaces only incomplete topics relevant to your exam date.</p>
          <button onClick={() => toast('Exam Mode engaging...', { icon: '🎯', style: { color: '#4edea3' } })} className="w-full py-2.5 rounded-xl bg-secondary text-[#0b1326] flex items-center justify-center gap-2 font-black tracking-widest uppercase text-xs hover:shadow-[0_0_20px_rgba(78,222,163,0.5)] transition-all">
            Engage Exam Mode
          </button>
        </div>
      </div>

      {/* Syllabus Engine */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden">
        <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
            <h3 className="font-headline font-bold uppercase tracking-widest text-sm">Syllabus Engine</h3>
          </div>
          <span className="text-[0.6rem] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">AI Powered</span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-on-surface-variant">Paste your syllabus text below. AI will extract unit names and auto-populate your unit tabs.</p>
          <textarea
            value={syllabusText}
            onChange={e => setSyllabusText(e.target.value)}
            placeholder={"Unit 1: Introduction to Algorithms\nUnit 2: Sorting & Searching\nUnit 3: Trees and Graphs\n..."}
            rows={5}
            className="w-full bg-[#0b1326]/80 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all resize-none font-mono"
          />
          <button
            onClick={parseSyllabus}
            disabled={isParsing}
            className="w-full py-3 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isParsing ? <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Parsing...</> : <><span className="material-symbols-outlined text-sm">auto_fix_high</span> Parse Syllabus</>}
          </button>

          {/* Parsed Unit Preview */}
          {parsedUnits.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-secondary">Extracted {parsedUnits.length} Units — Review & Confirm:</p>
              <div className="flex flex-wrap gap-2">
                {parsedUnits.map(u => (
                  <div key={u.unitNumber} className="flex items-center gap-1.5 bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-1.5">
                    <span className="text-[0.55rem] font-black text-primary bg-primary/10 px-1.5 rounded">U{u.unitNumber}</span>
                    <span className="text-xs font-bold text-white truncate max-w-[140px]">{u.name}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmParsed}
                className="w-full py-3 bg-secondary hover:bg-[#3acc91] text-[#0b1326] rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(78,222,163,0.3)]"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                Apply to Subject Units
              </button>
            </motion.div>
          )}
          {confirmed && (
            <p className="text-xs text-center text-secondary font-bold">✅ Syllabus applied — check your unit tabs above!</p>
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
    <div className="space-y-6">
      {/* Unit Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0b1326]/60 p-5 rounded-2xl border border-outline-variant/10 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0">layers</span>
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={unitNameVal}
                onChange={e => setUnitNameVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="bg-[#0b1326] border border-primary/50 text-white text-lg font-bold px-3 py-1 rounded-lg outline-none flex-1 min-w-0"
                placeholder={unitName}
              />
              <button onClick={handleSaveName} className="text-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined">check</span>
              </button>
              <button onClick={() => setEditingName(false)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xl font-headline font-black text-white truncate">{unitName}</h2>
              <button onClick={() => { setUnitNameVal(unitName); setEditingName(true); }}
                className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <span className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest shrink-0">
                {unitMaterials.length} item{unitMaterials.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => toggleUnitCompletion(sub.id, unitNumber)}
          className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shrink-0 ${
            isCompleted
              ? 'bg-primary/20 border border-primary text-primary shadow-[0_0_15px_rgba(79,70,229,0.2)]'
              : 'bg-surface-container text-white border border-outline-variant/30 hover:border-primary/40'}`}
        >
          <span className="material-symbols-outlined text-sm">
            {isCompleted ? 'verified' : 'radio_button_unchecked'}
          </span>
          {isCompleted ? 'Unit Certified' : 'Mark Complete'}
        </button>
      </div>

      {/* Input Panel */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden">
        {/* Input Tab Bar */}
        <div className="flex border-b border-outline-variant/10">
          {[
            { id: 'file', icon: 'upload_file', label: 'Upload' },
            { id: 'link', icon: 'link', label: 'Link' },
            { id: 'text', icon: 'edit_note', label: 'Notes' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setInputTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                inputTab === t.id ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* File Upload Tab */}
          {inputTab === 'file' && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,image/*,.txt" className="hidden" onChange={handleFileInput} />
              <span className={`material-symbols-outlined text-4xl mb-3 transition-all ${isDragging ? 'text-primary animate-bounce' : 'text-on-surface-variant'}`}>
                {isDragging ? 'file_download' : 'cloud_upload'}
              </span>
              <p className="font-bold text-white text-sm mb-1">{isDragging ? 'Drop to import' : 'Drag & Drop or Click to Upload'}</p>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">PDF · Images · Text files</p>
            </div>
          )}

          {/* Link Tab */}
          {inputTab === 'link' && (
            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">YouTube, Google Drive, or any URL</p>
              <div className="flex gap-3">
                <input
                  value={linkVal}
                  onChange={e => setLinkVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLinkSubmit()}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-[#0b1326]/80 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all"
                />
                <button onClick={handleLinkSubmit} className="px-5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all">
                  Add
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['youtube.com', 'drive.google.com', 'notion.so'].map(ex => (
                  <button key={ex} onClick={() => setLinkVal(`https://${ex}/`)}
                    className="text-[0.6rem] bg-surface-container-highest border border-outline-variant/20 px-2 py-1 rounded-lg text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-bold">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Notes Tab */}
          {inputTab === 'text' && (
            <div className="space-y-3">
              <input
                value={textTitle}
                onChange={e => setTextTitle(e.target.value)}
                placeholder="Note title (e.g. 'Lecture 3 summary')"
                className="w-full bg-[#0b1326]/80 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all"
              />
              <textarea
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                placeholder="Paste your raw notes here..."
                rows={5}
                className="w-full bg-[#0b1326]/80 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-all resize-none"
              />
              <button onClick={handleTextSubmit} className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all">
                Save Notes to Unit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Material Feed */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">folder_open</span>
          Unit Materials ({unitMaterials.length})
        </h3>

        <AnimatePresence>
          {unitMaterials.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-on-surface-variant opacity-60 border-2 border-dashed border-outline-variant/10 rounded-2xl">
              <span className="material-symbols-outlined text-5xl mb-3">folder_open</span>
              <p className="font-bold text-sm">No materials yet</p>
              <p className="text-xs mt-1">Use the panel above to add your first resource</p>
            </motion.div>
          ) : (
            unitMaterials.map((mat, i) => {
              const typeInfo = TYPE_ICONS[mat.type] || TYPE_ICONS.text;
              return (
                <motion.div
                  key={mat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                  className="bg-surface-container border border-outline-variant/10 rounded-xl p-4 flex items-center gap-4 group hover:border-outline-variant/30 hover:bg-surface-container-highest transition-all relative overflow-hidden"
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${typeInfo.cls}`}>
                    <span className="material-symbols-outlined text-lg">{typeInfo.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">{mat.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant">{mat.type}</span>
                      {mat.summary && <span className="text-[0.6rem] text-secondary font-bold">• Summarized</span>}
                      <span className="text-[0.6rem] text-on-surface-variant">
                        {new Date(mat.createdAt || mat.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Belt */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toast('AI summary generating...', { icon: '🧠', style: { background: '#222', color: '#4edea3' } })}
                      title="AI Summarize"
                      className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary hover:bg-secondary/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    </button>
                    <button
                      onClick={() => toast(`Previewing: ${mat.title}`, { icon: '👁️' })}
                      title="Preview"
                      className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Remove "${mat.title}"?`)) deleteMaterial(mat.id); }}
                      title="Delete"
                      className="w-8 h-8 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center text-error hover:bg-error/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubjectsView;
