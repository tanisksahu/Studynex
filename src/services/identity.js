/**
 * Identity Service
 * Abstracts away the anonymous UUID authentication.
 * 
 * Future replacement point:
 * To switch to Firebase Auth, replace this with:
 * return firebase.auth().currentUser?.uid;
 */

export const getCurrentIdentity = () => {
  let userId = localStorage.getItem('studynex-userId');
  
  if (!userId) {
    // Generate a secure anonymous identifier
    userId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    localStorage.setItem('studynex-userId', userId);
  }
  
  return userId;
};
