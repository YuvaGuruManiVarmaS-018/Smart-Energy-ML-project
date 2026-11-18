import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Building2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Database,
  LineChart,
  ShieldAlert,
  Play,
  Pause,
  Square,
  RotateCcw,
  Radio,
  WifiOff,
  Wifi,
  Activity,
  HardDrive,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function DashboardPage() {
  const {
    user,
    activeProperty,
    switchProperty,
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

  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeProperty, operatingMode]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);

      if (activeProperty) {
        const analytics = await api.getAnalytics(activeProperty.id);
        setTimeline(analytics.timeline || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const propertyColors = ['#06b6d4', '#38bdf8', '#10b981', '#a855f7', '#f59e0b'];

  const getPropIcon = (type) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Operating Mode Banner */}
      {operatingMode === 'SIMULATION' ? (
        <div
          className="card-3d"
          style={{
            padding: '20px 28px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={22} color="#34d399" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  LIVE SIMULATION
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  DATA SOURCE: SYNTHETIC REAL-TIME TELEMETRY ENGINE
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                Simulating {activeProperty?.name} ({activeProperty?.property_type})
              </h2>
            </div>
          </div>

          {/* Inline Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isSimRunning ? (
              <button
                onClick={() => (isSimPaused ? resumeLiveSimulation() : startLiveSimulation())}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
              >
                <Play size={14} fill="currentColor" /> {isSimPaused ? 'Resume Simulation' : 'Start Simulation'}
              </button>
            ) : (
              <button
                onClick={() => pauseLiveSimulation()}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px', borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                <Pause size={14} /> Pause
              </button>
            )}

            <button
              onClick={() => stopLiveSimulation()}
              disabled={simulationState?.status === 'STOPPED'}
              className="btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <Square size={13} fill="currentColor" /> Stop
            </button>

            <button
              onClick={() => resetLiveSimulation()}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
              title="Reset accumulated simulation values"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      ) : operatingMode === 'IOT' ? (
        <div
          className="card-3d"
          style={{
            padding: '20px 28px',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '2px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WifiOff size={22} color="#fb7185" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f43f5e',
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  MODE C: HARDWARE NOT CONNECTED
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  IoT GATEWAY OFFLINE (ACADEMIC INTEGRITY ENFORCED)
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '4px 0 0' }}>
                No physical ESP32 or Modbus smart meter is transmitting telemetry packets to <code>/api/iot/ingest</code>.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/iot-devices')}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 16px' }}
          >
            Manage IoT Hardware & Keys
          </button>
        </div>
      ) : (
        /* Real Dataset Mode Banner */
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 182, 212, 0.12) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {summary?.family_name || 'Sharma Family Holdings'}
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                REAL DATASET MODE
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
              Central Multi-Property Energy Management • {summary?.total_properties || 4} Monitored Facilities
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              Household Passkey: <code>{user?.invite_code || 'SHARMA-ENERGY-2026'}</code>
            </span>
            <button
              onClick={() => navigate('/properties')}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Manage Properties
            </button>
          </div>
        </div>
      )}

      {/* Dynamic 4 Metric Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
      >
        {operatingMode === 'SIMULATION' ? (
          <>
            {/* Live Simulated Power (kW) */}
            <div className="glass-panel card-3d" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Live Power Demand</span>
                <Zap size={16} color="#10b981" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                  {simulationState?.current_power_kw || 0.0}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>kW</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: isSimRunning ? '#34d399' : '#f59e0b', fontWeight: 600 }}>
                {isSimRunning ? '● Live Telemetry Ticking (every 3.5s)' : '⏸ Simulation Paused'}
              </div>
            </div>

            {/* Accumulated Simulated Energy */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Simulated Energy Total</span>
                <TrendingUp size={16} color="#38bdf8" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                  {simulationState?.accumulated_kwh || 0.0}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>kWh</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Ticks Generated: {simulationState?.tick_count || 0}
              </div>
            </div>

            {/* Simulated INR Cost */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Simulated Electricity Bill</span>
                <span style={{ fontSize: '1rem', color: '#34d399', fontWeight: 800 }}>₹</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                  ₹{simulationState?.cost_inr || 0.0}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                At {activeProperty?.name} tariff: ₹{activeProperty?.tariff_inr || 8.5}/kWh
              </div>
            </div>

            {/* Simulated Alerts */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Active Simulation Alerts</span>
                <AlertTriangle size={16} color={simulationState?.alerts?.length > 0 ? '#f43f5e' : '#64748b'} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: simulationState?.alerts?.length > 0 ? '#f43f5e' : '#34d399' }}>
                  {simulationState?.alerts?.length || 0}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>triggers</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: simulationState?.alerts?.length > 0 ? '#fb7185' : '#34d399' }}>
                {simulationState?.alerts?.length > 0
                  ? simulationState.alerts[0].title
                  : 'Load operating within safety thresholds'}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Total Family Consumption from Real DB */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Total Family Consumption</span>
                <Zap size={16} color="#38bdf8" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {summary?.total_consumption_kwh !== undefined ? summary.total_consumption_kwh.toLocaleString() : '0'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>kWh</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#34d399' }}>
                Across {summary?.total_properties || 0} monitored facilities
              </div>
            </div>

            {/* Total Estimated ₹ Bill */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Total Electricity Expense</span>
                <span style={{ fontSize: '1rem', color: '#34d399', fontWeight: 800 }}>₹</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                  ₹{summary?.total_estimated_cost_inr !== undefined ? summary.total_estimated_cost_inr.toLocaleString() : '0'}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Calculated at actual property-specific tariffs
              </div>
            </div>

            {/* Highest Consumer Alert */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Highest Consuming Property</span>
                <AlertTriangle size={16} color="#f59e0b" />
              </div>
              <div style={{ margin: '10px 0' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {summary?.highest_consuming_property?.name || 'No records'}
                </div>
                <div className="font-mono-num" style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {summary?.highest_consuming_property?.kwh > 0
                    ? `${summary.highest_consuming_property.kwh.toLocaleString()} kWh`
                    : 'Awaiting Telemetry'}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
                Traceable SQLite database record
              </div>
            </div>

            {/* Total Potential Savings */}
            <div className="glass-panel card-3d" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Optimization Opportunities</span>
                <Lightbulb size={16} color="#c084fc" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0' }}>
                <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>
                  ₹{summary?.total_potential_savings_inr !== undefined ? summary.total_potential_savings_inr.toLocaleString() : '0'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/ month</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>
                Calculated from active Module 3 recommendations
              </div>
            </div>
          </>
        )}
      </section>

      {/* If in Simulation Mode: Live Simulated Appliances Breakdown */}
      {operatingMode === 'SIMULATION' && simulationState?.appliance_telemetry?.length > 0 && (
        <section
          className="card-3d"
          style={{
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#34d399" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Live Simulated Appliance Telemetry ({simulationState.appliance_telemetry.length} Loads)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time duty cycle & load modulation
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {simulationState.appliance_telemetry.map((app) => (
              <div
                key={app.id}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                    {app.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {app.category} • Rated: {app.rated_kw} kW
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>
                    {app.status}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono-num" style={{ fontSize: '1.1rem', fontWeight: 800, color: app.current_draw_kw > 0 ? '#38bdf8' : '#64748b' }}>
                    {app.current_draw_kw} kW
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Current Draw</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3D Property Cards Grid with 1-Click Switch */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Family Properties & Monitored Status
            </h2>
          </div>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
            Click card to switch active property
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {summary?.properties?.map((prop) => {
            const isSelected = activeProperty?.id === prop.id;
            return (
              <div
                key={prop.id}
                onClick={() => switchProperty(prop.id)}
                className="glass-panel card-3d"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 0 25px rgba(6, 182, 212, 0.3)' : 'none',
                  backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.6)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{getPropIcon(prop.property_type)}</span>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                        {prop.name}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{prop.property_type}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#06b6d4', color: '#070a12' }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(0, 0, 0, 0.25)', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Recorded Usage</div>
                    <div className="font-mono-num" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                      {prop.total_kwh.toLocaleString()} kWh
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Est. Bill (@ ₹{prop.tariff_inr})</div>
                    <div className="font-mono-num" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>
                      ₹{prop.total_cost_inr.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>{prop.appliances_count} connected appliances</span>
                  <span style={{ color: '#c084fc' }}>₹{prop.potential_savings_inr} potential savings</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Analytics Row: Property Comparison & Diurnal Load */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
        {/* Multi-Property Consumption Comparison */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Family Property Consumption Share (kWh)
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Verified DB Aggregation</span>
          </div>

          <div style={{ height: 240 }}>
            {summary?.properties ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.properties} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(v) => (v.length > 12 ? v.slice(0, 10) + '...' : v)}
                  />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '0.75rem' }}
                    formatter={(val) => [`${val.toLocaleString()} kWh`, 'Energy']}
                  />
                  <Bar dataKey="total_kwh" radius={[6, 6, 0, 0]}>
                    {summary.properties.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={propertyColors[index % propertyColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Loading comparison chart...
              </div>
            )}
          </div>
        </section>

        {/* Active Property Telemetry Trend */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Active Property Demand Profile
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {activeProperty?.name || 'Selected Facility'} (Recent Observations)
              </p>
            </div>
            <button
              onClick={() => navigate('/module2-ml')}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            >
              ML Forecast <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ height: 240 }}>
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '0.75rem' }}
                    formatter={(val) => [`${val} kWh`, 'Demand']}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#demandGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Awaiting telemetry readings...
              </div>
            )}
          </div>
        </section>
      </div>

      {/* The 3 Main Academic Project Modules Quick Launch Section */}
      <section
        className="glass-panel"
        style={{
          padding: '24px 28px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(16, 185, 129, 0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="academic-badge">Academic Project Modules</span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Capstone Core Machine Learning & Energy Workflows
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Three sequential end-to-end engineering stages developed for this project
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* Module 1 */}
          <div
            onClick={() => navigate('/module1-data')}
            className="glass-panel card-3d"
            style={{ padding: '18px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} color="#38bdf8" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                MODULE 1
              </span>
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              Data Collection & Preprocessing
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Upload any CSV dataset, auto-detect schemas, remove duplicates, impute missing values, and flag Z-score anomalies.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#38bdf8', marginTop: '12px', fontWeight: 600 }}>
              <span>Launch Preprocessor</span> <ArrowRight size={13} />
            </div>
          </div>

          {/* Module 2 */}
          <div
            onClick={() => navigate('/module2-ml')}
            className="glass-panel card-3d"
            style={{ padding: '18px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart size={18} color="#10b981" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                MODULE 2
              </span>
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              ML Prediction & Analytics
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Train & compare Linear Regression, Decision Tree, and Random Forest. Inspect true MAE, MSE, RMSE, and R² scores.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#10b981', marginTop: '12px', fontWeight: 600 }}>
              <span>Run ML Benchmark</span> <ArrowRight size={13} />
            </div>
          </div>

          {/* Module 3 */}
          <div
            onClick={() => navigate('/module3-opt')}
            className="glass-panel card-3d"
            style={{ padding: '18px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb size={18} color="#c084fc" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c084fc', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(192, 132, 252, 0.1)' }}>
                MODULE 3
              </span>
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              Optimization & Recommendations
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Context-tailored recommendations by property type. Calculate actual savings in ₹ using property tariffs and track tasks.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#c084fc', marginTop: '12px', fontWeight: 600 }}>
              <span>Optimize Energy</span> <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
