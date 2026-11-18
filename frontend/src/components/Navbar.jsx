import React from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Shield,
  Bell,
  Play,
  Pause,
  Square,
  RotateCcw,
  Database,
  Radio,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const {
    properties,
    activeProperty,
    switchProperty,
    user,
    notifications,
    operatingMode,
    setOperatingMode,
    simulationState,
    startLiveSimulation,
    pauseLiveSimulation,
    resumeLiveSimulation,
    stopLiveSimulation,
    resetLiveSimulation,
  } = useApp();
  const navigate = useNavigate();
  const unreadCount = notifications?.filter((n) => !n.is_read)?.length || 0;

  const getPropertyIcon = (type) => {
    switch (type) {
      case 'Residential House':
      case 'Apartment':
        return '🏡';
      case 'Family-Owned Office':
      case 'Commercial Building':
        return '🏢';
      case 'Retail Shop':
      case 'Supermarket':
        return '🛒';
      case 'Warehouse':
        return '🏭';
      case 'Restaurant':
        return '🍽️';
      default:
        return '⚡';
    }
  };

  const isSimRunning = simulationState?.status === 'RUNNING';
  const isSimPaused = simulationState?.status === 'PAUSED';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        backgroundColor: 'rgba(10, 14, 26, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Active Property Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>
            {getPropertyIcon(activeProperty?.property_type)}
          </span>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Active Monitored Property
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={activeProperty?.id || ''}
                onChange={(e) => switchProperty(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  padding: '5px 10px',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)',
                }}
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                    {p.name} ({p.property_type})
                  </option>
                ))}
              </select>

              {activeProperty && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 7px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 600,
                  }}
                >
                  ₹{activeProperty.tariff_inr}/kWh
                </span>
              )}
            </div>
          </div>
        </div>

        {user?.role === 'family_admin' && (
          <button
            onClick={() => navigate('/properties')}
            className="btn-secondary"
            style={{ padding: '5px 8px', fontSize: '0.74rem' }}
            title="Register a new family-owned property"
          >
            <Plus size={13} />
            <span>Add Property</span>
          </button>
        )}
      </div>

      {/* Middle: 3 Operating Modes Switcher & Simulation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mode Selector Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#050811',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setOperatingMode('DATASET')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: operatingMode === 'DATASET' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: operatingMode === 'DATASET' ? '#38bdf8' : '#94a3b8',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <Database size={13} /> Mode A: Dataset
          </button>

          <button
            onClick={() => setOperatingMode('SIMULATION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: operatingMode === 'SIMULATION' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: operatingMode === 'SIMULATION' ? '#34d399' : '#94a3b8',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <Zap size={13} /> Mode B: Simulation
          </button>

          <button
            onClick={() => {
              setOperatingMode('IOT');
              navigate('/iot-devices');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: operatingMode === 'IOT' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: operatingMode === 'IOT' ? '#c084fc' : '#94a3b8',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <Radio size={13} /> Mode C: IoT
          </button>
        </div>

        {/* Live Simulation Controls when in SIMULATION mode */}
        {operatingMode === 'SIMULATION' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '3px 8px',
            }}
          >
            {!isSimRunning ? (
              <button
                onClick={() => (isSimPaused ? resumeLiveSimulation() : startLiveSimulation())}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Play size={11} fill="currentColor" /> {isSimPaused ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button
                onClick={() => pauseLiveSimulation()}
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Pause size={11} /> Pause
              </button>
            )}

            <button
              onClick={() => stopLiveSimulation()}
              disabled={simulationState?.status === 'STOPPED'}
              style={{
                background: 'rgba(244, 63, 94, 0.2)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: simulationState?.status === 'STOPPED' ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Square size={10} fill="currentColor" /> Stop
            </button>

            <button
              onClick={() => resetLiveSimulation()}
              title="Reset accumulated kWh to zero"
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                padding: '4px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RotateCcw size={12} />
            </button>

            {/* Live Ticker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', fontSize: '0.74rem' }}>
              <span style={{ color: '#34d399', fontWeight: 800 }}>
                {simulationState?.current_power_kw || 0} kW
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                {simulationState?.accumulated_kwh || 0} kWh
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                ₹{simulationState?.cost_inr || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Family Status & Alerts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Family Estate Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Shield size={13} color="#10b981" />
          <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600 }}>
            {user?.family_name || 'Family Estate'}
          </span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '7px',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: 15,
                height: 15,
                borderRadius: '50%',
                backgroundColor: '#f43f5e',
                color: '#ffffff',
                fontSize: '0.6rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
