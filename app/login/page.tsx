'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
              {/* Email Address Input */}
              <div className="mb-3.5">
                <label
                  htmlFor="login-email"
                  className="form-label d-block mb-1.5 fw-semibold"
                  style={{
                    fontSize: '0.82rem',
                    color: '#334155',
                    letterSpacing: '0.01em'
                  }}
                >
                  Email Address
                </label>
                <div className="position-relative">
                  <span
                    className="position-absolute top-50 translate-middle-y text-secondary d-flex align-items-center justify-content-center pointer-events-none"
                    style={{ left: '14px', width: '20px', height: '20px', color: '#64748B' }}
                  >
                    <i className="bi bi-envelope" style={{ fontSize: '1rem' }}></i>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    className="form-control"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      height: '46px',
                      paddingLeft: '44px',
                      paddingRight: '14px',
                      borderRadius: '12px',
                      borderColor: '#CBD5E1',
                      backgroundColor: '#F8FAFC',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#2563EB';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="mb-3.5">
                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="form-label mb-0 fw-semibold"
                    style={{
                      fontSize: '0.82rem',
                      color: '#334155',
                      letterSpacing: '0.01em'
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('To reset your password, please contact your organization administrator.');
                    }}
                    className="text-decoration-none fw-semibold"
                    style={{
                      fontSize: '0.78rem',
                      color: '#2563EB',
                      transition: 'color 0.15s ease'
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="position-relative">
                  <span
                    className="position-absolute top-50 translate-middle-y text-secondary d-flex align-items-center justify-content-center pointer-events-none"
                    style={{ left: '14px', width: '20px', height: '20px', color: '#64748B' }}
                  >
                    <i className="bi bi-shield-lock" style={{ fontSize: '1rem' }}></i>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="form-control"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      height: '46px',
                      paddingLeft: '44px',
                      paddingRight: '44px',
                      borderRadius: '12px',
                      borderColor: '#CBD5E1',
                      backgroundColor: '#F8FAFC',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      letterSpacing: !showPassword && password ? '0.22em' : 'normal',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#2563EB';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-link position-absolute top-50 translate-middle-y text-muted p-0 d-flex align-items-center justify-content-center text-decoration-none"
                    style={{
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      color: '#64748B'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} style={{ fontSize: '1.05rem', color: '#64748B' }}></i>
                  </button>
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="d-flex align-items-center mb-4 pt-1">
                <div className="form-check d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', borderRadius: '4px' }}
                  />
                  <label className="form-check-label user-select-none mb-0 fw-medium" htmlFor="rememberMe" style={{ color: '#64748B', cursor: 'pointer', fontSize: '0.82rem' }}>
                    Keep me signed in
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-100 text-white d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{
                  backgroundColor: '#0F172A',
                  height: '46px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0F172A')}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
