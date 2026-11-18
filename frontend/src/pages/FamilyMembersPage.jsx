import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Copy, Check, Trash2, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function FamilyMembersPage() {
  const { user, properties } = useApp();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Invite form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('family_member');
  const [selectedProps, setSelectedProps] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await api.getMembers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load family members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    const code = user?.invite_code || 'SHARMA-ENERGY-2026';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setError('');
    setInviteSuccess('');
    try {
      const res = await api.inviteMember({
        full_name: fullName,
        email,
        role,
        property_ids: selectedProps,
      });
      setInviteSuccess(`Member added! Default password: ${res.default_password}`);
      setFullName('');
      setEmail('');
      setSelectedProps([]);
      await loadMembers();
    } catch (err) {
      setError(err.message || 'Failed to invite member.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to revoke this family member access?')) return;
    try {
      await api.removeMember(memberId);
      await loadMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  const togglePropertySelect = (pId) => {
    setSelectedProps((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Family Members & Access Governance
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Manage family member roles, property assignments, and household invitation codes
          </p>
        </div>

        {user?.role === 'family_admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <UserPlus size={16} />
            <span>Invite Family Member</span>
          </button>
        )}
      </div>

      {/* Family Invitation Code Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(56, 189, 248, 0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={20} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Household Invitation Passkey
            </div>
            <div className="font-mono-num" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
              {user?.invite_code || 'SHARMA-ENERGY-2026'}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyCode}
          className="btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Invite Code'}</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
          Registered Household Members ({members.length})
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Member Name</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Household Role</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Account Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Member Since</th>
                {user?.role === 'family_admin' && <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isAdmin = m.role === 'family_admin';
                const isManager = m.role === 'property_manager';
                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <td style={{ padding: '14px', color: '#f8fafc', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: isAdmin ? '#10b981' : isManager ? '#38bdf8' : '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                          {m.full_name[0]}
                        </div>
                        <span>{m.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#94a3b8' }}>{m.email}</td>
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: isAdmin
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isManager
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(192, 132, 252, 0.15)',
                          color: isAdmin ? '#34d399' : isManager ? '#38bdf8' : '#c084fc',
                          textTransform: 'capitalize',
                        }}
                      >
                        {m.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '0.74rem', color: m.is_active ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                        {m.is_active ? '● Active' : '○ Access Revoked'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: '#64748b' }}>
                      {m.created_at ? m.created_at.split('T')[0] : '2026-11-01'}
                    </td>
                    {user?.role === 'family_admin' && (
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        {!isAdmin && m.is_active === 1 && (
                          <button
                            onClick={() => handleRemove(m.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#fb7185',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Revoke access"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <form
            onSubmit={handleInvite}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '520px', padding: '30px', borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Add Family Member / Property Manager
            </h2>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: '0.8rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}
            {inviteSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.8rem', marginBottom: '14px' }}>
                {inviteSuccess}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@sharma-family.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={inputStyle}
                >
                  <option value="property_manager" style={{ background: '#0f172a' }}>
                    Property Manager (Can manage assigned properties & energy data)
                  </option>
                  <option value="family_member" style={{ background: '#0f172a' }}>
                    Family Member (Viewer access to permitted properties)
                  </option>
                </select>
              </div>

              {role === 'property_manager' && (
                <div>
                  <label style={labelStyle}>Assign Permitted Properties</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', backgroundColor: '#0a0e1a', borderRadius: '8px', border: '1px solid #334155' }}>
                    {properties.map((p) => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedProps.includes(p.id)}
                          onChange={() => togglePropertySelect(p.id)}
                        />
                        <span>{p.name} ({p.property_type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button type="submit" disabled={inviting} className="btn-primary">
                  {inviting ? 'Adding Member...' : 'Register Member'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
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

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  backgroundColor: '#0a0e1a',
  border: '1px solid #334155',
  color: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
};
