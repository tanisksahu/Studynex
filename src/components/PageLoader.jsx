import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full relative z-0">
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse', ease: 'easeInOut' }}
         className="relative flex items-center justify-center"
       >
         <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
         <span className="material-symbols-outlined text-6xl text-primary animate-[spin_4s_linear_infinite] drop-shadow-[0_0_15px_rgba(195,192,255,0.6)] relative z-10">
           autorenew
         </span>
       </motion.div>
       <motion.p 
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
         className="mt-6 font-headline font-bold uppercase tracking-widest text-primary text-sm relative z-10 bg-[#0b1326]/50 px-4 py-1 rounded backdrop-blur-md"
       >
         Synthesizing Neural Interface...
       </motion.p>
    </div>
  );
};

export default PageLoader;
