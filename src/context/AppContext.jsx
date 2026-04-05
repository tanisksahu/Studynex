import React, { createContext, useContext, useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Global Layout State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Settings & Gamification
  const [settings, setSettings] = useLocalStorage('studynex-settings', {
    theme: 'dark', dataPersistence: true, aiInjection: true, notifications: true, reminders: true,
  });

  const [profile, setProfile] = useLocalStorage('studynex-profile', {
    firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@university.edu', 
    institution: 'Stanford University', xp: 2500, level: 14, streak: 5, targetGpa: 3.9, studyTimeMinutes: 1450,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHhQQIMYFDS_9WZQPwkM1W3IxXwjZ6FMn25e9szSYVa4DBuxa7LnkGxehfegV1xGeuAp_CC1gIXJPBXQXju8fmSuOGCJvj3wI0GjOExXlBgcXFa20LRi3Z_rs4aX2ELaelZGPvbrmAmCfgPSl7Y-JocuhRruXbfv_gUQLya1JU-GX1XOhBhtfzc_gzxdj38UmhDttlndnK-82KCvnABJ7PYbXKpHXalZiH4dluCnqlLD5XNWPMxo6h5a5dzJK8pKICGPW6-6EmMH42'
  });

  const addXp = (amount) => {
    setProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = Math.floor(newXp / 200) + 1;
      if (newLevel > prev.level) toast.success(`Leveled Up to ${newLevel}! 🎉`, { style: { background: '#333', color: '#fff' } });
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  // NOTIFICATION SYSTEM
  const [notifications, setNotifications] = useLocalStorage('studynex-notifications', [
    { id: 1, type: 'alert', message: 'Exam for Data Structures in 30 Days', timestamp: new Date().toISOString(), read: false },
    { id: 2, type: 'ai', message: 'AI Plan Available: Finish Microeconomics Unit 3', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false }
  ]);

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

  // CLEAN RELATIONAL SCHEMA (Subjects -> Units)
  const [rawSubjects, setRawSubjects] = useLocalStorage('studynex-v4-subjects', [
    { id: 1, name: 'Data Structures', code: 'CS201', difficulty: 'Hard', examDate: '2026-05-15', totalUnits: 8 },
    { id: 2, name: 'Microeconomics', code: 'ECON101', difficulty: 'Medium', examDate: '2026-06-01', totalUnits: 10 },
    { id: 3, name: 'Systems Architecture', code: 'CS301', difficulty: 'Hard', examDate: '2026-05-20', totalUnits: 6 },
    { id: 4, name: 'Linear Algebra', code: 'MATH200', difficulty: 'Medium', examDate: '2026-05-12', totalUnits: 5 }
  ]);

  const [units, setUnits] = useLocalStorage('studynex-v4-units', [
    // Preload some completion states
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

  // Backward-Compatible Computed 'subjects' state
  const subjects = useMemo(() => {
    return rawSubjects.map(sub => {
      const subUnits = units.filter(u => u.subjectId === sub.id);
      const completed = subUnits.filter(u => u.completed).length;
      const progress = sub.totalUnits > 0 ? Math.round((completed / sub.totalUnits) * 100) : 0;
      const mastery = masteryData.find(m => m.subjectId === sub.id) || { retention: 0, timeSpent: 0, level: 'Unset' };
      
      return {
        ...sub,
        units: sub.totalUnits, 
        progress,
        retention: mastery.retention,
        timeSpent: mastery.timeSpent,
        masteryLevel: mastery.level,
        weak: progress < 50 || mastery.retention < 70,
      };
    }).sort((a,b) => new Date(a.examDate) - new Date(b.examDate));
  }, [rawSubjects, units, masteryData]);

  const updateMastery = (subjectId, minutes) => {
    setMasteryData(prev => prev.map(m => 
      m.subjectId === subjectId ? { ...m, timeSpent: m.timeSpent + minutes, retention: Math.min(100, m.retention + (minutes/60)) } : m
    ));
    addXp(minutes * 2);
  };

  const addSubject = (newSub) => {
    // Duplicate guard logic
    if (rawSubjects.find(s => s.code.toLowerCase() === newSub.code.toLowerCase() || s.name.toLowerCase() === newSub.name.toLowerCase())) {
       toast.error(`Course ${newSub.code} already exists!`, { style: { background: '#333', color: '#fff' }});
       return false;
    }
    const createdSubjectId = Date.now();
    setRawSubjects(prev => [...prev, { ...newSub, id: createdSubjectId }]);
    toast.success(`${newSub.code} successfully registered!`, { style: { background: '#222', color: '#fff' }});
    // Units actually don't NEED pre-generation in the units array until completed, but we can seed them
    return true;
  };

  const removeSubject = (subjectId) => {
    setRawSubjects(prev => prev.filter(s => s.id !== subjectId));
    setUnits(prev => prev.filter(u => u.subjectId !== subjectId));
    setMasteryData(prev => prev.filter(m => m.subjectId !== subjectId));
    toast.success('Subject removed from the system.', { icon: '🗑️', style: { background: '#222', color: '#fff' } });
  };

  const toggleUnitCompletion = (subjectId, unitNumber) => {
    setUnits(prev => {
      const existing = prev.find(u => u.subjectId === subjectId && u.unitNumber === unitNumber);
      if (existing) {
        return prev.map(u => u === existing ? { ...u, completed: !u.completed } : u);
      }
      return [...prev, { subjectId, unitNumber, completed: true }];
    });
    addXp(50);
  };

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

  const addMaterial = (newMaterial) => {
    const material = {
      ...newMaterial,
      id: Date.now(),
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

  // Add material directly to a subject unit (bypasses inbox)
  const addMaterialToUnit = (subjectId, unitNumber, materialData) => {
    const sub = rawSubjects.find(s => s.id === subjectId);
    const newMat = {
      ...materialData,
      id: Date.now(),
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

  // Update a unit's display name
  const updateUnitName = (subjectId, unitNumber, name) => {
    setUnits(prev => {
      const existing = prev.find(u => u.subjectId === subjectId && u.unitNumber === unitNumber);
      if (existing) {
        return prev.map(u => u.subjectId === subjectId && u.unitNumber === unitNumber ? { ...u, name } : u);
      }
      return [...prev, { subjectId, unitNumber, completed: false, name }];
    });
  };

  // Route a pending inbox material to a specific subject + unit
  const routeMaterialToUnit = (materialId, subjectId, unitNumber) => {
    const sub = rawSubjects.find(s => s.id === subjectId);
    setMaterials(prev => prev.map(m =>
      m.id === materialId
        ? { ...m, subjectId, unitNumber, subject: sub?.name || m.subject, unit: `Unit ${unitNumber}`, status: 'active' }
        : m
    ));
    toast.success(`Routed to ${sub?.name} — Unit ${unitNumber}`, { icon: '✅', style: { background: '#222', color: '#4edea3', border: '1px solid #4edea3' } });
  };

  // Mock AI classifier — suggests subject + unit based on title keywords
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

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`Settings dynamically updated`, { style: { background: '#222', color: '#fff' }});
  };

  // Structured AI Action Engine (Intent Matcher)
  const dispatchAiAction = (input) => {
    return new Promise((resolve) => {
      const lowerInput = input.toLowerCase();
      let response = {
        message: 'Command unverified. Try asking me to "mark [Subject] Unit [X] complete" or "plan my day".',
        proposedAction: null
      };
      
      // Intent 1: Mark Unit Complete
      const completeMatch = lowerInput.match(/(?:mark|complete|finish).+?(?:unit|chapter)\s*(\d+)/i);
      if (completeMatch) {
         const unitNum = parseInt(completeMatch[1]);
         const targetSub = subjects.find(s => lowerInput.includes(s.name.toLowerCase().split(' ')[0]));
         if (targetSub && unitNum <= targetSub.totalUnits) {
           response = {
             message: `Found goal: Mark Unit ${unitNum} of ${targetSub.name} as complete. Shall I execute the state update?`,
             proposedAction: {
               type: 'TOGGLE_UNIT',
               params: { subjectId: targetSub.id, unitNumber: unitNum }
             }
           };
         } else {
           response.message = `⚠️ Missing parameters. I extracted Unit ${unitNum}, but please specify the exact Subject name attached to it.`;
         }
      } 
      // Intent 2: Generate Study Plan
      else if (lowerInput.includes('plan') || lowerInput.includes('schedule')) {
         const incompleteSubs = subjects.filter(s => s.progress < 100);
         if (incompleteSubs.length > 0) {
           response = {
             message: `Analytical scan complete. The ${incompleteSubs[0].name} exam is approaching. Shall I inject an emergency review task into your planner?`,
             proposedAction: {
               type: 'ADD_TASK',
               params: { title: `AI Re-Review: ${incompleteSubs[0].name}`, subId: incompleteSubs[0].id }
             }
           };
         }
      }
      
      setTimeout(() => resolve(response), 1000);
    });
  };

  const executeAction = (action) => {
    if (action.type === 'TOGGLE_UNIT') {
      toggleUnitCompletion(action.params.subjectId, action.params.unitNumber);
      toast.success('Unit Identity Synchronized');
    } else if (action.type === 'ADD_TASK') {
      setTasks(prev => [...prev, { id: Date.now(), title: action.params.title, time: 'AI Queue', completed: false, priority: true }]);
      toast.success('Task Injected into Mission Protocol');
    }
  };

  return (
    <AppContext.Provider value={{ 
      isMobileMenuOpen, setIsMobileMenuOpen,
      notifications, markNotificationRead, markAllNotificationsRead, clearNotifications,
      subjects, rawSubjects, units, materials, tasks,
      addSubject, removeSubject, deleteMaterial,
      addMaterial, addMaterialToUnit, routeMaterialToUnit, updateUnitName, generateAiSuggestion,
      toggleTask, setTasks,
      toggleUnitCompletion,
      dispatchAiAction, executeAction,
      settings, updateSettings,
      profile, setProfile, addXp,
      activityData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
