'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import Link from 'next/link';
import Image from 'next/image';

interface QuickAccount {
  _id: string;
  name: string;
  email: string;
  role: string;
  isPlatformAdmin: boolean;
  orgName: string;
  orgType: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickAccounts, setQuickAccounts] = useState<QuickAccount[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch live accounts from backend API
    const loadQuickAccounts = async () => {
      try {
        const res = await apiClient.get('/auth/quick-accounts');
        if (res.data.success) {
          setQuickAccounts(res.data.data.accounts);
        }
      } catch (err) {
        console.error('Failed to load accounts', err);
      }
    };
    loadQuickAccounts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        const savedUserStr = localStorage.getItem('pms_user');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
        if (savedUser?.primaryRole?.toUpperCase() === 'TAX_INVOICE_USER') {
          router.push('/invoices/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc: QuickAccount) => {
    const pwd = 'Password@123';
    setEmail(acc.email);
    setPassword(pwd);
    setShowRoleModal(false);
    setLoading(true);
    setError('');
    try {
      const success = await login(acc.email, pwd);
      if (success) {
        if (acc.role?.toUpperCase() === 'TAX_INVOICE_USER') {
          router.push('/invoices/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-relative w-100"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#EAF0F6'
      }}
    >
      {/* Top Header Logo (Absolute Positioned, No Scroll impact) */}
      <header
        className="position-absolute"
        style={{
          top: '28px',
          left: 'clamp(20px, 4vw, 48px)',
          zIndex: 10
        }}
      >
        <Link href="/" className="d-flex align-items-center text-decoration-none">
          <Image
            src="/landing/mirai_logo.png"
            alt="Mirai Cloud IT Services"
            width={180}
            height={56}
            style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
            priority
          />
        </Link>
      </header>

      {/* Main Centered / Left Viewport Area (100% Locked Viewport) */}
      <main className="h-100 d-flex align-items-center justify-content-center justify-content-lg-start px-3 px-sm-4 px-md-5">
        <div
          className="w-100 ms-lg-5"
          style={{
            maxWidth: '410px'
          }}
        >
          {/* White Rounded Card */}
          <div
            className="bg-white p-4 p-sm-4 p-md-4"
            style={{
              borderRadius: '26px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.6)'
            }}
          >
            <div className="text-center mb-3">
              <h3
                className="fw-bold mb-1"
                style={{
                  color: '#1E242E',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.65rem',
                  letterSpacing: '-0.02em'
                }}
              >
                Agent Login
              </h3>
              <p className="text-secondary small mb-0" style={{ color: '#8A92A6', fontSize: '0.82rem' }}>
                Please enter your details
              </p>
            </div>

            {error && (
              <div
                className="alert py-2 px-3 mb-3 small d-flex align-items-center gap-2"
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  border: '1px solid #FEE2E2',
                  borderRadius: '10px',
                  fontSize: '0.78rem'
                }}
              >
                <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-3">
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#4B5563'
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="admin@royalpalms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    height: '44px',
                    borderRadius: '10px',
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.88rem',
                    color: '#1F2937'
                  }}
                />
              </div>

              {/* Password Input */}
              <div className="mb-2">
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#4B5563'
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    height: '44px',
                    borderRadius: '10px',
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.88rem',
                    color: '#1F2937',
                    letterSpacing: password ? '0.2em' : 'normal'
                  }}
                />
              </div>

              {/* Forgot Password */}
              <div className="text-end mb-3">
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('To reset credentials, please contact your organization administrator.');
                  }}
                  className="text-decoration-underline"
                  style={{
                    fontSize: '0.78rem',
                    color: '#1F2937',
                    fontWeight: 500
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Slate Charcoal Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-100 text-white d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: '#323946',
                  height: '44px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#232934')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#323946')}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
              {/* Dedicated Tax Invoice Quick Fill Card */}
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('billing@pms.com');
                    setPassword('Password@123');
                  }}
                  className="btn btn-sm w-100 text-start p-2 rounded-3 border transition"
                  style={{
                    backgroundColor: '#F0FDF4',
                    borderColor: '#BBF7D0',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to auto-fill dedicated Tax Invoice credentials"
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26, fontSize: '0.78rem' }}>
                        <i className="bi bi-receipt"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="fw-bold text-success-emphasis text-truncate" style={{ fontSize: '0.78rem' }}>
                          Tax Invoice & Cashfree Suite
                        </div>
                        <div className="text-secondary text-truncate" style={{ fontSize: '0.68rem' }}>
                          billing@pms.com • Password@123
                        </div>
                      </div>
                    </div>
                    <span className="badge bg-success text-white flex-shrink-0" style={{ fontSize: '0.62rem' }}>
                      Auto-Fill
                    </span>
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Below Card Link (Creates NO scroll) */}
          <div className="text-center mt-3">
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              Are you new?{' '}
            </span>
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="btn btn-link p-0 fw-semibold text-decoration-underline"
              style={{
                fontSize: '0.82rem',
                color: '#1F2937'
              }}
            >
              Demo Accounts & Roles
            </button>
          </div>
        </div>
      </main>

      {/* Role Selection Modal (Popup Overlay, Zero Window Scroll) */}
      {showRoleModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
            <div
              className="modal-content border-0 p-3"
              style={{
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}
            >
              <div className="modal-header border-0 pb-1">
                <div>
                  <h6 className="modal-title fw-bold" style={{ color: '#1F2937' }}>
                    1-Click Live Role Switcher
                  </h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                    Select any live database account to test instant login
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRoleModal(false)}
                ></button>
              </div>
              <div className="modal-body py-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="d-flex flex-column gap-2">
                  {quickAccounts.map((acc) => {
                    const isTax = acc.role === 'TAX_INVOICE_USER';
                    return (
                      <button
                        key={acc._id}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className={`btn text-start d-flex align-items-center justify-content-between py-2 px-3 rounded-3 transition ${
                          isTax ? 'border border-success bg-success-subtle shadow-sm' : 'btn-light border-0'
                        }`}
                        style={{
                          fontSize: '0.82rem',
                          backgroundColor: isTax ? '#F0FDF4' : '#F8FAFC'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isTax ? '#DCFCE7' : '#EEF2F6')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isTax ? '#F0FDF4' : '#F8FAFC')}
                      >
                        <div className="overflow-hidden me-2">
                          <div className={`fw-semibold text-truncate ${isTax ? 'text-success-emphasis fw-bold' : 'text-dark'}`}>
                            {acc.name} {isTax && '⭐ (Dedicated Suite)'}
                          </div>
                          <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                            {acc.email} • Password@123
                          </div>
                        </div>
                        <span
                          className={`badge flex-shrink-0 ${isTax ? 'bg-success text-white' : ''}`}
                          style={{
                            backgroundColor: isTax ? undefined : '#E2E8F0',
                            color: isTax ? undefined : '#334155',
                            fontSize: '0.68rem',
                            fontWeight: 600
                          }}
                        >
                          {isTax ? 'Tax & Cashfree' : acc.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer border-0 pt-1">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                  onClick={() => setShowRoleModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
