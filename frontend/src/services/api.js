const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('smart_energy_token');
export const setAuthToken = (token) => localStorage.setItem('smart_energy_token', token);
export const removeAuthToken = () => localStorage.removeItem('smart_energy_token');

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData (file uploads)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Authentication
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiRequest('/auth/me'),

  logout: () => {
    removeAuthToken();
    return Promise.resolve();
  },

  // Family & Properties
  getProperties: () => apiRequest('/family/properties'),

  createProperty: (payload) =>
    apiRequest('/family/properties', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProperty: (propertyId, payload) =>
    apiRequest(`/family/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getMembers: () => apiRequest('/family/members'),

  inviteMember: (payload) =>
    apiRequest('/family/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  removeMember: (memberId) =>
    apiRequest(`/family/members/${memberId}`, {
      method: 'DELETE',
    }),

  getAppliances: (propertyId) => apiRequest(`/family/appliances?property_id=${propertyId}`),

  addAppliance: (payload) =>
    apiRequest('/family/appliances', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Module 1: Data Collection & Preprocessing
  uploadDataset: (propertyId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(`/dataset/upload?property_id=${propertyId}`, {
      method: 'POST',
      body: formData,
    });
  },

  preprocessDataset: (payload) =>
    apiRequest('/dataset/preprocess', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDatasetPreview: (propertyId) => apiRequest(`/dataset/preview?property_id=${propertyId}`),

  // Module 2: Prediction & Analytics
  trainModels: (propertyId) =>
    apiRequest(`/model/train?property_id=${propertyId}`, {
      method: 'POST',
    }),

  getModelMetrics: (propertyId) => apiRequest(`/model/metrics?property_id=${propertyId}`),

  predictEnergy: (payload) =>
    apiRequest('/model/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAnalytics: (propertyId) => apiRequest(`/model/analytics?property_id=${propertyId}`),

  getPredictionHistory: (propertyId) => apiRequest(`/model/history?property_id=${propertyId}`),

  // Module 3: Optimization & Recommendations
  getEnergyAudit: (propertyId) => apiRequest(`/optimize/audit?property_id=${propertyId}`),

  getRecommendations: (propertyId) => apiRequest(`/optimize/recommendations?property_id=${propertyId}`),

  updateRecommendationStatus: (recId, status) =>
    apiRequest(`/optimize/recommendations/${recId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  getDeploymentStatus: () => apiRequest('/optimize/deployment-status'),

  // Dashboard
  getDashboardSummary: () => apiRequest('/dashboard/summary'),

  getNotifications: () => apiRequest('/dashboard/notifications'),

  markNotificationRead: (notifId) =>
    apiRequest(`/dashboard/notifications/${notifId}/read`, {
      method: 'POST',
    }),

  // Reports
  listReports: (propertyId) => apiRequest(`/reports?property_id=${propertyId}`),

  generateReport: (propertyId) =>
    apiRequest(`/reports/generate?property_id=${propertyId}`, {
      method: 'POST',
    }),

  // Model Selection
  setActiveModel: (propertyId, modelName) =>
    apiRequest('/model/set-active', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId, model_name: modelName }),
    }),

  // Mode B: Live Simulation
  getSimulationStatus: (propertyId) => apiRequest(`/simulation/status?property_id=${propertyId}`),

  startSimulation: (propertyId) =>
    apiRequest('/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    }),

  pauseSimulation: (propertyId) =>
    apiRequest('/simulation/pause', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    }),

  resumeSimulation: (propertyId) =>
    apiRequest('/simulation/resume', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    }),

  stopSimulation: (propertyId) =>
    apiRequest('/simulation/stop', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    }),

  resetSimulation: (propertyId) =>
    apiRequest('/simulation/reset', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    }),

  tickSimulation: (propertyId) =>
    apiRequest('/simulation/tick', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    }),

  // Mode C: Real-Time Hardware IoT
  listIoTDevices: (propertyId) => apiRequest(`/iot/devices?property_id=${propertyId}`),

  registerIoTDevice: (payload) =>
    apiRequest('/iot/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getIoTStatus: (propertyId) => apiRequest(`/iot/status?property_id=${propertyId}`),

  // System Activities
  getActivityLogs: (propertyId = null, module = null, limit = 50) => {
    let q = `/activity/logs?limit=${limit}`;
    if (propertyId) q += `&property_id=${propertyId}`;
    if (module && module !== 'ALL') q += `&module=${encodeURIComponent(module)}`;
    return apiRequest(q);
  },

  clearActivityLogs: (propertyId = null) => {
    const q = propertyId ? `/activity/clear?property_id=${propertyId}` : '/activity/clear';
    return apiRequest(q, { method: 'DELETE' });
  },
};
