import React, { useEffect, useRef, useState } from 'react';

const DotGridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let dots = [];
    const DOT_SPACING = 32;
    const DOT_RADIUS = 1.5;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      dots = [];
      for (let x = 0; x < width; x += DOT_SPACING) {
        for (let y = 0; y < height; y += DOT_SPACING) {
          dots.push({ x, y });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#fb8569';
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default function SettingsPage({ onNavigate, onLogout }) {
  const [profile, setProfile] = useState({
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    mobile_number: localStorage.getItem('mobile_number') || ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    fetch(`${API_BASE}/api/user-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile({
            name: data.name || localStorage.getItem('name') || 'User',
            email: data.email || localStorage.getItem('email') || 'Registered User',
            mobile_number: data.mobile_number || localStorage.getItem('mobile_number') || 'N/A'
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (!oldPassword) {
      setPasswordMsg({ text: 'Please enter your current password', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    setIsUpdatingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ text: 'Password updated successfully!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ text: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (err) {
      setPasswordMsg({ text: 'Error connecting to server', type: 'error' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    setIsDeleting(true);
    try {
      await fetch(`${API_BASE}/api/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
    } catch (err) {
    } finally {
      setIsDeleting(false);
      onLogout();
      onNavigate();
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0d1f1c',
      color: '#fb8569',
      fontFamily: '"Satoshi", sans-serif',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '16px'
    }}>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #0d1f1c;
        }

        .nav-link-wrapper:hover .nav-underline {
          width: 100% !important;
        }

        .input-field {
          width: 100%;
          padding: 10px 14px;
          margin-bottom: 12px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(251, 133, 105, 0.3);
          border-radius: 6px;
          color: #fb8569;
          font-family: "Satoshi", sans-serif;
          font-size: 0.9rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .input-field:focus {
          border-color: #fb8569;
        }

        .action-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          color: #0d1f1c;
          font-family: 'Satoshi', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: none;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: color 0.3s ease;
          background-color: transparent;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #fb8569;
          z-index: -1;
          transform-origin: bottom;
          transition: transform 0.4s cubic-bezier(0.7, 0, 0.3, 1);
        }

        .action-btn:hover {
          color: #fb8569;
        }

        .action-btn:hover::before {
          transform: scaleY(0);
        }

        .danger-zone-box {
          border: 1.5px solid rgba(248, 81, 73, 0.4);
          border-radius: 12px;
          background-color: rgba(248, 81, 73, 0.02);
          overflow: hidden;
          margin-top: 20px;
        }

        .danger-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .danger-row + .danger-row {
          border-top: 1px solid rgba(248, 81, 73, 0.2);
        }

        .danger-btn {
          background-color: rgba(248, 81, 73, 0.08);
          border: 1.5px solid rgba(248, 81, 73, 0.4);
          color: #f85149;
          font-family: 'Satoshi', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 6px;
          padding: 7px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-btn:hover {
          background-color: rgba(248, 81, 73, 0.22);
          border-color: #f85149;
          box-shadow: 0 0 12px rgba(248, 81, 73, 0.25);
        }

        .danger-btn-delete {
          background-color: rgba(248, 81, 73, 0.15);
          border: 1.5px solid rgba(248, 81, 73, 0.5);
          color: #f85149;
          font-family: 'Satoshi', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 6px;
          padding: 7px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-btn-delete:hover {
          background-color: #f85149;
          color: #0d1f1c;
          border-color: #f85149;
          box-shadow: 0 0 16px rgba(248, 81, 73, 0.4);
        }
      `}</style>

      <DotGridBackground />

      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '90%',
        maxWidth: '850px',
        maxHeight: '96vh',
        backgroundColor: '#0d1f1c',
        borderRadius: '24px',
        padding: '30px 40px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
        border: '1.5px solid rgba(251, 133, 105, 0.2)',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {/* Back Link */}
        <div style={{ position: 'absolute', top: '22px', left: '26px', display: 'inline-block' }} className="nav-link-wrapper">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(); }}
            style={{
              color: '#fb8569',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              paddingBottom: '4px',
              display: 'inline-block'
            }}
          >
            ← BACK TO LANDING
          </a>
          <div
            className="nav-underline"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '0%',
              height: '2px',
              backgroundColor: '#fb8569',
              transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
            }}
          />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginTop: '35px', marginBottom: '24px' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2.4rem)',
            fontWeight: '400',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 6px 0'
          }}>
            ACCOUNT SETTINGS
          </h1>
        </div>

        {/* Section 1: Profile Info */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
          border: '1.5px solid rgba(251, 133, 105, 0.2)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px 0' }}>
            PROFILE DETAILS
          </h3>

          {loadingProfile ? (
            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Loading user details...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>FULL NAME</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{profile.name || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>EMAIL ADDRESS</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{profile.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>MOBILE NUMBER</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{profile.mobile_number || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Change Password */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
          border: '1.5px solid rgba(251, 133, 105, 0.2)',
          borderRadius: '14px',
          padding: '20px 24px'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
            CHANGE PASSWORD
          </h3>

          <form onSubmit={handleChangePassword} style={{ maxWidth: '450px' }}>
            <input
              type="password"
              placeholder="OLD PASSWORD"
              className="input-field"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="NEW PASSWORD"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="CONFIRM NEW PASSWORD"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div style={{ marginTop: '8px', marginBottom: '16px', fontSize: '0.85rem', opacity: 0.9 }}>
              <span>Forget Password? </span>
              <span style={{ color: '#fb8569', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>
                Try another way
              </span>
            </div>

            <button type="submit" className="action-btn" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>

          {passwordMsg.text && (
            <p style={{
              marginTop: '12px',
              fontSize: '0.85rem',
              color: passwordMsg.type === 'error' ? '#ff6b6b' : '#51cf66',
              fontWeight: '600'
            }}>
              {passwordMsg.text}
            </p>
          )}
        </div>

        {/* Section 3: Danger Zone */}
        <div className="danger-zone-box">
          <div className="danger-row">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: '0 0 3px 0' }}>
                Logout of account
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                Log out of your current session on this device.
              </p>
            </div>
            <button
              onClick={() => {
                onLogout();
                onNavigate();
              }}
              className="danger-btn"
            >
              Logout
            </button>
          </div>

          <div className="danger-row">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f85149', margin: '0 0 3px 0' }}>
                Delete this account
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                Once you delete an account, there is no going back. Please be certain.
              </p>
            </div>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="danger-btn-delete"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0d1f1c',
            border: '1.5px solid #f85149',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ color: '#f85149', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 10px 0' }}>
              ARE YOU ABSOLUTELY SURE?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              This will permanently delete your user account, transcript history, and profile records. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="danger-btn-delete"
                style={{ padding: '9px 18px' }}
              >
                {isDeleting ? 'DELETING...' : 'YES, DELETE ACCOUNT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
