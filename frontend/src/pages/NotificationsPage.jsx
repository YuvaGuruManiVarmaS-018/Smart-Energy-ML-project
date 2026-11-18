import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function NotificationsPage() {
  const { notifications, loadNotifications } = useApp();
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    setNotifList(notifications || []);
  }, [notifications]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifList((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'urgent':
        return <ShieldAlert size={18} color="#fb7185" />;
      case 'success':
        return <CheckCircle2 size={18} color="#34d399" />;
      default:
        return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
          Household Alerts & Notifications
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Real-time grid alerts, peak tariff schedules, and energy anomaly warnings across your family's properties
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifList.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              No notifications at this time.
            </div>
          ) : (
            notifList.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: notif.is_read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.85)',
                  border: `1px solid ${notif.is_read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(56, 189, 248, 0.3)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getNotifIcon(notif.type)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: notif.is_read ? '#cbd5e1' : '#f8fafc' }}>
                      {notif.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {notif.created_at ? notif.created_at.split('T')[0] : 'Today'}
                    </span>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '6px 12px' }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
