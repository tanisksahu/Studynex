import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CommandPalette = () => {
  const { 
    isSearchOpen, setIsSearchOpen, 
    subjects, materials, exams, tasks, 
    setCommandCenterState 
  } = useAppContext();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Fuzzy Search Engine
  useEffect(() => {
    if (!query.trim()) {
      // Empty state - show recent
      setResults([
        { id: 'action-cmd', type: 'Action', title: 'Open Command Center', icon: 'magic_button', action: () => { setIsSearchOpen(false); setCommandCenterState('panel'); } },
        { id: 'action-task', type: 'Action', title: 'Create new task', icon: 'add_task', action: () => { setIsSearchOpen(false); navigate('/plan'); } },
        ...subjects.slice(0, 2).map(s => ({ ...s, type: 'Subject', title: s.name, icon: 'book', meta: `${s.progress}% complete`, action: () => { setIsSearchOpen(false); navigate('/subjects'); } })),
        ...exams.slice(0, 1).map(e => ({ ...e, type: 'Exam', title: e.subjectName + ' Exam', icon: 'event', meta: e.date, action: () => { setIsSearchOpen(false); navigate('/exams'); } }))
      ]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Semantic Routing triggers
    const isSemantic = /how|what|plan|schedule|when|why|exams this week|unfinished|to review/.test(lowerQuery);
    
    let localResults = [];
    
    // Subjects
    subjects.forEach(s => {
      if (s.name.toLowerCase().includes(lowerQuery) || (s.code && s.code.toLowerCase().includes(lowerQuery))) {
        localResults.push({ ...s, type: 'Subject', title: s.name, icon: 'book', meta: `${s.progress}% complete`, action: () => { setIsSearchOpen(false); navigate('/subjects'); } });
      }
    });

    // Materials
    materials.forEach(m => {
      if (m.title.toLowerCase().includes(lowerQuery) || (m.subject && m.subject.toLowerCase().includes(lowerQuery))) {
        localResults.push({ ...m, type: 'Material', title: m.title, icon: 'description', meta: m.subject, action: () => { setIsSearchOpen(false); navigate('/inbox'); } });
      }
    });

    // Exams
    exams.forEach(e => {
      if (e.subjectName.toLowerCase().includes(lowerQuery)) {
        localResults.push({ ...e, type: 'Exam', title: `${e.subjectName} Exam`, icon: 'event', meta: `${e.date} • ${e.startTime}`, action: () => { setIsSearchOpen(false); navigate('/exams'); } });
      }
    });

    // Tasks
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(lowerQuery)) {
        localResults.push({ ...t, type: 'Task', title: t.title, icon: 'task', meta: t.completed ? 'Completed' : 'Pending', action: () => { setIsSearchOpen(false); navigate('/plan'); } });
      }
    });

    if (isSemantic || localResults.length === 0) {
      localResults.push({
        id: 'ask-ai', type: 'Intelligence', title: `Ask StudyNex: "${query}"`, icon: 'magic_button', 
        action: () => { 
          setIsSearchOpen(false); 
          setCommandCenterState('panel'); 
          // Ideally we'd pass the query to the command center input, but opening it is a good start
        }
      });
    }

    setResults(localResults.slice(0, 8)); // Max 8 results
    setSelectedIndex(0);

  }, [query, subjects, materials, exams, tasks, setIsSearchOpen, navigate, setCommandCenterState]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSearchOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) results[selectedIndex].action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, results, selectedIndex, setIsSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-outline-variant relative z-10 overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px] mr-3">search</span>
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search StudyNex or ask a question..."
                className="flex-1 bg-transparent border-none outline-none text-on-surface text-base placeholder:text-on-surface-variant/50"
              />
              <kbd className="hidden lg:flex items-center gap-1 font-sans text-[10px] font-semibold text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded ml-2">ESC</kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {results.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl opacity-30 mb-2">search_off</span>
                  <p className="text-sm font-medium">No results found for "{query}"</p>
                  <p className="text-xs opacity-70 mt-1">Try asking StudyNex Intelligence</p>
                </div>
              ) : (
                results.map((res, idx) => (
                  <button
                    key={res.id || idx}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => res.action()}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${idx === selectedIndex ? 'bg-primary-container/50' : 'hover:bg-surface-variant/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idx === selectedIndex ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[18px]">{res.icon}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${idx === selectedIndex ? 'text-primary' : 'text-on-surface'}`}>{res.title}</p>
                        <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">{res.type}</p>
                      </div>
                    </div>
                    {res.meta && (
                      <span className="text-xs font-medium text-on-surface-variant bg-surface-variant/50 px-2 py-1 rounded-md">
                        {res.meta}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-2 bg-surface-variant/30 border-t border-outline-variant flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-white px-1 rounded shadow-sm">↑</kbd> <kbd className="bg-white px-1 rounded shadow-sm">↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white px-1.5 rounded shadow-sm">↵</kbd> to select</span>
              </div>
              <div>StudyNex Search</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
