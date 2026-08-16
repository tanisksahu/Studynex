import { getCurrentIdentity } from './identity';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const userId = getCurrentIdentity();
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId
  };
};

export const api = {
  migrate: async (data) => {
    const res = await fetch(`${API_URL}/migrate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Migration failed');
    return json;
  },
  
  getData: async () => {
    const res = await fetch(`${API_URL}/data`, { headers: getHeaders() });
    return res.json();
  },

  updateProfile: async (data) => {
    await fetch(`${API_URL}/profile`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  },

  updateSettings: async (data) => {
    await fetch(`${API_URL}/settings`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  },

  updateNotifications: async (data) => {
    await fetch(`${API_URL}/notifications`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  },

  addSubject: async (data) => {
    const res = await fetch(`${API_URL}/subjects`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return res.json();
  },

  deleteSubject: async (id) => {
    await fetch(`${API_URL}/subjects/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  updateUnit: async (subjectId, unitNumber, data) => {
    const res = await fetch(`${API_URL}/units/${subjectId}/${unitNumber}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    return res.json();
  },

  updateMastery: async (data) => {
    await fetch(`${API_URL}/mastery`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  },

  updateTasks: async (data) => {
    await fetch(`${API_URL}/tasks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  },

  updateMaterials: async (data) => {
    await fetch(`${API_URL}/materials`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  }
};
