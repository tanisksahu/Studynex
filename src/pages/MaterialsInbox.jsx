import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  pdf: { icon: 'picture_as_pdf', cls: 'bg-error/10 text-error border-error/20' },
  image: { icon: 'image', cls: 'bg-secondary/10 text-secondary border-secondary/20' },
  youtube: { icon: 'smart_display', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
  link: { icon: 'link', cls: 'bg-primary/10 text-primary border-primary/20' },
  text: { icon: 'description', cls: 'bg-primary/10 text-primary border-primary/20' },
  gdrive: { icon: 'folder', cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
};

const MaterialsInbox = () => {
  const { addMaterial, materials, deleteMaterial, subjects, routeMaterialToUnit, generateAiSuggestion } = useAppContext();
  const [formData, setFormData] = useState({ title: '', type: 'text', content: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Buffer: pending materials waiting for routing
  const [pendingBuffer, setPendingBuffer] = useState([]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, title: file.name, type: file.type.includes('pdf') ? 'pdf' : 'image' }));
    toast.success('File staged', { icon: '📄', style: { background: '#333', color: '#fff' }});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title && !formData.content) return toast.error('Title or content required');
    
    setIsProcessing(true);
    const loadingToast = toast.loading('Studynex AI classifying...', { style: { background: '#333', color: '#fff' }});

    setTimeout(() => {
      const suggestion = generateAiSuggestion(formData.title, formData.content);
      const newMaterial = addMaterial({ ...formData, status: 'pending' });
      
      setPendingBuffer(prev => [...prev, {
        material: newMaterial,
        suggestion,
        overrideSubjectId: suggestion.subjectId,
        overrideUnitNumber: suggestion.unitNumber,
        showOverride: false,
      }]);

      setIsProcessing(false);
      toast.dismiss(loadingToast);
      toast.success(`AI Classified: ${suggestion.subjectName} — Unit ${suggestion.unitNumber} (${suggestion.confidence}% confidence)`,
        { icon: '🧠', duration: 4000, style: { background: '#222', color: '#4edea3', border: '1px solid #4edea3' }}
      );
      setFormData({ title: '', type: 'text', content: '' });
    }, 1800);
  };

  const handleRoute = (bufferId, materialId) => {
    const entry = pendingBuffer.find(b => b.material.id === bufferId);
    if (!entry) return;
    routeMaterialToUnit(materialId, entry.overrideSubjectId, entry.overrideUnitNumber);
    setPendingBuffer(prev => prev.filter(b => b.material.id !== bufferId));
  };

  const handleDiscard = (bufferId) => {
    deleteMaterial(bufferId);
    setPendingBuffer(prev => prev.filter(b => b.material.id !== bufferId));
  };

  const updateOverride = (bufferId, field, value) => {
    setPendingBuffer(prev => prev.map(b =>
      b.material.id === bufferId ? { ...b, [field]: value } : b
    ));
  };

  const routed = materials.filter(m => m.status === 'active' && m.unitNumber);
  const containerLoader = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemLoader = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' } } };

  return (
    <main className="p-6 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8">

        {/* Header */}
        <motion.div variants={itemLoader} className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-3xl font-black uppercase tracking-widest flex items-center mb-1">
              <span className="material-symbols-outlined mr-4 text-indigo-500 text-4xl">inventory_2</span>
              Smart Intake Hub
            </h2>
            <p className="text-on-surface-variant text-sm font-medium pl-14">
              Drop raw knowledge. AI classifies it and routes it to the correct Subject → Unit.
            </p>
          </div>
          {pendingBuffer.length > 0 && (
            <div className="bg-secondary/10 border border-secondary/30 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-xs font-black text-secondary uppercase tracking-widest">{pendingBuffer.length} Pending</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Upload Form ─────────────────────────────── */}
          <motion.div variants={itemLoader} className="lg:col-span-5">
            <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 shadow-2xl relative overflow-hidden">
              <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6 border-b border-outline-variant/10 pb-4">
                Ingest Material
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Drag zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center text-center transition-all cursor-pointer ${
                    isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-outline-variant/40 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-4xl mb-2 ${isDragging ? 'text-primary animate-bounce' : 'text-on-surface-variant'}`}>
                    {isDragging ? 'file_download' : 'cloud_upload'}
                  </span>
                  <p className="text-sm font-bold text-white mb-1">Drag & Drop files here</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">PDF · Images · Links · Text</p>
                </div>

                {/* Type selector */}
                <div>
                  <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['text', 'image', 'pdf', 'youtube', 'link', 'gdrive'].map(type => (
                      <button
                        key={type} type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`py-1.5 px-3 text-xs font-bold uppercase rounded-lg border transition-all ${
                          formData.type === type ? 'bg-primary/20 border-primary text-primary' : 'border-outline-variant/20 text-on-surface-variant hover:border-outline-variant bg-surface-container-low'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Title</label>
                  <input
                    type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Dijkstra's algorithm notes"
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary text-sm px-4 py-3 rounded-xl outline-none transition-all"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Content or URL</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Paste URL or raw text notes…"
                    rows={3}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary text-sm px-4 py-3 rounded-xl resize-none outline-none transition-all"
                    disabled={isProcessing}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || (!formData.title && !formData.content)}
                  className="w-full bg-primary flex items-center justify-center gap-3 text-white font-black px-6 py-4 rounded-xl disabled:opacity-50 hover:bg-indigo-400 transition-all hover:shadow-[0_0_30px_rgba(195,192,255,0.4)] active:scale-95 uppercase tracking-widest text-sm"
                >
                  {isProcessing ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> AI Classifying...</>
                  ) : (
                    <><span className="material-symbols-outlined">auto_awesome</span> Parse & Classify</>
                  )}
                </button>
              </form>

              <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            </div>
          </motion.div>

          {/* ── Right: Pending Buffer + Routed History ────────── */}
          <motion.div variants={itemLoader} className="lg:col-span-7 space-y-6">

            {/* Pending Routing Buffer */}
            {pendingBuffer.length > 0 && (
              <div className="bg-surface-container-high p-6 rounded-3xl border border-secondary/20 shadow-2xl">
                <h3 className="font-headline text-base font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">pending_actions</span>
                  Awaiting Routing ({pendingBuffer.length})
                </h3>

                <div className="space-y-4">
                  <AnimatePresence>
                    {pendingBuffer.map(entry => {
                      const typeInfo = TYPE_ICONS[entry.material.type] || TYPE_ICONS.text;
                      const sub = subjects.find(s => s.id === entry.overrideSubjectId);
                      const maxUnits = sub?.totalUnits || 1;

                      return (
                        <motion.div
                          key={entry.material.id}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, x: -30 }}
                          layout
                          className="bg-surface-container rounded-2xl border border-secondary/20 p-5 space-y-4"
                        >
                          {/* Material identity */}
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${typeInfo.cls}`}>
                              <span className="material-symbols-outlined text-lg">{typeInfo.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{entry.material.title}</p>
                              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20 inline-block mt-1">
                                ⚡ Pending Routing
                              </span>
                            </div>
                          </div>

                          {/* AI Suggestion */}
                          <div className="bg-[#0b1326]/60 rounded-xl p-4 border border-primary/20">
                            <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">neurology</span>
                              AI Suggestion — {entry.suggestion.confidence}% Confidence
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Subject Override */}
                              <div>
                                <label className="text-[0.55rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Subject</label>
                                <select
                                  value={entry.overrideSubjectId}
                                  onChange={e => updateOverride(entry.material.id, 'overrideSubjectId', parseInt(e.target.value))}
                                  className="w-full bg-[#0b1326] border border-outline-variant/30 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-primary transition-all"
                                >
                                  {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                              {/* Unit Override */}
                              <div>
                                <label className="text-[0.55rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Unit</label>
                                <select
                                  value={entry.overrideUnitNumber}
                                  onChange={e => updateOverride(entry.material.id, 'overrideUnitNumber', parseInt(e.target.value))}
                                  className="w-full bg-[#0b1326] border border-outline-variant/30 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-primary transition-all"
                                >
                                  {Array.from({ length: maxUnits }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Unit {i + 1}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleRoute(entry.material.id, entry.material.id)}
                              className="flex-1 py-2.5 bg-secondary/20 hover:bg-secondary/40 border border-secondary/40 text-secondary rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">send</span>
                              Route to Unit
                            </button>
                            <button
                              onClick={() => handleDiscard(entry.material.id)}
                              className="px-4 py-2.5 bg-error/10 hover:bg-error/30 border border-error/20 text-error rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Routed History */}
            <div className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 shadow-2xl">
              <h3 className="font-headline text-base font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">done_all</span>
                Routed Materials ({routed.length})
              </h3>

              {routed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                  <p className="font-bold text-sm">No routed materials yet</p>
                  <p className="text-xs mt-1">Upload and route to populate this feed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {routed.slice().reverse().slice(0, 8).map(mat => {
                      const typeInfo = TYPE_ICONS[mat.type] || TYPE_ICONS.text;
                      return (
                        <motion.div
                          key={mat.id}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30, scale: 0.95 }}
                          layout
                          className="bg-surface-container p-4 rounded-xl border border-outline-variant/10 flex items-center gap-4 group hover:border-outline-variant/30 hover:bg-surface-container-highest transition-all relative overflow-hidden"
                        >
                          <div className={`p-2.5 rounded-xl border shrink-0 ${typeInfo.cls}`}>
                            <span className="material-symbols-outlined text-lg">{typeInfo.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">{mat.title}</p>
                            <p className="text-[0.6rem] text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">
                              {mat.subject} <span className="mx-1">•</span> {mat.unit}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[0.6rem] font-black text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded-md hidden sm:block">
                              {mat.confidence}% Match
                            </span>
                            <button
                              onClick={() => { if (window.confirm(`Remove "${mat.title}"?`)) deleteMaterial(mat.id); }}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center text-error hover:bg-error/30 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
};

export default MaterialsInbox;
