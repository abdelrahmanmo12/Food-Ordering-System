// components/NotificationBell.jsx
// Drop this into your Navbar wherever you want the bell icon.
//
// Endpoints:
//   GET   /api/notifications/my-notifications   → requires X-User-Id + X-User-Role headers
//   PATCH /api/notifications/mark-as-read       → requires X-User-Id + X-User-Role headers
//
// Usage in Navbar:
//   import NotificationBell from '../components/NotificationBell';
//   <NotificationBell />

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function fetchNotifications() {
  const response = await api.get('/api/notifications/my-notifications');
  return response.data;
}

function markAllRead() {
  return api.patch('/api/notifications/mark-as-read');
}

// ─── Single notification row ──────────────────────────────────────────────

function NotifRow({ notif }) {
  const isUnread = !notif.read;
  return (
    <div style={{
      padding: '12px 16px',
      background: isUnread ? '#fff7ed' : '#fff',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex', gap: 12, alignItems: 'flex-start',
      transition: 'background 0.2s',
    }}>
      {/* Dot indicator */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
        background: isUnread ? '#f97316' : 'transparent',
        border: isUnread ? 'none' : '1.5px solid #d1d5db',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: isUnread ? 600 : 400, color: '#111827', lineHeight: 1.4 }}>
          {notif.message || notif.title || 'Notification'}
        </div>
        {notif.orderId && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            Order #{notif.orderId}
          </div>
        )}
        {notif.createdAt && (
          <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 3 }}>
            {new Date(notif.createdAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dropdown panel ──────────────────────────────────────────────────────────

function NotifPanel({ notifications, onMarkAllRead, isPending, onClose }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 8,
      width: 340, maxHeight: 420,
      background: '#fff', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      border: '1.5px solid #f3f4f6',
      overflow: 'hidden', zIndex: 1000,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff',
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
          Notifications {unreadCount > 0 && (
            <span style={{
              marginLeft: 6, background: '#f97316', color: '#fff',
              borderRadius: 20, padding: '2px 7px', fontSize: 11, fontWeight: 700,
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            disabled={isPending}
            style={{
              fontSize: 12, fontWeight: 600, color: '#f97316',
              background: 'none', border: 'none', cursor: 'pointer',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
            <div style={{ fontSize: 14 }}>No notifications yet</div>
          </div>
        ) : (
          notifications.map((n, i) => <NotifRow key={n.id ?? i} notif={n} />)
        )}
      </div>
    </div>
  );
}

// ─── Bell button (export this into your Navbar) ───────────────────────────────

export default function NotificationBell() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Poll every 30 seconds while logged in
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const markAll = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 8, borderRadius: 10,
          color: '#6b7280', fontSize: 20, lineHeight: 1,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: '#f97316', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <NotifPanel
          notifications={notifications}
          onMarkAllRead={() => markAll.mutate()}
          isPending={markAll.isPending}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
