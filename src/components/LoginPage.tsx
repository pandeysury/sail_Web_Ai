// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newAccount, setNewAccount] = useState({
    userid: '',
    email: '',
    password: '',
    confirmPassword: '',
    domain: ''
  });

  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userid.trim(),
          password: password.trim(),
          domain: domain.trim(),
          url: `${window.location.origin}/reset-password/`
        }),
      });

      if (!res.ok) throw new Error('Invalid credentials');
      const result = await res.json();
      
      if (result.statusCode === 200 && result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userDomain', domain.trim());
        nav('/chat');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (res.ok) {
        alert('Password reset link sent to your email');
        setShowForgotPassword(false);
        setForgotEmail('');
      } else {
        alert('Email not found');
      }
    } catch (error) {
      alert('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.password !== newAccount.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: newAccount.userid,
          email: newAccount.email,
          password: newAccount.password,
          domain: newAccount.domain
        }),
      });
      if (res.ok) {
        alert('Account created successfully! Please login.');
        setShowCreateAccount(false);
        setNewAccount({ userid: '', email: '', password: '', confirmPassword: '', domain: '' });
      } else {
        // alert('Failed to create account');
      }
    } catch (error) {
      // alert('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- visual cloned from your screenshot ---------- */
  return (
    <div style={page}>
      <div style={card}>
        {/* Blue header */}
        <div style={header}>Login</div>

        {/* White body */}
        <form onSubmit={handleLogin} style={body}>
          <label style={label}>Email / Username</label>
          <input
            style={input}
            placeholder="User Id"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            required
          />

          <label style={label}>Password</label>
          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label style={label}>Domain</label>
          <input
            style={input}
            placeholder="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
          />

          {/* Captcha row */}
          {/* <div style={captchaRow}>
            <span style={captchaLabel}>Captcha</span>
            <span style={captchaText}>{captcha}</span>
          </div>
          <input
            style={input}
            placeholder="Enter captcha"
            required
          /> */}

          <div style={checkRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span style={{ marginLeft: 6 }}>Remember me</span>
          </div>

          <button style={button} type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>

          <div style={links}>
            <button 
              type="button" 
              style={linkButton} 
              onClick={() => setShowForgotPassword(true)}
            >
              🔑 Forgot Password?
            </button>
            <button 
              type="button" 
              style={linkButton} 
              onClick={() => setShowCreateAccount(true)}
            >
              ➕ Create New Account
            </button>
          </div>
        </form>

        <div style={footer}>
          © 2023 - Safe Lanes Innovation Pte Ltd.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <span>🔑 Reset Password</span>
              <button 
                style={closeButton} 
                onClick={() => setShowForgotPassword(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleForgotPassword} style={modalBody}>
              <p style={modalText}>Enter your email to receive a password reset link</p>
              <input
                style={modalInput}
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <div style={modalActions}>
                <button 
                  type="button" 
                  style={cancelButton} 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </button>
                <button style={submitButton} type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <span>➕ Create New Account</span>
              <button 
                style={closeButton} 
                onClick={() => setShowCreateAccount(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAccount} style={modalBody}>
              <input
                style={modalInput}
                placeholder="User ID"
                value={newAccount.userid}
                onChange={(e) => setNewAccount({...newAccount, userid: e.target.value})}
                required
              />
              <input
                style={modalInput}
                type="email"
                placeholder="Email Address"
                value={newAccount.email}
                onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                required
              />
              <input
                style={modalInput}
                placeholder="Domain"
                value={newAccount.domain}
                onChange={(e) => setNewAccount({...newAccount, domain: e.target.value})}
                required
              />
              <input
                style={modalInput}
                type="password"
                placeholder="Password"
                value={newAccount.password}
                onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                required
              />
              <input
                style={modalInput}
                type="password"
                placeholder="Confirm Password"
                value={newAccount.confirmPassword}
                onChange={(e) => setNewAccount({...newAccount, confirmPassword: e.target.value})}
                required
              />
              <div style={modalActions}>
                <button 
                  type="button" 
                  style={cancelButton} 
                  onClick={() => setShowCreateAccount(false)}
                >
                  Cancel
                </button>
                <button style={submitButton} type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- pure inline styles ---------- */
const page: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: '#f3f5f9',
  fontFamily: `'Segoe UI', Roboto, sans-serif`,
};

const card: React.CSSProperties = {
  width: 380,
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 4px 18px rgba(0,0,0,.11)',
  overflow: 'hidden',
};

const header: React.CSSProperties = {
  background: '#1976d2',
  color: '#fff',
  padding: '18px 24px',
  fontSize: 20,
  fontWeight: 600,
};

const body: React.CSSProperties = {
  padding: '24px 30px 12px',
  display: 'flex',
  flexDirection: 'column',
};

const label: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 6,
  fontSize: 14,
  color: '#444',
};

const input: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 15,
  border: '1px solid #ccd2d9',
  borderRadius: 4,
  outline: 'none',
  transition: 'border .2s',
};

// const captchaRow: React.CSSProperties = {
//   display: 'flex',
//   alignItems: 'center',
//   marginTop: 12,
//   marginBottom: 6,
// };

// const captchaLabel: React.CSSProperties = {
//   fontSize: 14,
//   color: '#444',
//   marginRight: 10,
// };

// const captchaText: React.CSSProperties = {
//   fontWeight: 600,
//   letterSpacing: '2px',
//   background: '#eef1f5',
//   padding: '4px 10px',
//   borderRadius: 4,
//   userSelect: 'none',
// };

const checkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 14,
  fontSize: 14,
  color: '#555',
};

const button: React.CSSProperties = {
  marginTop: 22,
  padding: '11px 0',
  fontSize: 16,
  color: '#fff',
  background: '#1976d2',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  transition: 'background .2s',
};

const links: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 14,
  gap: 8,
};

const linkButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#1976d2',
  fontSize: 13,
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: 6,
  transition: 'all 0.2s ease',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
};

const modalCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  width: 420,
  maxWidth: '90vw',
  overflow: 'hidden',
  animation: 'slideIn 0.3s ease',
};

const modalHeader: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
  color: '#fff',
  padding: '20px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 18,
  fontWeight: 600,
};

const closeButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  padding: 4,
  borderRadius: 4,
  opacity: 0.8,
  transition: 'opacity 0.2s',
};

const modalBody: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const modalText: React.CSSProperties = {
  margin: 0,
  color: '#666',
  fontSize: 14,
  lineHeight: 1.5,
};

const modalInput: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 15,
  border: '2px solid #e1e5e9',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit',
};

const modalActions: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 8,
};

const cancelButton: React.CSSProperties = {
  flex: 1,
  padding: '12px 0',
  fontSize: 15,
  color: '#666',
  background: '#f5f5f5',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease',
};

const submitButton: React.CSSProperties = {
  flex: 1,
  padding: '12px 0',
  fontSize: 15,
  color: '#fff',
  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
};

const footer: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 12,
  color: '#888',
  padding: '14px 0 18px',
};