import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { synthesizeAcademicMemory } from '../../utils/academicMemory';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AcademicHistoryModal = ({ isOpen, onClose }) => {
  const { subjects, units, masteryData, exams, addSubject } = useAppContext();
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  const memory = synthesizeAcademicMemory({ subjects, units, masteryData, exams });
  const activeSemester = memory.semesters.find(s => s.semesterId === selectedSemesterId) || memory.semesters[0];

  const handleCarryForward = (subject) => {
    // Propose / carry forward subject into current semester
    const newSubject = {
      id: Date.now(),
      name: `${subject.name} (Advanced)`,
      code: subject.code,
      difficulty: subject.difficulty,
      totalUnits: Math.max(4, subject.incompleteUnits || 4),
      progress: 0,
      semesterId: 'fall-2026',
      isHistorical: false
    };
    if (addSubject) {
      addSubject(newSubject);
      toast.success(`Carried forward "${subject.name}" to Fall 2026!`);
    } else {
      toast.success(`Reinforcement goal logged for "${subject.name}"`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl border border-outline-variant shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-on-surface"
        >
          {/* Header */}
          <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">history_edu</span>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Academic History & Memory</h2>
                <p className="text-xs text-on-surface-variant font-medium">
                  Preserved past semesters, retention patterns, and AI reinforcement context
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!memory.hasHistory ? (
              <div className="py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-2 text-primary/40">school</span>
                <p className="font-semibold text-base">No previous semesters archived yet</p>
                <p className="text-xs mt-1">
                  When a semester ends, completed exams and records are archived here for AI intelligence.
                </p>
              </div>
            ) : (
              <>
                {/* Semester Selector Tabs */}
                <div className="flex gap-2 border-b border-outline-variant pb-3">
                  {memory.semesters.map(sem => {
                    const isSelected = (activeSemester?.semesterId === sem.semesterId);
                    return (
                      <button
                        key={sem.semesterId}
                        onClick={() => setSelectedSemesterId(sem.semesterId)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary text-white shadow-soft'
                            : 'bg-surface-variant/40 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">bookmark</span>
                        {sem.name} ({sem.academicYear})
                      </button>
                    );
                  })}
                </div>

                {activeSemester && (
                  <div className="space-y-6">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl border border-outline-variant bg-surface">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Subjects</span>
                        <div className="text-2xl font-bold mt-1 text-on-surface">{activeSemester.subjectCount}</div>
                        <span className="text-[10px] text-primary font-semibold">Archived record</span>
                      </div>
                      <div className="p-4 rounded-xl border border-outline-variant bg-surface">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Avg Mastery</span>
                        <div className="text-2xl font-bold mt-1 text-primary">{activeSemester.averageMastery}%</div>
                        <span className="text-[10px] text-on-surface-variant font-medium">Retention score</span>
                      </div>
                      <div className="p-4 rounded-xl border border-outline-variant bg-surface">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Study Time</span>
                        <div className="text-2xl font-bold mt-1 text-secondary">{activeSemester.studyTimeHours}h</div>
                        <span className="text-[10px] text-on-surface-variant font-medium">Logged hours</span>
                      </div>
                      <div className="p-4 rounded-xl border border-outline-variant bg-surface">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Units Completed</span>
                        <div className="text-2xl font-bold mt-1 text-on-surface">{activeSemester.completedUnitsCount} / {activeSemester.totalUnitsCount}</div>
                        <span className="text-[10px] text-on-surface-variant font-medium">Curriculum pace</span>
                      </div>
                    </div>

                    {/* AI Memory Intelligence Insights */}
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                        AI Academic Memory Insights
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-primary/10 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-primary tracking-wider">🌟 Strongest Subject</span>
                          <p className="font-bold text-sm text-on-surface mt-1">
                            {activeSemester.strongestSubject?.name || 'N/A'} ({activeSemester.strongestSubject?.code || ''})
                          </p>
                          <p className="text-on-surface-variant mt-0.5">
                            {activeSemester.strongestSubject?.retention}% retention achieved. High baseline for advanced study.
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-error/20 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-error tracking-wider">⚠️ Needs Reinforcement</span>
                          <p className="font-bold text-sm text-on-surface mt-1">
                            {activeSemester.weakestSubject?.name || 'None'} ({activeSemester.weakestSubject?.code || ''})
                          </p>
                          <p className="text-on-surface-variant mt-0.5">
                            Lower retention recorded. AI will proactively weave reinforcement sessions into your Fall 2026 planner.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subject List Breakdown */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">view_list</span>
                        Semester Coursework Archive
                      </h3>
                      <div className="divide-y divide-outline-variant/60 border border-outline-variant rounded-xl overflow-hidden bg-white">
                        {activeSemester.subjects.map(sub => (
                          <div key={sub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-variant/10 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-on-surface">{sub.name}</span>
                                <span className="text-[10px] font-semibold bg-surface-variant px-1.5 py-0.5 rounded text-on-surface-variant">
                                  {sub.code}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                  sub.difficulty === 'Hard' ? 'bg-error/5 border-error/20 text-error' : 'bg-primary/5 border-primary/20 text-primary'
                                }`}>
                                  {sub.difficulty}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-1">
                                Units completed: {sub.completedUnits}/{sub.totalUnits} · Logged study: {Math.round(sub.timeSpentMinutes / 60)}h
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-xs font-bold text-on-surface">{sub.retention}% Mastery</span>
                                <div className="w-24 bg-surface-variant h-1.5 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full ${sub.retention < 70 ? 'bg-error' : 'bg-primary'}`}
                                    style={{ width: `${sub.retention}%` }}
                                  />
                                </div>
                              </div>

                              {sub.needsReinforcement && (
                                <button
                                  onClick={() => handleCarryForward(sub)}
                                  className="text-[11px] font-bold bg-primary/10 hover:bg-primary text-primary hover:text-white px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0"
                                  title="Add revision sessions for this topic into current semester"
                                >
                                  <span className="material-symbols-outlined text-[14px]">redo</span>
                                  Reinforce in Fall 2026
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-variant/10 text-xs">
            <span className="text-on-surface-variant">
              Historical memory is permanently isolated from active deadlines and upcoming exams.
            </span>
            <button
              onClick={onClose}
              className="bg-on-surface text-white px-4 py-2 rounded-xl font-bold hover:bg-on-surface/90 transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AcademicHistoryModal;
