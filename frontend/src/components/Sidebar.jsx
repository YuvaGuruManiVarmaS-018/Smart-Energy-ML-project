import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  Building2,
  Users,
  Tv,
  Database,
  LineChart,
  Lightbulb,
  History,
  FileText,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Cpu,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { user, logout, notifications } = useApp();
  const navigate = useNavigate();
  const unreadNotifs = notifications?.filter((n) => !n.is_read)?.length || 0;

  const coreLinks = [
    { to: '/dashboard', label: 'Household Dashboard', icon: LayoutDashboard },
    { to: '/properties', label: 'Family Properties', icon: Building2 },
    { to: '/family', label: 'Family Members', icon: Users },
    { to: '/appliances', label: 'Appliances & Loads', icon: Tv },
  ];

  const academicModules = [
    {
      to: '/module1-data',
      num: 'M1',
      label: 'Data Collection & Preprocessing',
      tag: 'Module 1',
      icon: Database,
      desc: 'Schema Detection & Cleaning',
    },
    {
      to: '/module2-ml',
      num: 'M2',
      label: 'Energy Prediction & Analytics',
      tag: 'Module 2',
      icon: LineChart,
      desc: '3-Model ML Benchmark',
    },
    {
      to: '/module3-opt',
      num: 'M3',
      label: 'Energy Optimization & Savings',
      tag: 'Module 3',
      icon: Lightbulb,
      desc: '₹ Tariff & Recommendations',
    },
  ];

  const demoLinks = [
    { to: '/experiments', label: 'ML Benchmark Studio', icon: Cpu, badge: '3 MODELS', badgeColor: '#c084fc' },
    { to: '/activity', label: 'Backend Activity Logs', icon: Activity, badge: 'LIVE', badgeColor: '#34d399' },
  ];

  const auxiliaryLinks = [
    { to: '/history', label: 'Energy History', icon: History },
    { to: '/reports', label: 'Reports & Audits', icon: FileText },
    { to: '/notifications', label: 'Alerts & Notifications', icon: Bell, badge: unreadNotifs },
    { to: '/settings', label: 'Settings & Tariffs', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: 280,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0a0e1a',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px 16px',
        overflowY: 'auto',
        zIndex: 50,
      }}
    >
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '24px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(6, 182, 212, 0.45)',
            }}
          >
            <Zap size={22} color="#ffffff" fill="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                VoltIQ
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.2 }}>
              Smart Energy Platform
            </div>
          </div>
        </div>

        {/* Section 1: Core Navigation */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '0 8px', marginBottom: '6px' }}>
            Operations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {coreLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                  transition: 'all 0.18s ease',
                })}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Section 2: Three Main Academic Project Modules (Emphasized!) */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.04em' }}>
              Academic Capstone Modules
            </span>
            <Sparkles size={12} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {academicModules.map((mod) => (
              <NavLink
                key={mod.to}
                to={mod.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  backgroundColor: isActive
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                  boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                })}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                >
                  {mod.num}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.3 }}>
                    {mod.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {mod.desc}
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Section 2.5: Demonstration & Diagnostics */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#c084fc', padding: '0 8px', marginBottom: '6px', letterSpacing: '0.04em' }}>
            Viva & Diagnostics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {demoLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(168, 85, 247, 0.4)' : 'transparent'}`,
                  transition: 'all 0.18s ease',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <item.icon size={16} color="#c084fc" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: `${item.badgeColor}22`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}44`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Section 3: Auxiliary Links */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '0 8px', marginBottom: '6px' }}>
            Records & Settings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {auxiliaryLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                  transition: 'all 0.18s ease',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      backgroundColor: '#f43f5e',
                      color: '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer & Logout */}
      <div
        style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.full_name || 'Family User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ') || 'Member'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out of household"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
