import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, Mail, User, Shield, KeyRound, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [joinWithCode, setJoinWithCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          family_name: joinWithCode ? undefined : familyName,
          invite_code: joinWithCode ? inviteCode : undefined,
        });
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setIsRegister(false);
    login(quickEmail, quickPass).then(() => navigate('/dashboard')).catch((err) => setError(err.message));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#070a12',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel card-3d"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '38px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.1)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)',
              marginBottom: '14px',
            }}
          >
            <Zap size={28} color="#ffffff" fill="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            VoltIQ Family Platform
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Smart Energy Management Platform – Family-Owned Properties
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#0a0e1a',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            style={{
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: !isRegister ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: !isRegister ? '#38bdf8' : '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            Family Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            style={{
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: isRegister ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: isRegister ? '#34d399' : '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            Register Household
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.8rem',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={inputContainerStyle}>
                <User size={16} color="#64748b" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={inputContainerStyle}>
              <Mail size={16} color="#64748b" />
              <input
                type="email"
                required
                placeholder="name@family.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={inputContainerStyle}>
              <Lock size={16} color="#64748b" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="regType"
                    checked={!joinWithCode}
                    onChange={() => setJoinWithCode(false)}
                  />
                  <span>Create New Family</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="regType"
                    checked={joinWithCode}
                    onChange={() => setJoinWithCode(true)}
                  />
                  <span>Join with Invite Code</span>
                </label>
              </div>

              {!joinWithCode ? (
                <div style={inputContainerStyle}>
                  <Building2 size={16} color="#64748b" />
                  <input
                    type="text"
                    required
                    placeholder="Family Estate Name (e.g. Sharma Holdings)"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ) : (
                <div style={inputContainerStyle}>
                  <KeyRound size={16} color="#64748b" />
                  <input
                    type="text"
                    required
                    placeholder="Invitation Code (e.g. SHARMA-ENERGY-2026)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}

          {!isRegister && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => alert('Please contact your Family Administrator to reset your password.')}>
                Forgot password?
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.92rem' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Complete Household Registration' : 'Access Family Properties'}
          </button>
        </form>

        {/* Demo Fast-Login Section for Capstone Evaluation */}
        <div style={{ marginTop: '26px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'center', marginBottom: '10px' }}>
            ⚡ 1-Click Capstone Demo Profiles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleQuickLogin('admin@sharma-family.com', 'admin123')}
              style={{ fontSize: '0.74rem', padding: '6px 8px' }}
              title="Full access to 4 properties and member management"
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleQuickLogin('manager@sharma-family.com', 'manager123')}
              style={{ fontSize: '0.74rem', padding: '6px 8px' }}
              title="Property Manager access to Office & Supermarket"
            >
              🏢 Manager
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleQuickLogin('priya@sharma-family.com', 'member123')}
              style={{ fontSize: '0.74rem', padding: '6px 8px' }}
              title="Family Member viewer access"
            >
              👤 Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#cbd5e1',
  marginBottom: '6px',
};

const inputContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  borderRadius: '10px',
  backgroundColor: '#0a0e1a',
  border: '1px solid #1e293b',
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#f8fafc',
  fontSize: '0.86rem',
};
