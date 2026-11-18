import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  
  // Operating Modes: 'DATASET' (Real Dataset Mode), 'SIMULATION' (Live Simulation Mode), 'IOT' (Hardware Integration)
  const [operatingMode, setOperatingModeState] = useState(
    () => localStorage.getItem('voltiq_operating_mode') || 'DATASET'
  );
  const [simulationState, setSimulationState] = useState({
    status: 'STOPPED',
    current_power_kw: 0.0,
    accumulated_kwh: 0.0,
    cost_inr: 0.0,
    tick_count: 0,
    appliance_telemetry: [],
    alerts: [],
  });

  const setOperatingMode = (mode) => {
    setOperatingModeState(mode);
    localStorage.setItem('voltiq_operating_mode', mode);
  };

  const fetchSimulationState = useCallback(async (propId) => {
    if (!propId) return;
    try {
      const state = await api.getSimulationStatus(propId);
      setSimulationState(state);
    } catch (e) {
      console.warn('Failed to fetch simulation state:', e);
    }
  }, []);

  const startLiveSimulation = async (propId) => {
    const pid = propId || activeProperty?.id;
    if (!pid) return;
    const res = await api.startSimulation(pid);
    setSimulationState(res);
    return res;
  };

  const pauseLiveSimulation = async (propId) => {
    const pid = propId || activeProperty?.id;
    if (!pid) return;
    const res = await api.pauseSimulation(pid);
    setSimulationState(res);
    return res;
  };

  const resumeLiveSimulation = async (propId) => {
    const pid = propId || activeProperty?.id;
    if (!pid) return;
    const res = await api.resumeSimulation(pid);
    setSimulationState(res);
    return res;
  };

  const stopLiveSimulation = async (propId) => {
    const pid = propId || activeProperty?.id;
    if (!pid) return;
    const res = await api.stopSimulation(pid);
    setSimulationState(res);
    return res;
  };

  const resetLiveSimulation = async (propId) => {
    const pid = propId || activeProperty?.id;
    if (!pid) return;
    const res = await api.resetSimulation(pid);
    setSimulationState(res);
    return res;
  };

  // Auto-tick simulation if mode is SIMULATION and status is RUNNING
  useEffect(() => {
    let timer = null;
    if (operatingMode === 'SIMULATION' && activeProperty && simulationState.status === 'RUNNING') {
      timer = setInterval(async () => {
        try {
          const updated = await api.tickSimulation(activeProperty.id);
          setSimulationState(updated);
        } catch (err) {
          console.warn('Simulation tick error:', err);
        }
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [operatingMode, activeProperty, simulationState.status]);

  // Sync simulation state on active property change
  useEffect(() => {
    if (activeProperty && operatingMode === 'SIMULATION') {
      fetchSimulationState(activeProperty.id);
    }
  }, [activeProperty, operatingMode, fetchSimulationState]);

  // Initial user fetch
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = getAuthToken();
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
      await loadProperties(userData);
      await loadNotifications();
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      removeAuthToken();
      setUser(null);
      setProperties([]);
      setActiveProperty(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProperties = async (currentUser) => {
    try {
      const props = await api.getProperties();
      setProperties(props);

      if (props.length > 0) {
        const savedPropId = localStorage.getItem('smart_energy_active_property');
        const matched = props.find((p) => p.id === savedPropId) || props[0];
        setActiveProperty(matched);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      // ignore notification load error
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await api.login(email, password);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      await loadProperties(res.user);
      await loadNotifications();
      return res;
    } catch (err) {
      setGlobalError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await api.register(payload);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      await loadProperties(res.user);
      return res;
    } catch (err) {
      setGlobalError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    removeAuthToken();
    setToken(null);
    setUser(null);
    setProperties([]);
    setActiveProperty(null);
    window.location.href = '/login';
  };

  const switchProperty = (propertyId) => {
    const found = properties.find((p) => p.id === propertyId);
    if (found) {
      setActiveProperty(found);
      localStorage.setItem('smart_energy_active_property', propertyId);
    }
  };

  const refreshProperties = async () => {
    if (user) {
      await loadProperties(user);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        properties,
        activeProperty,
        notifications,
        loading,
        globalError,
        setGlobalError,
        login,
        register,
        logout,
        switchProperty,
        refreshProperties,
        loadNotifications,
        operatingMode,
        setOperatingMode,
        simulationState,
        startLiveSimulation,
        pauseLiveSimulation,
        resumeLiveSimulation,
        stopLiveSimulation,
        resetLiveSimulation,
        fetchSimulationState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
