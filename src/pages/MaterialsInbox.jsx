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
    toast.success('File staged');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title && !formData.content) return toast.error('Title or content required');
    
    setIsProcessing(true);
    const loadingToast = toast.loading('Studynex AI classifying...');

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
        { icon: '🧠', duration: 4000 }
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
    <main className="p-4 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div variants={itemLoader} className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-outline-variant pb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                 <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
              Smart Intake Hub
            </h1>
            <p className="text-on-surface-variant font-medium text-sm lg:text-base pl-14">
              Drop raw knowledge. AI classifies it and routes it to the correct Subject & Unit.
            </p>
          </div>
          {pendingBuffer.length > 0 && (
            <div className="bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-lg flex items-center gap-2 self-start sm:self-auto shadow-soft">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">{pendingBuffer.length} Pending</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Upload Form ─────────────────────────────── */}
          <motion.div variants={itemLoader} className="lg:col-span-5">
            <div className="sn-card p-6 lg:p-8 border-t-4 border-t-primary shadow-elevated">
              <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[20px] text-primary">add_circle</span>
                 Ingest Material
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Drag zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-variant/30'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-surface-variant border border-outline-variant text-on-surface-variant'}`}>
                     <span className="material-symbols-outlined text-[28px]">
                       {isDragging ? 'file_download' : 'cloud_upload'}
                     </span>
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-1">Drag & Drop files here</p>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">PDF, Images, Links, Text</p>
                </div>

                {/* Type selector */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['text', 'image', 'pdf', 'youtube', 'link', 'gdrive'].map(type => (
                      <button
                        key={type} type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`py-2 px-4 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          formData.type === type ? 'bg-primary border-primary text-white shadow-soft' : 'border-outline-variant text-on-surface-variant hover:border-outline hover:bg-surface-variant bg-surface'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Title</label>
                  <input
                    type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Dijkstra's algorithm notes"
                    className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-soft"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Content or URL</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Paste URL or raw text notes…"
                    rows={4}
                    className="w-full bg-surface border border-outline-variant text-on-surface text-sm font-medium px-4 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary resize-none outline-none transition-all custom-scrollbar shadow-inner-soft"
                    disabled={isProcessing}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing || (!formData.title && !formData.content)}
                    className="w-full bg-primary flex items-center justify-center gap-2 text-white font-bold px-6 py-3.5 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-all shadow-soft tracking-wide text-sm"
                  >
                    {isProcessing ? (
                      <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> AI Classifying...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[20px]">auto_awesome</span> Parse & Classify</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ── Right: Pending Buffer + Routed History ────────── */}
          <motion.div variants={itemLoader} className="lg:col-span-7 space-y-6">

            {/* Pending Routing Buffer */}
            {pendingBuffer.length > 0 && (
              <div className="sn-card p-6 border-l-4 border-l-secondary bg-secondary/5">
                <h3 className="text-base font-bold tracking-wide mb-4 flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-[20px] text-secondary">pending_actions</span>
                  Awaiting Routing <span className="text-on-surface-variant font-normal">({pendingBuffer.length})</span>
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
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, x: -20 }}
                          layout
                          className="bg-white rounded-xl border border-outline-variant p-5 space-y-5 shadow-soft"
                        >
                          {/* Material identity */}
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg border shrink-0 ${typeInfo.cls}`}>
                              <span className="material-symbols-outlined text-[24px]">{typeInfo.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="font-bold text-base text-on-surface truncate">{entry.material.title}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded inline-block mt-1.5">
                                ⚡ Pending Routing
                              </span>
                            </div>
                          </div>

                          {/* AI Suggestion */}
                          <div className="bg-surface-variant/30 rounded-lg p-4 border border-outline-variant/50">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">neurology</span>
                              AI Suggestion — {entry.suggestion.confidence}% Confidence
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Subject Override */}
                              <div>
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Subject</label>
                                <select
                                  value={entry.overrideSubjectId}
                                  onChange={e => updateOverride(entry.material.id, 'overrideSubjectId', parseInt(e.target.value))}
                                  className="w-full bg-white border border-outline-variant text-on-surface font-semibold text-sm px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner-soft"
                                >
                                  {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                              {/* Unit Override */}
                              <div>
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Unit</label>
                                <select
                                  value={entry.overrideUnitNumber}
                                  onChange={e => updateOverride(entry.material.id, 'overrideUnitNumber', parseInt(e.target.value))}
                                  className="w-full bg-white border border-outline-variant text-on-surface font-semibold text-sm px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner-soft"
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
                              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-soft"
                            >
                              <span className="material-symbols-outlined text-[18px]">send</span>
                              Route to Unit
                            </button>
                            <button
                              onClick={() => handleDiscard(entry.material.id)}
                              className="px-4 py-2.5 bg-white border border-outline-variant hover:border-error hover:text-error hover:bg-error/5 text-on-surface-variant rounded-lg text-sm font-bold transition-colors flex items-center justify-center shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
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
            <div className="sn-card p-6">
              <h3 className="text-base font-bold tracking-wide mb-4 flex items-center gap-2 text-on-surface border-b border-outline-variant pb-4">
                <span className="material-symbols-outlined text-[20px] text-primary">done_all</span>
                Routed Materials <span className="text-on-surface-variant font-normal">({routed.length})</span>
              </h3>

              {routed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl bg-surface-variant/30">
                  <span className="material-symbols-outlined text-[40px] mb-3 opacity-40">inbox</span>
                  <p className="font-bold text-sm text-on-surface">No routed materials yet</p>
                  <p className="text-xs font-medium mt-1">Upload and route to populate this feed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {routed.slice().reverse().slice(0, 8).map(mat => {
                      const typeInfo = TYPE_ICONS[mat.type] || TYPE_ICONS.text;
                      return (
                        <motion.div
                          key={mat.id}
                          initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, scale: 0.98 }}
                          layout
                          className="sn-card-interactive p-4 flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2 rounded-lg border shrink-0 ${typeInfo.cls}`}>
                              <span className="material-symbols-outlined text-[18px]">{typeInfo.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">{mat.title}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mt-0.5">
                                {mat.subject} <span className="mx-1 font-normal opacity-50">•</span> Unit {mat.unit}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded hidden sm:block">
                              {mat.confidence}% Match
                            </span>
                            <button
                              onClick={() => { if (window.confirm(`Remove "${mat.title}"?`)) deleteMaterial(mat.id); }}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-white border border-outline-variant hover:border-error hover:text-error hover:bg-error/10 flex items-center justify-center text-on-surface-variant transition-all shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
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
