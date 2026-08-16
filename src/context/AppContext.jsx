import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Global Layout State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [commandCenterState, setCommandCenterState] = useState('minimized');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  // Settings & Gamification (Deep Preferences Architecture)
  const defaultPreferences = {
    appearance: { theme: 'light', density: 'comfortable', colorMode: 'emerald' },
    layout: { sidebarCollapsed: false, sidebarPosition: 'left' },
    dashboard: { 
      widgets: [
        { id: 'hero', visible: true, order: 0 },
        { id: 'summary', visible: true, order: 1 },
        { id: 'progress', visible: true, order: 2 },
        { id: 'consistency', visible: true, order: 3 },
        { id: 'plan', visible: true, order: 4 },
        { id: 'deadlines', visible: true, order: 5 },
        { id: 'quick_actions', visible: true, order: 6 },
      ]
    },
    notifications: { push: true, email: false, reminders: true, agentFeedback: true },
    study: { dailyFocusHours: 2, defaultSessionLength: 25 },
    ai: { autoInjection: true, proactiveSuggestions: true },
    privacy: { dataCollection: false, publicProfile: false },
    accessibility: { reduceMotion: false, highContrast: false }
  };

  const [settings, setSettings] = useLocalStorage('studynex-settings-v2', defaultPreferences);

  const [profile, setProfile] = useLocalStorage('studynex-profile', {
    firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@university.edu', 
    institution: 'Stanford University', xp: 2500, level: 14, streak: 5, targetGpa: 3.9, studyTimeMinutes: 1450,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHhQQIMYFDS_9WZQPwkM1W3IxXwjZ6FMn25e9szSYVa4DBuxa7LnkGxehfegV1xGeuAp_CC1gIXJPBXQXju8fmSuOGCJvj3wI0GjOExXlBgcXFa20LRi3Z_rs4aX2ELaelZGPvbrmAmCfgPSl7Y-JocuhRruXbfv_gUQLya1JU-GX1XOhBhtfzc_gzxdj38UmhDttlndnK-82KCvnABJ7PYbXKpHXalZiH4dluCnqlLD5XNWPMxo6h5a5dzJK8pKICGPW6-6EmMH42',
    degree: '', program: '', graduationYear: null,
    skills: [], certifications: [], projects: [], experience: [], achievements: [],
    linkedin: '', github: '', portfolio: '', interests: []
  });

  // NOTIFICATION SYSTEM
  const [notifications, setNotifications] = useLocalStorage('studynex-notifications', [
    { id: 1, type: 'alert', message: 'Exam for Data Structures in 30 Days', timestamp: new Date().toISOString(), read: false },
    { id: 2, type: 'ai', message: 'AI Plan Available: Finish Microeconomics Unit 3', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false }
  ]);

  // CLEAN RELATIONAL SCHEMA (Subjects -> Units)
  const [rawSubjects, setRawSubjects] = useLocalStorage('studynex-v4-subjects', [
    { id: 1, name: 'Data Structures', code: 'CS201', difficulty: 'Hard', examDate: '2026-05-15', totalUnits: 8 },
    { id: 2, name: 'Microeconomics', code: 'ECON101', difficulty: 'Medium', examDate: '2026-06-01', totalUnits: 10 },
    { id: 3, name: 'Systems Architecture', code: 'CS301', difficulty: 'Hard', examDate: '2026-05-20', totalUnits: 6 },
    { id: 4, name: 'Linear Algebra', code: 'MATH200', difficulty: 'Medium', examDate: '2026-05-12', totalUnits: 5 }
  ]);

  const [units, setUnits] = useLocalStorage('studynex-v4-units', [
    { subjectId: 1, unitNumber: 1, completed: true },
    { subjectId: 1, unitNumber: 2, completed: true },
    { subjectId: 1, unitNumber: 3, completed: true },
    { subjectId: 2, unitNumber: 1, completed: true },
    { subjectId: 2, unitNumber: 2, completed: true },
    { subjectId: 2, unitNumber: 3, completed: true },
    { subjectId: 2, unitNumber: 4, completed: true },
    { subjectId: 2, unitNumber: 5, completed: true },
    { subjectId: 2, unitNumber: 6, completed: true },
    { subjectId: 2, unitNumber: 7, completed: true },
    { subjectId: 2, unitNumber: 8, completed: true }
  ]);

  const [masteryData, setMasteryData] = useLocalStorage('studynex-v5-mastery', [
    { subjectId: 1, retention: 82, timeSpent: 300, level: 'Advanced' },
    { subjectId: 2, retention: 95, timeSpent: 450, level: 'Expert' },
    { subjectId: 3, retention: 64, timeSpent: 120, level: 'Beginner' },
    { subjectId: 4, retention: 71, timeSpent: 180, level: 'Intermediate' }
  ]);

  const [tasks, setTasks] = useLocalStorage('studynex-tasks', [
    { id: 1, title: 'Review System Calls (Ch 4)', time: '09:00 AM', completed: true, isLive: false, priority: true },
    { id: 2, title: 'Mock Exam: Microeconomics', time: '11:30 AM', completed: false, isLive: true, priority: true },
  ]);

  const [materials, setMaterials] = useLocalStorage('studynex-materials', [
    { id: 101, title: 'Midterm Outline 2026', type: 'pdf', subject: 'Data Structures', unit: 'Unit 4', topic: 'Graphs', addedAt: new Date().toISOString(), confidence: 98 },
  ]);

  const [activityData] = useState([
    { day: 'Mon', hours: 4 }, { day: 'Tue', hours: 2.5 }, { day: 'Wed', hours: 5 }, { day: 'Thu', hours: 3 }, { day: 'Fri', hours: 6 }, { day: 'Sat', hours: 2 }, { day: 'Sun', hours: 4.5 }
  ]);

  const [exams, setExams] = useLocalStorage('studynex-exams', [
    { id: 201, subjectId: 1, subjectName: 'Data Structures', courseCode: 'CS201', date: '2026-05-15', startTime: '10:00', endTime: '13:00' },
    { id: 202, subjectId: 2, subjectName: 'Microeconomics', courseCode: 'ECON101', date: '2026-06-01', startTime: '14:00', endTime: '16:00' }
  ]);

  // Sync / Migration Logic
  useEffect(() => {
    const initApp = async () => {
      try {
        const migrationVersion = localStorage.getItem('studynexMigrationVersion');
        if (!migrationVersion) {
          setIsMigrating(true);
          toast.loading('Migrating data to Cloud...', { id: 'migration' });
          await api.migrate({
            profile, settings, notifications, subjects: rawSubjects, units, mastery: masteryData, tasks, materials, exams
          });
          localStorage.setItem('studynexMigrationVersion', '1.0');
          toast.success('Migration Complete!', { id: 'migration' });
          setIsMigrating(false);
        } else {
          // Fetch from DB
          const data = await api.getData();
          if (data) {
            if (data.profile) {
              setProfile(prev => ({
                ...prev,
                ...data.profile,
                // Ensure arrays are initialized if missing in DB
                skills: data.profile.skills || prev.skills || [],
                certifications: data.profile.certifications || prev.certifications || [],
                projects: data.profile.projects || prev.projects || [],
                experience: data.profile.experience || prev.experience || [],
                achievements: data.profile.achievements || prev.achievements || [],
                interests: data.profile.interests || prev.interests || []
              }));
            }
            if (data.settings) {
              setSettings(prev => ({
                ...defaultPreferences,
                ...data.settings,
                // Deep merge known nested objects to prevent missing keys if backend data is incomplete
                appearance: { ...defaultPreferences.appearance, ...(data.settings.appearance || {}) },
                layout: { ...defaultPreferences.layout, ...(data.settings.layout || {}) },
                dashboard: { ...defaultPreferences.dashboard, ...(data.settings.dashboard || {}) },
                notifications: { ...defaultPreferences.notifications, ...(data.settings.notifications || {}) },
                study: { ...defaultPreferences.study, ...(data.settings.study || {}) },
                ai: { ...defaultPreferences.ai, ...(data.settings.ai || {}) },
              }));
            }
            if (data.notifications) setNotifications(data.notifications);
            if (data.subjects) setRawSubjects(data.subjects);
            if (data.units) setUnits(data.units);
            if (data.mastery) setMasteryData(data.mastery);
            if (data.tasks) setTasks(data.tasks);
            if (data.materials) setMaterials(data.materials);
            if (data.exams) setExams(data.exams);
          }
        }
      } catch (err) {
        console.error('API Error (Offline mode active):', err);
        setIsMigrating(false);
      }
    };
    initApp();
  }, []);

  // Sync watchers
  useEffect(() => { if (!isMigrating) api.updateProfile(profile).catch(console.error); }, [profile, isMigrating]);
  useEffect(() => { if (!isMigrating) api.updateSettings(settings).catch(console.error); }, [settings, isMigrating]);
  useEffect(() => { if (!isMigrating) api.updateNotifications(notifications).catch(console.error); }, [notifications, isMigrating]);
  useEffect(() => { if (!isMigrating) api.updateMastery(masteryData).catch(console.error); }, [masteryData, isMigrating]);
  useEffect(() => { if (!isMigrating) api.updateTasks(tasks).catch(console.error); }, [tasks, isMigrating]);
  useEffect(() => { if (!isMigrating) api.updateMaterials(materials).catch(console.error); }, [materials, isMigrating]);

  const addXp = (amount) => {
    setProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = Math.floor(newXp / 200) + 1;
      if (newLevel > prev.level) toast.success(`Leveled Up to ${newLevel}! 🎉`, { style: { background: '#333', color: '#fff' } });
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications cleared');
  };
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Backward-Compatible Computed 'subjects' state with Priority Engine
  const subjects = useMemo(() => {
    return rawSubjects.map(sub => {
      const subUnits = units.filter(u => u.subjectId === sub.id);
      const completed = subUnits.filter(u => u.completed).length;
      const progress = sub.totalUnits > 0 ? Math.round((completed / sub.totalUnits) * 100) : 0;
      const mastery = masteryData.find(m => m.subjectId === sub.id) || { retention: 0, timeSpent: 0, level: 'Unset' };
      
      // Calculate Priority Score
      let priorityScore = 0;
      const now = new Date();
      const examDate = sub.examDate ? new Date(sub.examDate) : null;
      let daysUntilExam = 999;
      
      if (examDate) {
        const diffTime = examDate - now;
        daysUntilExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        // Closer exam = higher score (max 50 points if within 3 days)
        if (daysUntilExam <= 3) priorityScore += 50;
        else if (daysUntilExam <= 7) priorityScore += 30;
        else if (daysUntilExam <= 14) priorityScore += 15;
      }

      // Lower progress = higher priority (max 40 points)
      priorityScore += Math.max(0, 40 - (progress * 0.4));
      
      // Add weight for high difficulty (max 10 points)
      if (sub.difficulty === 'Hard') priorityScore += 10;
      else if (sub.difficulty === 'Medium') priorityScore += 5;

      let priorityLabel = 'LOW';
      if (priorityScore >= 70) priorityLabel = 'HIGH';
      else if (priorityScore >= 40) priorityLabel = 'MEDIUM';

      return {
        ...sub,
        units: sub.totalUnits, 
        progress,
        retention: mastery.retention,
        timeSpent: mastery.timeSpent,
        masteryLevel: mastery.level,
        weak: progress < 50 || mastery.retention < 70,
        priorityScore: Math.round(priorityScore),
        priorityLabel,
        daysUntilExam
      };
    }).sort((a,b) => new Date(a.examDate || '2099-01-01') - new Date(b.examDate || '2099-01-01'));
  }, [rawSubjects, units, masteryData]);

  const updateMastery = (subjectId, minutes) => {
    setMasteryData(prev => prev.map(m => 
      m.subjectId === subjectId ? { ...m, timeSpent: m.timeSpent + minutes, retention: Math.min(100, m.retention + (minutes/60)) } : m
    ));
    addXp(minutes * 2);
  };

  const addSubject = (newSub) => {
    if (rawSubjects.find(s => s.code?.toLowerCase() === newSub.code?.toLowerCase() || s.name?.toLowerCase() === newSub.name?.toLowerCase())) {
       toast.error(`Course ${newSub.code || newSub.name} already exists!`, { style: { background: '#333', color: '#fff' }});
       return false;
    }
    const createdSubjectId = Date.now() + Math.floor(Math.random() * 1000);
    const finalSub = { ...newSub, id: createdSubjectId };
    setRawSubjects(prev => [...prev, finalSub]);
    api.addSubject(finalSub).catch(console.error);
    toast.success(`${newSub.code || newSub.name} successfully registered!`, { style: { background: '#222', color: '#fff' }});
    return true;
  };

  const removeSubject = (subjectId) => {
    setRawSubjects(prev => prev.filter(s => s.id !== subjectId));
    setUnits(prev => prev.filter(u => u.subjectId !== subjectId));
    setMasteryData(prev => prev.filter(m => m.subjectId !== subjectId));
    api.deleteSubject(subjectId).catch(console.error);
    toast.success('Subject removed from the system.', { icon: '🗑️', style: { background: '#222', color: '#fff' } });
  };

  const toggleUnitCompletion = (subjectId, unitNumber) => {
    let newUnitState = null;
    setUnits(prev => {
      const existing = prev.find(u => u.subjectId === subjectId && u.unitNumber === unitNumber);
      if (existing) {
        newUnitState = { ...existing, completed: !existing.completed };
        return prev.map(u => u === existing ? newUnitState : u);
      }
      newUnitState = { subjectId, unitNumber, completed: true };
      return [...prev, newUnitState];
    });
    if (newUnitState) api.updateUnit(subjectId, unitNumber, newUnitState).catch(console.error);
    addXp(50);
  };

  const addMaterial = (newMaterial) => {
    const material = {
      ...newMaterial,
      id: Date.now() + Math.floor(Math.random() * 1000),
      addedAt: new Date().toISOString(),
      confidence: Math.floor(Math.random() * (99 - 80 + 1) + 80),
    };
    setMaterials((prevMaterials) => [...prevMaterials, material]);
    addXp(50);
    return material;
  };

  const deleteMaterial = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success('Material safely removed.', { style: { background: '#222', color: '#fff' }});
  };

  const addExam = (newExam) => {
    const exam = { ...newExam, id: Date.now() + Math.floor(Math.random() * 1000) };
    setExams(prev => [...prev, exam]);
    toast.success(`Exam for ${exam.subjectName} logged.`);
    api.addExam(exam).catch(console.error);
    return exam;
  };

  const removeExam = (examId) => {
    setExams(prev => prev.filter(e => e.id !== examId));
    api.deleteExam(examId).catch(console.error);
  };

  const addMaterialToUnit = (subjectId, unitNumber, materialData) => {
    const sub = rawSubjects.find(s => s.id === subjectId);
    const newMat = {
      ...materialData,
      id: Date.now() + Math.floor(Math.random() * 1000),
      subjectId,
      unitNumber,
      subject: sub?.name || 'Unknown',
      unit: `Unit ${unitNumber}`,
      createdAt: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 15 + 85),
      importance: null,
      summary: null,
      status: 'active',
    };
    setMaterials(prev => [...prev, newMat]);
    addXp(30);
    toast.success(`Added to Unit ${unitNumber}`, { icon: '📎', style: { background: '#222', color: '#fff' } });
    return newMat;
  };

  const updateUnitName = (subjectId, unitNumber, name) => {
    let newUnitState = null;
    setUnits(prev => {
      const existing = prev.find(u => u.subjectId === subjectId && u.unitNumber === unitNumber);
      if (existing) {
        newUnitState = { ...existing, name };
        return prev.map(u => u.subjectId === subjectId && u.unitNumber === unitNumber ? newUnitState : u);
      }
      newUnitState = { subjectId, unitNumber, completed: false, name };
      return [...prev, newUnitState];
    });
    if (newUnitState) api.updateUnit(subjectId, unitNumber, newUnitState).catch(console.error);
  };

  const routeMaterialToUnit = (materialId, subjectId, unitNumber) => {
    const sub = rawSubjects.find(s => s.id === subjectId);
    setMaterials(prev => prev.map(m =>
      m.id === materialId
        ? { ...m, subjectId, unitNumber, subject: sub?.name || m.subject, unit: `Unit ${unitNumber}`, status: 'active' }
        : m
    ));
    toast.success(`Routed to ${sub?.name} — Unit ${unitNumber}`, { icon: '✅', style: { background: '#222', color: '#4edea3', border: '1px solid #4edea3' } });
  };

  const generateAiSuggestion = (title = '', content = '') => {
    const text = (title + ' ' + content).toLowerCase();
    const subjectKeywords = [
      { keywords: ['tree', 'graph', 'sort', 'algorithm', 'stack', 'queue', 'linked'], subIdx: 0 },
      { keywords: ['supply', 'demand', 'elastic', 'market', 'gdp', 'price', 'economic'], subIdx: 1 },
      { keywords: ['cpu', 'memory', 'cache', 'pipeline', 'register', 'bus', 'arch'], subIdx: 2 },
      { keywords: ['matrix', 'vector', 'eigen', 'linear', 'determinant', 'algebra'], subIdx: 3 },
    ];
    let bestMatch = { subIdx: 0, score: 0 };
    subjectKeywords.forEach(({ keywords, subIdx }) => {
      const score = keywords.filter(k => text.includes(k)).length;
      if (score > bestMatch.score) bestMatch = { subIdx, score };
    });
    const suggestedSub = rawSubjects[bestMatch.subIdx] || rawSubjects[0];
    const suggestedUnit = bestMatch.score > 0 ? Math.min(2, (suggestedSub?.totalUnits || 1)) : 1;
    return {
      subjectId: suggestedSub?.id,
      subjectName: suggestedSub?.name || 'Unknown',
      unitNumber: suggestedUnit,
      confidence: bestMatch.score > 0 ? Math.floor(Math.random() * 10 + 80) : Math.floor(Math.random() * 20 + 55),
    };
  };

  const toggleTask = (taskId) => {
    setTasks(prev => {
      let newlyCompleted = false;
      const updated = prev.map(t => {
        if (t.id === taskId) { if (!t.completed) newlyCompleted = true; return { ...t, completed: !t.completed }; }
        return t;
      });
      if (newlyCompleted) { addXp(100); toast.success('Task Completed! +100 XP', { icon: '🔥', style: { background: '#333', color: '#fff' }}); }
      return updated;
    });
  };

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    toast.success(`Settings dynamically updated`, { style: { background: '#222', color: '#fff' }});
  };

  const dispatchAiAction = (input) => {
    // Kept for backward compatibility, though the AI agent typically bypasses this
    return new Promise((resolve) => {
      resolve({ message: 'Use the Command Center agent connection directly.', proposedAction: null });
    });
  };

  const executeAction = (action) => {
    if (!action) return;
    
    switch(action.type) {
      case 'CREATE_SUBJECTS':
        let subsAdded = 0;
        if (action.payload?.subjects) {
          action.payload.subjects.forEach(sub => { if (addSubject(sub)) subsAdded++; });
          toast.success(`${subsAdded} subjects enrolled.`);
        }
        break;
      case 'UPDATE_SUBJECT':
        if (action.payload?.subjectId && action.payload?.updates) {
          setRawSubjects(prev => prev.map(s => s.id === action.payload.subjectId ? { ...s, ...action.payload.updates } : s));
          toast.success(`Subject updated.`);
        }
        break;
      case 'CREATE_EXAMS':
        let examsAdded = 0;
        if (action.payload?.exams) {
          action.payload.exams.forEach(exam => { addExam(exam); examsAdded++; });
          toast.success(`${examsAdded} exams scheduled.`);
        }
        break;
      case 'CREATE_TASKS':
        let tasksAdded = 0;
        if (action.payload?.tasks) {
          action.payload.tasks.forEach(t => {
            setTasks(prev => [...prev, { id: Date.now() + Math.floor(Math.random() * 1000), title: t.title, time: t.time || 'AI Queue', completed: false, priority: t.priority || true }]);
            tasksAdded++;
          });
          toast.success(`${tasksAdded} tasks injected into planner.`);
        }
        break;
      case 'UPDATE_PROFILE':
        if (action.payload?.profile) {
          setProfile(prev => {
            const updates = action.payload.profile;
            // Arrays: Merge unique items
            const mergeArrays = (oldArr = [], newArr = []) => [...new Set([...oldArr, ...newArr])];
            
            return {
              ...prev,
              ...updates,
              // Specialized deep merges for arrays
              skills: mergeArrays(prev.skills, updates.skills),
              certifications: mergeArrays(prev.certifications, updates.certifications),
              interests: mergeArrays(prev.interests, updates.interests),
              // We could merge projects/experience by unique titles, but for simplicity we append or replace
              projects: updates.projects && updates.projects.length ? updates.projects : prev.projects,
              experience: updates.experience && updates.experience.length ? updates.experience : prev.experience,
              achievements: mergeArrays(prev.achievements, updates.achievements),
            };
          });
          toast.success(`Profile Intelligence Merged.`);
        }
        break;
      case 'TOGGLE_UNIT':
        toggleUnitCompletion(action.params.subjectId, action.params.unitNumber);
        toast.success('Unit Identity Synchronized');
        break;
      case 'ADD_TASK':
        setTasks(prev => [...prev, { id: Date.now(), title: action.params.title, time: 'AI Queue', completed: false, priority: true }]);
        toast.success('Task Injected into Mission Protocol');
        break;
      default:
        console.warn(`[CommandCenter] Unknown action type: ${action.type}`);
        break;
    }
  };

  return (
    <AppContext.Provider value={{ 
      isMobileMenuOpen, setIsMobileMenuOpen,
      isSearchOpen, setIsSearchOpen,
      isFocusModeOpen, setIsFocusModeOpen,
      notifications, markNotificationRead, markAllNotificationsRead, clearNotifications,
      subjects, rawSubjects, units, materials, tasks, exams,
      addSubject, removeSubject, deleteMaterial, addExam, removeExam,
      addMaterial, addMaterialToUnit, routeMaterialToUnit, updateUnitName, generateAiSuggestion,
      toggleTask, setTasks,
      toggleUnitCompletion,
      dispatchAiAction, executeAction,
      settings, updateSettings,
      profile, setProfile, addXp,
      activityData,
      commandCenterState, setCommandCenterState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
