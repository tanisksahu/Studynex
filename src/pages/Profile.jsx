import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { profile, setProfile } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const totalStudyTime = Math.floor(profile.studyTimeMinutes / 60);

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
        toast.success('Avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const containerLoader = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemLoader = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <main className="p-4 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div variants={itemLoader} className="border-b border-outline-variant pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface mb-1">
               Profile & Account
             </h1>
             <p className="text-on-surface-variant font-medium text-sm lg:text-base">
               Manage your personal information and preferences.
             </p>
           </div>
           
           <button onClick={() => setIsEditing(!isEditing)} className={`text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isEditing ? 'bg-surface-variant text-on-surface hover:text-error' : 'bg-surface-variant text-on-surface hover:bg-[#EAEAE5]'}`}>
             <span className="material-symbols-outlined text-[18px]">{isEditing ? 'close' : 'edit'}</span> 
             {isEditing ? 'Cancel Edit' : 'Edit Profile'}
           </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Avatar & Summary */}
          <motion.div variants={itemLoader} className="md:col-span-4 space-y-6">
            <div className="sn-card p-6 flex flex-col items-center text-center">
                <div 
                  className="relative group/avatar cursor-pointer shrink-0 mb-4" 
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
                    className="w-32 h-32 rounded-full border-2 border-outline-variant object-cover bg-surface transition-transform duration-500 group-hover/avatar:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full flex items-center justify-center backdrop-blur-sm">
                     <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold tracking-tight text-on-surface mb-1">{profile.firstName} {profile.lastName}</h2>
                <p className="text-sm text-on-surface-variant mb-6">{profile.email}</p>
                
                <div className="w-full flex justify-between bg-surface-variant rounded-lg p-4 mb-4">
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Study Time</span>
                    <span className="text-sm font-bold text-on-surface">{totalStudyTime}h</span>
                  </div>
                  <div className="w-px bg-outline-variant"></div>
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tasks</span>
                    <span className="text-sm font-bold text-on-surface">12</span>
                  </div>
                  <div className="w-px bg-outline-variant"></div>
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Rank</span>
                    <span className="text-sm font-bold text-primary">#1</span>
                  </div>
                </div>

                <div className="w-full space-y-2 text-left">
                  <div className="flex justify-between text-sm py-2 border-b border-outline-variant/50">
                     <span className="text-on-surface-variant font-medium">Institution</span>
                     <span className="font-semibold">{profile.institution || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-outline-variant/50">
                     <span className="text-on-surface-variant font-medium">Role</span>
                     <span className="font-semibold">Student</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-outline-variant/50">
                     <span className="text-on-surface-variant font-medium">Joined</span>
                     <span className="font-semibold">Sept 2026</span>
                  </div>
                </div>
            </div>
          </motion.div>

          {/* Right Column: Edit Form */}
          <motion.div variants={itemLoader} className="md:col-span-8">
            <div className="sn-card p-6 lg:p-8">
               <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4">
                 Personal Details
               </h3>
               
               <form onSubmit={handleSave} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">First Name</label>
                     <input type="text" disabled={!isEditing} defaultValue={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="w-full bg-surface border border-outline-variant focus:border-primary disabled:opacity-60 disabled:bg-surface-variant disabled:cursor-not-allowed text-sm font-medium text-on-surface px-4 py-2.5 rounded-lg transition-all outline-none focus:ring-1 focus:ring-primary shadow-soft" />
                   </div>
                   <div>
                     <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Last Name</label>
                     <input type="text" disabled={!isEditing} defaultValue={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="w-full bg-surface border border-outline-variant focus:border-primary disabled:opacity-60 disabled:bg-surface-variant disabled:cursor-not-allowed text-sm font-medium text-on-surface px-4 py-2.5 rounded-lg transition-all outline-none focus:ring-1 focus:ring-primary shadow-soft" />
                   </div>
                 </div>
                 <div>
                   <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Email Address</label>
                   <input type="email" disabled={!isEditing} defaultValue={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-surface border border-outline-variant focus:border-primary disabled:opacity-60 disabled:bg-surface-variant disabled:cursor-not-allowed text-sm font-medium text-on-surface px-4 py-2.5 rounded-lg transition-all outline-none focus:ring-1 focus:ring-primary shadow-soft" />
                 </div>
                 <div>
                   <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Institution</label>
                   <input type="text" disabled={!isEditing} defaultValue={profile.institution} onChange={(e) => setProfile({...profile, institution: e.target.value})} className="w-full bg-surface border border-outline-variant focus:border-primary disabled:opacity-60 disabled:bg-surface-variant disabled:cursor-not-allowed text-sm font-medium text-on-surface px-4 py-2.5 rounded-lg transition-all outline-none focus:ring-1 focus:ring-primary shadow-soft" />
                 </div>
                 <div>
                   <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Bio / Study Goals</label>
                   <textarea rows="4" disabled={!isEditing} defaultValue="Focused on completing my Computer Science degree with a minor in Data Science. Always looking for study buddies!" className="w-full bg-surface border border-outline-variant focus:border-primary disabled:opacity-60 disabled:bg-surface-variant disabled:cursor-not-allowed text-sm font-medium text-on-surface px-4 py-2.5 rounded-lg transition-all outline-none focus:ring-1 focus:ring-primary shadow-soft resize-none"></textarea>
                 </div>
                 
                 {isEditing && (
                   <div className="flex justify-end pt-4 border-t border-outline-variant">
                     <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-8 py-2.5 rounded-lg transition-colors shadow-soft">
                       Save Changes
                     </motion.button>
                   </div>
                 )}
               </form>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </main>
  );
};

export default Profile;
