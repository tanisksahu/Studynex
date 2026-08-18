import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { ai } from '../../services/aiService';
import toast from 'react-hot-toast';

// Helper to determine badge colors based on confidence
const getConfidenceColor = (score) => {
  if (!score) return 'bg-surface-variant text-on-surface-variant';
  if (score >= 90) return 'bg-[#4edea3]/20 text-[#4edea3]';
  if (score >= 70) return 'bg-amber-500/20 text-amber-600';
  return 'bg-error/20 text-error';
};

const SUGGESTIONS = [
  "Show my classes",
  "Plan tomorrow",
  "Analyze this document"
];

const GlobalCommandCenter = () => {
  const { commandCenterState, setCommandCenterState, subjects, exams = [], profile, executeAction } = useAppContext();
  const [input, setInput] = useState('');
  
  // Conversational memory
  const [history, setHistory] = useState([
    { role: 'ai', text: 'StudyNex Agent online. Drop a document, date sheet, or resume to begin.' }
  ]);
  
  // Pending Actions queue
  const [pendingActions, setPendingActions] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // File queue for drag/drop
  const [fileQueue, setFileQueue] = useState([]);
  const fileInputRef = useRef(null);

  // Keyboard shortcut Cmd+K to toggle panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandCenterState(prev => prev === 'minimized' ? 'panel' : 'minimized');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandCenterState]);

  // Handle Clipboard Paste
  useEffect(() => {
    const handlePaste = async (e) => {
      if (commandCenterState === 'minimized') return; // Only if active
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          if (file) {
            handleFiles([file]);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [commandCenterState]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input;
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Build context
      const context = { subjects, exams, profile, history: history.slice(-10) };
      const response = await ai.processCommand(userMessage, context);
      
      setHistory(prev => [...prev, { role: 'ai', text: response.message }]);
      
      if (response.proposedActions && response.proposedActions.length > 0) {
        setPendingActions(response.proposedActions);
      } else if (response.action && response.action.type) {
        setPendingActions([response.action]);
      }
    } catch (err) {
      toast.error('Agent Processing Failed');
      setHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error connecting to the intelligence engine.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processExtractionResult = (result, fileNames) => {
    if (!result.success) {
      setHistory(prev => [...prev, { role: 'ai', text: result.message || "I couldn't analyze the document." }]);
      return;
    }

    if (result.warnings && result.warnings.length > 0) {
      setHistory(prev => [...prev, {
        role: 'ai',
        text: `Note: ${result.warnings.join(' | ')}`
      }]);
    }

    setHistory(prev => [...prev, { 
      role: 'ai', 
      text: result.message || `I've analyzed ${fileNames.join(', ')} and prepared the following actions.` 
    }]);

    if (result.proposedActions && result.proposedActions.length > 0) {
      setPendingActions(result.proposedActions);
    }
  };

  const handleFiles = async (filesArray) => {
    if (!filesArray || filesArray.length === 0) return;
    
    const fileNames = filesArray.map(f => f.name);
    setHistory(prev => [...prev, { role: 'user', text: `[Uploaded: ${fileNames.join(', ')}]` }]);
    setIsProcessing(true);

    try {
      // Pass full context for deduplication logic inside the prompt
      const context = { subjects, exams, profile };
      
      // Upload multiple files using FormData
      const formData = new FormData();
      filesArray.forEach(file => formData.append('documents', file));
      formData.append('context', JSON.stringify(context));

      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cleanedBase = baseURL.replace(/\/+$/, '');
      const endpoint = `${cleanedBase}/api/ai/extract`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-user-id': localStorage.getItem('studynex-auth-id') || 'local-user-123'
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'I encountered an error trying to extract data.');
      }
      
      processExtractionResult(result, fileNames);
    } catch (err) {
      console.error(err);
      toast.error('Document Parsing Failed');
      setHistory(prev => [...prev, { role: 'ai', text: err.message || 'Sorry, I encountered an error parsing the document.' }]);
    } finally {
      setIsProcessing(false);
      setFileQueue([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  // Drag and drop handlers
  const onDragOver = (e) => {
    e.preventDefault();
    if (commandCenterState !== 'minimized') setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (commandCenterState === 'minimized') return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleConfirmAll = () => {
    if (!pendingActions || pendingActions.length === 0) return;
    
    let appliedCount = 0;
    pendingActions.forEach(action => {
      executeAction(action);
      appliedCount++;
    });

    setHistory(prev => [...prev, { role: 'ai', text: `Successfully executed ${appliedCount} action(s).` }]);
    setPendingActions([]);
  };

  // UI rendering for specific action payloads
  const renderActionDetails = (action, idx) => {
    if (action.type === 'CREATE_SUBJECTS' && action.payload.subjects) {
      return action.payload.subjects.map((sub, i) => (
        <div key={`sub-${i}`} className="p-3 bg-white border border-outline-variant shadow-sm rounded-xl mb-2">
          <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-sm text-on-surface">{sub.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getConfidenceColor(sub.confidence)}`}>
              {sub.confidence ? `${sub.confidence}%` : 'Auto'}
            </span>
          </div>
          <div className="flex gap-2 items-center text-xs text-on-surface-variant mt-1">
            <span className="bg-surface-variant/50 px-2 py-1 rounded">{sub.code || 'No Code'}</span>
            <span>•</span>
            <span className="bg-surface-variant/50 px-2 py-1 rounded">{sub.credits ? `${sub.credits} Credits` : 'No Credits'}</span>
          </div>
        </div>
      ));
    }

    if (action.type === 'CREATE_EXAMS' && action.payload.exams) {
      return action.payload.exams.map((exam, i) => (
        <div key={`exam-${i}`} className="p-3 bg-white border border-outline-variant shadow-sm rounded-xl mb-2 border-l-4 border-l-error">
          <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-sm text-on-surface">{exam.subjectName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getConfidenceColor(exam.confidence)}`}>
              {exam.confidence ? `${exam.confidence}%` : 'Auto'}
            </span>
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            <span className="font-mono bg-surface-variant/50 px-2 py-1 rounded mr-2">{exam.date}</span>
            <span className="font-mono bg-surface-variant/50 px-2 py-1 rounded">{exam.startTime || 'Time Unknown'}</span>
          </div>
        </div>
      ));
    }

    if (action.type === 'UPDATE_PROFILE' && action.payload.profile) {
      const p = action.payload.profile;
      return (
        <div className="p-3 bg-white border border-outline-variant shadow-sm rounded-xl mb-2 border-l-4 border-l-primary">
          <p className="text-xs text-on-surface-variant mb-2">Profile Merge Preview:</p>
          {p.degree && <div className="text-sm font-bold text-on-surface mb-1">{p.degree}</div>}
          {p.program && <div className="text-xs text-on-surface-variant mb-1">{p.program}</div>}
          {p.graduationYear && <div className="text-xs text-on-surface-variant mb-1">Class of {p.graduationYear}</div>}
          {p.skills && p.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {p.skills.slice(0, 5).map(s => (
                <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {p.skills.length > 5 && <span className="text-[10px] bg-surface-variant px-2 py-0.5 rounded-full">+{p.skills.length - 5} more</span>}
            </div>
          )}
        </div>
      );
    }

    if (action.type === 'CREATE_TASKS' && action.payload.tasks) {
      return action.payload.tasks.map((task, i) => (
        <div key={`task-${i}`} className="p-3 bg-white border border-outline-variant shadow-sm rounded-xl mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[18px]">radio_button_unchecked</span>
          <div>
            <div className="text-sm font-bold text-on-surface">{task.title}</div>
            <div className="text-xs text-on-surface-variant">{task.time}</div>
          </div>
        </div>
      ));
    }

    return (
      <div className="p-3 bg-white border border-outline-variant shadow-sm rounded-xl mb-2">
        <p className="text-sm text-on-surface">Action payload received.</p>
      </div>
    );
  };

  if (commandCenterState === 'hidden') return null;

  // Minimized Launcher
  if (commandCenterState === 'minimized') {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50 cursor-pointer group"
        onClick={() => setCommandCenterState('panel')}
      >
        <div className="bg-primary text-white rounded-full p-4 shadow-elevated flex items-center justify-center hover:scale-110 transition-transform relative">
          <span className="material-symbols-outlined text-[24px]">magic_button</span>
          {pendingActions.length > 0 && (
             <span className="absolute top-0 right-0 w-3 h-3 bg-error rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  // Panel / Fullscreen Mode
  const isFullScreen = commandCenterState === 'fullscreen';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed z-50 flex flex-col shadow-elevated overflow-hidden border border-outline-variant ${
          isFullScreen 
          ? 'top-4 left-4 right-4 bottom-4 rounded-3xl bg-surface' 
          : 'bottom-24 right-6 w-[450px] h-[650px] rounded-3xl bg-surface'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/95 z-[60] flex flex-col items-center justify-center text-white backdrop-blur-md"
            >
              <motion.span 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="material-symbols-outlined text-[64px] mb-4"
              >
                upload_file
              </motion.span>
              <h2 className="text-2xl font-bold">Drop to analyze</h2>
              <p className="opacity-80 mt-2 font-medium">PDF • DOCX • PNG • JPG</p>
              <p className="text-sm opacity-60 mt-4 text-center max-w-xs">Files will be automatically classified and converted into intelligent actions.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
               <span className="material-symbols-outlined text-[18px]">magic_button</span>
             </div>
             <div>
               <h3 className="text-sm font-bold text-on-surface">StudyNex Autonomous Agent</h3>
               <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Monitoring Global Context</p>
             </div>
          </div>
          <div className="flex gap-1">
             <button onClick={() => setCommandCenterState(isFullScreen ? 'panel' : 'fullscreen')} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors">
               <span className="material-symbols-outlined text-[18px]">{isFullScreen ? 'close_fullscreen' : 'fullscreen'}</span>
             </button>
             <button onClick={() => setCommandCenterState('minimized')} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors">
               <span className="material-symbols-outlined text-[18px]">close</span>
             </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-surface-variant/20">
          
          {/* Chat / Left Panel */}
          <div className={`flex flex-col h-full ${isFullScreen ? 'flex-1 border-r border-outline-variant' : 'w-full'}`}>
             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                {history.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 px-4 text-[13px] font-medium leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-primary text-white shadow-soft rounded-br-sm' 
                      : 'bg-white border border-outline-variant/50 text-on-surface rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-outline-variant/50 text-on-surface rounded-bl-sm shadow-sm rounded-2xl p-3 px-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary animate-spin text-[16px]">sync</span>
                       <span className="text-[12px] font-bold text-on-surface-variant">Agent thinking...</span>
                    </div>
                  </div>
                )}
             </div>

             {/* Input Area */}
             <div className="p-3 bg-white border-t border-outline-variant shrink-0">
               {/* Suggestions */}
               <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-2">
                 {SUGGESTIONS.map(sug => (
                   <button 
                     key={sug} 
                     onClick={() => handleSend(null, sug)}
                     disabled={isProcessing}
                     className="whitespace-nowrap px-3 py-1.5 bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant rounded-full text-xs font-medium transition-colors border border-outline-variant/50 disabled:opacity-50"
                   >
                     {sug}
                   </button>
                 ))}
               </div>
               
               <form onSubmit={handleSend} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-surface-variant/30 border border-outline-variant/50 rounded-xl p-1 pr-2 focus-within:border-primary/50 transition-colors">
                    <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*,.pdf,.docx,.doc" onChange={(e) => handleFiles(Array.from(e.target.files))} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-white rounded-lg group relative">
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isProcessing}
                      placeholder="Type a command or drop a file..." 
                      className="flex-1 bg-transparent border-none text-on-surface text-sm font-medium outline-none disabled:opacity-50 min-w-0"
                    />
                    <button type="submit" disabled={isProcessing} className="p-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </div>
               </form>
             </div>
          </div>

          {/* Action Preview Panel - Overlay or Side Panel */}
          {pendingActions.length > 0 && (
             <div className={`${isFullScreen ? 'w-[400px]' : 'absolute inset-0 bg-surface/95 backdrop-blur-sm z-20 flex flex-col'} border-l border-outline-variant`}>
                <div className="p-4 border-b border-outline-variant bg-white flex justify-between items-center shrink-0">
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">bolt</span> Actions Prepared
                    </h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">StudyNex Agent proposes {pendingActions.length} actions</p>
                  </div>
                  <button onClick={() => setPendingActions([])} className="text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface-variant/10">
                   {pendingActions.map((action, idx) => (
                      <div key={idx} className="mb-6">
                        <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                          {action.type ? action.type.replace(/_/g, ' ') : 'ACTION'}
                        </h5>
                        {renderActionDetails(action, idx)}
                      </div>
                   ))}
                </div>

                <div className="p-4 bg-white border-t border-outline-variant flex gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                   <button onClick={() => setPendingActions([])} className="flex-1 py-2.5 bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant font-bold text-xs uppercase tracking-wider rounded-xl transition-colors">
                     Cancel
                   </button>
                   <button onClick={handleConfirmAll} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-soft">
                     Approve Action
                   </button>
                </div>
             </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalCommandCenter;
