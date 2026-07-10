import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notification.bell);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchUnreadCount());

    // Poll every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = () => {
    if (!dropdownOpen) {
      dispatch(fetchNotifications());
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    dispatch(markAllAsRead());
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button className="top-bar-btn" onClick={handleToggleDropdown}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', width: '16px', height: '16px', right: '-4px', top: '-4px' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          width: '320px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          zIndex: 100,
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid var(--border)', 
                    background: notif.is_read ? 'transparent' : 'rgba(124, 92, 252, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{notif.title}</div>
                    {!notif.is_read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        title="Mark as read"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '2px' }}
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{notif.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
