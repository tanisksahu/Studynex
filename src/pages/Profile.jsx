import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { profile, setProfile, activityData } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const totalStudyTime = Math.floor(profile.studyTimeMinutes / 60);

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Profile updated successfully!', { icon: '👏', style: { borderRadius: '10px', background: '#333', color: '#fff' }});
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
        toast.success('Avatar updated!', { style: { background: '#222', color: '#fff' }});
      };
      reader.readAsDataURL(file);
    }
  };

  const containerLoader = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemLoader = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <main className="p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="space-y-8">
        
        {/* Banner Section */}
        <motion.div variants={itemLoader} className="flex justify-between items-center bg-gradient-to-r from-surface-container-high to-surface-container p-10 rounded-3xl border border-outline-variant/20 shadow-2xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10 w-full">
            <div 
              className="relative group/avatar cursor-pointer shrink-0" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleImageUpload} 
              />
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="w-32 h-32 rounded-2xl border-4 border-primary/30 shadow-[0_0_30px_rgba(195,192,255,0.2)] object-cover bg-surface-container-highest transition-transform duration-500 group-hover/avatar:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-sm">
                 <span className="material-symbols-outlined text-white font-black text-3xl">add_a_photo</span>
              </div>
            </div>
            
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <h2 className="font-headline text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">{profile.firstName} {profile.lastName}</h2>
                 <button onClick={() => setIsEditing(!isEditing)} className="mt-4 md:mt-0 text-[0.65rem] font-bold uppercase tracking-widest text-primary hover:text-indigo-300 transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20">
                   <span className="material-symbols-outlined text-[14px]">tune</span> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                 </button>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[0.65rem] font-bold uppercase tracking-widest rounded flex items-center shadow-lg shadow-primary/5">
                  <span className="material-symbols-outlined text-[12px] mr-1">military_tech</span> Level {profile.level} Scholar
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 text-[0.65rem] font-bold uppercase tracking-widest rounded flex items-center shadow-lg shadow-secondary/5">
                  <span className="material-symbols-outlined text-[12px] mr-1">workspace_premium</span> Pro Tier
                </span>
                <span className="px-3 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 text-[0.65rem] font-bold uppercase tracking-widest rounded flex items-center shadow-lg shadow-tertiary/5">
                  <span className="material-symbols-outlined text-[12px] mr-1">school</span> {profile.institution}
                </span>
              </div>

              {/* Progress Bar mapped to level */}
              <div className="mt-6">
                <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-widest text-[#c7c4d8] mb-2">
                  <span>{profile.xp} XP</span>
                  <span>Next: {profile.level * 200} XP</span>
                </div>
                <div className="w-full bg-[#0b1326]/50 h-2 rounded-full overflow-hidden border border-outline-variant/10">
                  <div className="bg-gradient-to-r from-primary to-indigo-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(195,192,255,0.8)]" style={{ width: `${(profile.xp % 200) / 2}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-[-5%] top-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-1000"></div>
        </motion.div>

        {/* CSS GRID Layout: 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main User Settings Form (8 Cols) */}
          <div className="lg:col-span-8">
             <motion.section variants={itemLoader} className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
               <h3 className="font-headline text-xl font-bold uppercase tracking-widest mb-8 flex items-center pb-4 border-b border-outline-variant/10">
                 <span className="material-symbols-outlined mr-3 text-indigo-400">badge</span> Identity Configuration
               </h3>
               
               <form onSubmit={handleSave} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">First Name</label>
                     <input type="text" disabled={!isEditing} defaultValue={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary disabled:opacity-50 text-sm text-white px-4 py-3 rounded-xl transition-all outline-none focus:ring-4 focus:ring-primary/10" />
                   </div>
                   <div>
                     <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Last Name</label>
                     <input type="text" disabled={!isEditing} defaultValue={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary disabled:opacity-50 text-sm text-white px-4 py-3 rounded-xl transition-all outline-none focus:ring-4 focus:ring-primary/10" />
                   </div>
                 </div>
                 <div>
                   <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Email Address</label>
                   <input type="email" disabled={!isEditing} defaultValue={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary disabled:opacity-50 text-sm text-white px-4 py-3 rounded-xl transition-all outline-none focus:ring-4 focus:ring-primary/10" />
                 </div>
                 <div>
                   <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Institution</label>
                   <input type="text" disabled={!isEditing} defaultValue={profile.institution} onChange={(e) => setProfile({...profile, institution: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary disabled:opacity-50 text-sm text-white px-4 py-3 rounded-xl transition-all outline-none focus:ring-4 focus:ring-primary/10" />
                 </div>
                 
                 {isEditing && (
                   <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} type="submit" className="w-full md:w-auto bg-primary hover:bg-indigo-400 text-white font-bold text-[0.75rem] uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(195,192,255,0.2)] hover:shadow-[0_0_30px_rgba(195,192,255,0.4)] transition-all transform hover:-translate-y-1 active:scale-95">
                     Save Global Changes
                   </motion.button>
                 )}
               </form>
             </motion.section>
          </div>

          {/* Right Sidebar Area (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Gamification Stats */}
            <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-xl">
               <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6 flex items-center">
                 <span className="material-symbols-outlined mr-3 text-secondary">emoji_events</span> Statistics
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center text-center group cursor-default hover:bg-surface-container-high transition-colors">
                   <span className="material-symbols-outlined text-primary text-3xl mb-2 group-hover:scale-110 transition-transform">schedule</span>
                   <span className="text-2xl font-black font-headline text-white">{totalStudyTime}h</span>
                   <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Focus Time</span>
                 </div>
                 
                 <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center text-center group cursor-default hover:bg-surface-container-high transition-colors">
                   <span className="material-symbols-outlined text-error text-3xl mb-2 group-hover:scale-110 transition-transform">local_fire_department</span>
                   <span className="text-2xl font-black font-headline text-white">{profile.streak}</span>
                   <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Max Streak</span>
                 </div>
               </div>
            </motion.div>

            {/* Achievements/Badges */}
            <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-xl">
               <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6 flex items-center">
                 <span className="material-symbols-outlined mr-3 text-tertiary">workspace_premium</span> Badges (4/12)
               </h3>
               
               <ul className="space-y-3">
                 <li className="flex items-center gap-4 bg-tertiary/10 p-3 rounded-xl border border-tertiary/20">
                   <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(202,193,255,0.4)]">
                     <span className="material-symbols-outlined text-[#0b1326] font-black">rocket_launch</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-tertiary leading-tight">Early Adopter</h4>
                     <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Joined StudyNex Alpha</p>
                   </div>
                 </li>
                 <li className="flex items-center gap-4 bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                   <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(78,222,163,0.4)]">
                     <span className="material-symbols-outlined text-[#0b1326] font-black">electric_bolt</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-secondary leading-tight">Lightning Focus</h4>
                     <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">5 Hours non-stop</p>
                   </div>
                 </li>
                 <li className="flex items-center gap-4 bg-surface-container-highest p-3 rounded-xl border border-outline-variant/20 opacity-50 grayscale">
                   <div className="w-10 h-10 rounded-full bg-outline-variant flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-[#0b1326] font-black">lock</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-white leading-tight">Midterm Master</h4>
                     <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Require 90% Global Mastery</p>
                   </div>
                 </li>
               </ul>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Profile;
