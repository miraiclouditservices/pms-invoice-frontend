'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { CustomCursor } from '../components/common/CustomCursor';

export default function LandingPage() {
  const { user } = useAuth();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Cloud Services',
    message: ''
  });

  const [directForm, setDirectForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Cloud Services',
    message: ''
  });
  const [directSubmitted, setDirectSubmitted] = useState(false);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectSubmitted(true);
    setTimeout(() => {
      setDirectSubmitted(false);
      setDirectForm({ name: '', email: '', phone: '', service: 'Cloud Services', message: '' });
    }, 3500);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteModalOpen(false);
      setQuoteForm({ name: '', email: '', phone: '', service: 'Cloud Services', message: '' });
    }, 2000);
  };

  return (
    <div className="min-vh-100 bg-white text-dark d-flex flex-column" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Animated Interactive Custom Cursor matching uploaded image */}
      <CustomCursor />

      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky-top bg-white border-bottom border-light-subtle shadow-xs z-3" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="container-xl d-flex align-items-center justify-content-between py-3 px-3 px-md-4">
          {/* Brand Logo */}
          <Link href="/" className="d-flex align-items-center gap-2.5 text-decoration-none">
            <div className="d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
              {/* Mirai Stylized M Geometric Logo */}
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 28L13 10L18 20L23 10L30 28" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="18" cy="8" r="3" fill="#2563EB" />
              </svg>
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold text-dark lh-1" style={{ fontSize: '1.2rem', letterSpacing: '-0.02em', fontFamily: "'Poppins', sans-serif" }}>
                Mirai Cloud
              </span>
              <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                IT SERVICES
              </span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="d-none d-md-flex align-items-center gap-4">
            <a href="#about" className="text-secondary fw-semibold text-decoration-none small hover-primary transition">About Us</a>
            <a href="#services" className="text-secondary fw-semibold text-decoration-none small hover-primary transition">Services</a>
            <a href="#products" className="text-secondary fw-semibold text-decoration-none small hover-primary transition">Products</a>
            <a href="#why-us" className="text-secondary fw-semibold text-decoration-none small hover-primary transition">Why Us</a>
            <a href="#contact" className="text-secondary fw-semibold text-decoration-none small hover-primary transition">Contact</a>
          </nav>

          {/* Login Button (Black Pill with Arrow) */}
          <div className="d-flex align-items-center gap-2">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="btn btn-dark rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold shadow-sm"
              style={{ fontSize: '0.88rem', backgroundColor: '#000000', borderColor: '#000000' }}
            >
              <span>{user ? 'Dashboard' : 'Login'}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH ENGINEERING GRID BACKGROUND */}
      <section
        className="position-relative py-5 py-lg-6 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(226, 232, 240, 0.75) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.75) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          backgroundPosition: 'center top'
        }}
      >
        <div className="container-xl position-relative z-1 py-3 py-md-4">
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-12 col-lg-6">
              {/* Leader Badge */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary fw-bold mb-3.5" style={{ fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                <span className="rounded-circle bg-primary" style={{ width: 6, height: 6 }}></span>
                <span>LEADER IN IT SERVICES</span>
              </div>

              {/* Main Headline */}
              <p className="fw-bolder text-dark mb-3" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.35rem)', lineHeight: 1.25, letterSpacing: '-0.02em', fontFamily: "'Poppins', sans-serif" }}>
                Empowering Businesses with Cloud, Cybersecurity &amp; IT Infrastructure Solutions
              </p>

              {/* Description */}
              <p className="text-secondary mb-4" style={{ fontSize: '1.08rem', lineHeight: 1.6, maxWidth: '540px' }}>
                We design, secure and manage the digital foundations that help organisations scale with confidence.
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4 pb-2">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(true)}
                  className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold d-inline-flex align-items-center gap-2 shadow"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', fontSize: '0.95rem' }}
                >
                  <span>Get a Quote</span>
                  <span>&#x2197;</span>
                </button>

                <a
                  href="#contact"
                  className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-semibold d-inline-flex align-items-center gap-2 bg-white"
                  style={{ borderColor: '#E2E8F0', color: '#0F172A', fontSize: '0.95rem' }}
                >
                  <i className="bi bi-telephone text-secondary"></i>
                  <span>Contact Us</span>
                </a>
              </div>

              {/* Key Features Pill Checks */}
              <div className="d-flex flex-wrap align-items-center gap-3 gap-md-4 pt-1">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-xs" style={{ width: 20, height: 20, fontSize: '0.65rem' }}>
                    <i className="bi bi-check-lg fw-bold"></i>
                  </div>
                  <span className="fw-semibold text-dark small">24/7 Support</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-xs" style={{ width: 20, height: 20, fontSize: '0.65rem' }}>
                    <i className="bi bi-check-lg fw-bold"></i>
                  </div>
                  <span className="fw-semibold text-dark small">Enterprise Security</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-xs" style={{ width: 20, height: 20, fontSize: '0.65rem' }}>
                    <i className="bi bi-check-lg fw-bold"></i>
                  </div>
                  <span className="fw-semibold text-dark small">Scalable Solutions</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image & Floating Badges */}
            <div className="col-12 col-lg-6">
              <div className="position-relative mx-auto" style={{ maxWidth: '520px' }}>
                {/* Main Server Graphic Container */}
                <div className="overflow-hidden shadow-2xl border border-light" style={{ borderRadius: '24px', backgroundColor: '#0B132B' }}>
                  <img
                    src="https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg"
                    alt="High performance cloud servers and IT infrastructure"
                    className="w-100 object-fit-cover d-block"
                    style={{ height: '420px', filter: 'contrast(1.05)' }}
                  />
                </div>

                {/* Top-Right Badge: Security Protected */}
                <div
                  className="position-absolute px-3 py-1.5 rounded-pill d-flex align-items-center gap-2 shadow"
                  style={{
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <i className="bi bi-shield-check text-primary"></i>
                  <span>Security Protected</span>
                </div>

                {/* Floating Bottom Card: Infrastructure Status */}
                <div
                  className="position-absolute p-3 rounded-3 shadow-xl"
                  style={{
                    bottom: '24px',
                    left: '24px',
                    width: 'calc(100% - 48px)',
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                      INFRASTRUCTURE STATUS
                    </span>
                    <span className="rounded-circle bg-success shadow" style={{ width: 8, height: 8, animation: 'pulse 2s infinite' }}></span>
                  </div>
                  <div className="fw-bold text-white mb-2" style={{ fontSize: '0.96rem' }}>
                    All systems operational
                  </div>
                  {/* Glowing Progress Bar */}
                  <div className="progress rounded-pill mb-2" style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="progress-bar bg-success rounded-pill" role="progressbar" style={{ width: '100%' }}></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.74rem' }}>
                    <span>Uptime</span>
                    <span className="text-success fw-bold">99.99%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT MIRAI SECTION */}
      <section id="about" className="py-5 py-lg-6 bg-white border-top">
        <div className="container-xl py-4">
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-12 col-lg-6">
              <span className="text-primary fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>
                ABOUT MIRAI
              </span>
              <h2 className="fw-bolder text-dark mt-2 mb-3" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.95rem)', lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>
                Helping businesses move confidently into what&apos;s next.
              </h2>
              <p className="text-secondary mb-4" style={{ fontSize: '1.02rem', lineHeight: 1.65 }}>
                Mirai Cloud IT Services is a trusted technology partner delivering secure, intelligent and scalable infrastructure for businesses across India.
              </p>

              {/* Vision & Mission Cards */}
              <div className="row g-3 pt-2">
                {/* Vision Card */}
                <div className="col-12 col-sm-6">
                  <div className="p-3.5 rounded-3 border bg-light bg-opacity-40 h-100 transition hover-shadow">
                    <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 40, height: 40 }}>
                      <i className="bi bi-eye fs-5"></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Our Vision</h5>
                    <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>
                      To shape a more connected, secure and efficient digital future.
                    </p>
                  </div>
                </div>

                {/* Mission Card */}
                <div className="col-12 col-sm-6">
                  <div className="p-3.5 rounded-3 border bg-light bg-opacity-40 h-100 transition hover-shadow">
                    <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 40, height: 40 }}>
                      <i className="bi bi-bullseye fs-5"></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Our Mission</h5>
                    <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>
                      To empower businesses with technology that works seamlessly every day.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Team Collaboration Photo */}
            <div className="col-12 col-lg-6">
              <div className="position-relative mx-auto" style={{ maxWidth: '520px' }}>
                <div className="overflow-hidden shadow-lg border" style={{ borderRadius: '24px' }}>
                  <img
                    src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1280"
                    alt="Mirai Cloud technical experts collaborating"
                    className="w-100 object-fit-cover d-block"
                    style={{ height: '380px' }}
                  />
                </div>

                {/* Floating Badge: Expert-led delivery */}
                <div
                  className="position-absolute bg-white p-3 rounded-3 shadow-lg border d-flex align-items-center gap-3"
                  style={{ bottom: '24px', left: '24px', maxWidth: '300px' }}
                >
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44 }}>
                    <i className="bi bi-people-fill fs-5"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Expert-led delivery</div>
                    <div className="text-muted" style={{ fontSize: '0.74rem' }}>Strategy. Build. Support.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES SECTION */}
      <section id="services" className="py-5 py-lg-6 bg-light bg-opacity-50 border-top">
        <div className="container-xl py-4">
          {/* Header */}
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 fw-bold text-uppercase mb-2" style={{ fontSize: '0.74rem', letterSpacing: '0.04em' }}>
              OUR SERVICES
            </span>
            <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.5rem)', fontFamily: "'Poppins', sans-serif" }}>
              Technology solutions built for resilience and scale.
            </h2>
            <p className="text-secondary small" style={{ fontSize: '1rem' }}>
              From cloud migration to cybersecurity and managed IT, we help businesses modernise with confidence.
            </p>
          </div>

          {/* 8 Services Cards Grid */}
          <div className="row g-4">
            {/* 1. Cloud Services */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-cloud-arrow-up fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Cloud Services</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Secure, scalable cloud strategies for migration, hosting and optimisation.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Network Infrastructure */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-diagram-3 fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Network Infrastructure</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Reliable connectivity, switching, routing and enterprise network design.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Cybersecurity */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-shield-check fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Cybersecurity</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Threat protection, monitoring and security frameworks for modern teams.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Data Center Solutions */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-hdd-rack fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Data Center Solutions</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  High-performance infrastructure planning, deployment and operations.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Business Communication */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-telephone fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Business Communication</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Unified communication systems that keep your teams connected.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 6. CCTV & Surveillance */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-camera-video fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>CCTV &amp; Surveillance</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Smart surveillance and monitoring systems for safer workplaces.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 7. IT Support & AMC */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-tools fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>IT Support &amp; AMC</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Responsive support and preventive maintenance for business continuity.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* 8. Website Development */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 p-4 bg-white transition hover-shadow hover-translate">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3.5" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-display fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Website Development</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.55 }}>
                  Modern, responsive digital experiences built around your business goals.
                </p>
                <div>
                  <span className="rounded-circle border d-inline-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE ADVANTAGES: WHY BUSINESSES CHOOSE MIRAI CLOUDIT SERVICES */}
      <section id="why-us" className="py-5 py-lg-6 bg-white border-top">
        <div className="container-xl py-4">
          {/* Header */}
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '820px' }}>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border text-dark fw-bold mb-3 shadow-2xs" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              <span className="rounded-circle bg-dark" style={{ width: 6, height: 6 }}></span>
              <span>CORE ADVANTAGES</span>
            </div>
            <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)', fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
              Why Businesses Choose Mirai CloudIT SERVICES
            </h2>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.98rem' }}>
              Engineered from the ground up for speed, security, elegance, and enterprise scalability.
            </p>
          </div>

          {/* 10 Core Advantage Cards in 2 Columns */}
          <div className="row g-3 g-md-4">
            {/* 1. AI Powered */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        <path d="M5 3v4" /><path d="M19 17v4" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>AI Powered</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Smart Copilot
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Built-in predictive intelligence for payment risks, maintenance schedule alerts, and automated workflow dispatch.
                </p>
              </div>
            </div>

            {/* 2. Cloud Based */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Cloud Based</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    99.99% Uptime
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Access your property data securely from any browser or smartphone worldwide with multi-region backup.
                </p>
              </div>
            </div>

            {/* 3. Modern UI */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Modern UI</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Zero Training
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Intuitive, clean interface designed for effortless navigation by staff, managers, owners, and tenants alike.
                </p>
              </div>
            </div>

            {/* 4. Real Time Analytics */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 3 7 7 4-4 7 7" /><path d="M17 6h4v4" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Real Time Analytics</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Live Insights
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Instant live dashboards tracking rental revenue, occupancy heatmaps, open SLA tickets, and visitor flow.
                </p>
              </div>
            </div>

            {/* 5. Role Based Access */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Role Based Access</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Granular Controls
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Customize strict security roles and data permissions for super admins, floor managers, accounting, and staff.
                </p>
              </div>
            </div>

            {/* 6. Secure Architecture */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Secure Architecture</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Bank-Grade Encryption
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  256-bit AES encryption in transit and at rest, SOC2 compliance, and automated daily data snapshots.
                </p>
              </div>
            </div>

            {/* 7. Mobile First */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Mobile First</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    iOS &amp; Android
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Full-featured mobile apps for staff check-ins, gate passes, maintenance tickets, and owner approvals on the go.
                </p>
              </div>
            </div>

            {/* 8. Fast Performance */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Fast Performance</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    &lt; 50ms Latency
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  High-speed database indexing engineered to process millions of transactions smoothly at lightning speed.
                </p>
              </div>
            </div>

            {/* 9. Scalable Infrastructure */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="6" height="6" x="9" y="3" rx="1" /><rect width="6" height="6" x="2" y="15" rx="1" /><rect width="6" height="6" x="16" y="15" rx="1" /><path d="M12 9v3" /><path d="M5 15v-1a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>Scalable Infrastructure</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Unlimited Growth
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  Seamlessly expand from managing a single commercial building to thousands of units across global markets.
                </p>
              </div>
            </div>

            {/* 10. API Ready */}
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-white border rounded-4 p-4 shadow-sm transition hover-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 26, height: 26 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>API Ready</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-semibold" style={{ fontSize: '0.75rem', borderColor: '#CBD5E1' }}>
                    Webhooks &amp; Sync
                  </span>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, fontSize: '0.88rem' }}>
                  REST APIs and webhooks to integrate effortlessly with your accounting tools, ERPs, and IoT turnstiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROBLEMS WE SOLVE (BEFORE VS AFTER MIRAI COMPARISON) */}
      <section id="problems" className="py-5 py-lg-6 bg-light bg-opacity-40 border-top">
        <div className="container-xl py-4">
          {/* Header */}
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '720px' }}>
            <div className="d-inline-flex align-items-center px-3 py-1.5 rounded-pill bg-white border text-dark small fw-bold mb-3 shadow-xs" style={{ fontSize: '0.78rem', letterSpacing: '0.04em' }}>
              <span className="rounded-circle bg-primary me-2" style={{ width: 7, height: 7, display: 'inline-block' }}></span>
              <span>PROBLEMS WE SOLVE</span>
            </div>
            <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)', fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
              Stop Managing Your Business with Multiple Apps
            </h2>
            <p className="text-secondary small mb-0" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
              Replace disconnected spreadsheets, messaging groups, and legacy tools with one intelligent ecosystem.
            </p>
          </div>

          {/* Comparison Cards Row */}
          <div className="row g-4 g-lg-5">
            {/* Left Card: BEFORE MIRAI */}
            <div className="col-12 col-lg-6">
              <div className="p-4 p-md-5 rounded-4 border h-100 shadow-sm" style={{ backgroundColor: '#FFF5F5', borderColor: '#FECACA' }}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                  <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: 36, height: 36 }}>
                    <i className="bi bi-x-lg fw-bold" style={{ fontSize: '0.95rem' }}></i>
                  </div>
                  <div>
                    <h5 className="fw-bolder text-danger mb-0" style={{ letterSpacing: '0.02em', fontSize: '1.15rem' }}>BEFORE MIRAI</h5>
                    <span className="text-secondary small" style={{ fontSize: '0.82rem' }}>Chaotic, manual &amp; disconnected operations</span>
                  </div>
                </div>

                {/* 8 Problems list */}
                <div className="d-flex flex-column gap-3">
                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Excel Sheets &amp; Disjointed Spreadsheets</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Data fragmentation across teams</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>WhatsApp Messages &amp; Unstructured Group Chats</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Missed requests &amp; security risks</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Paper Registers &amp; Manual Logbooks</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Zero audit trail or real-time visibility</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Multiple Expensive Disconnected Software</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Siloed subscriptions &amp; double-data entry</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Lost Sales Leads &amp; Delayed Follow-ups</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Revenue leakage across sales funnel</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Manual Attendance &amp; Buddy Punching</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Payroll inaccuracies &amp; attendance fraud</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Paper Visitor Registers at Security Gate</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Unverified visitor entries &amp; security gaps</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#FECACA', padding: '13px 18px', gap: '14px' }}>
                    <i className="bi bi-x-circle-fill text-danger flex-shrink-0 mt-0.5" style={{ fontSize: '1.15rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>Complaint Delays &amp; SLA Breaches</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Frustrated tenants &amp; unresolved tickets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: AFTER MIRAI */}
            <div className="col-12 col-lg-6">
              <div className="p-4 p-md-5 rounded-4 border h-100 shadow-sm" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(22, 163, 74, 0.25)' }}>
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: 36, height: 36 }}>
                    <i className="bi bi-check-lg fw-bold" style={{ fontSize: '1.05rem' }}></i>
                  </div>
                  <div>
                    <h5 className="fw-bolder text-success mb-0" style={{ letterSpacing: '0.02em', fontSize: '1.15rem' }}>AFTER MIRAI</h5>
                    <span className="text-secondary small" style={{ fontSize: '0.82rem' }}>Unified, automated &amp; AI-powered efficiency</span>
                  </div>
                </div>

                {/* 6 Solutions list */}
                <div className="d-flex flex-column gap-3">
                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#BBF7D0', padding: '15px 18px', gap: '14px' }}>
                    <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.35 }}>One Unified Login &amp; Master Portal</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Single login for all properties &amp; modules</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#BBF7D0', padding: '15px 18px', gap: '14px' }}>
                    <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.35 }}>One Real-Time Business Dashboard</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Instant high-level analytics &amp; insights</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#BBF7D0', padding: '15px 18px', gap: '14px' }}>
                    <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.35 }}>One Mobile App for Admin &amp; Tenants</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Seamless iOS &amp; Android mobile accessibility</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#BBF7D0', padding: '15px 18px', gap: '14px' }}>
                    <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.35 }}>AI Automation &amp; Predictive Workflows</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Smart copilot alerts &amp; auto dispatch</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#BBF7D0', padding: '15px 18px', gap: '14px' }}>
                    <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.35 }}>Live Financial &amp; Audit Reports</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>1-Click P&amp;L, Excel &amp; compliance exports</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-3 d-flex align-items-start shadow-xs transition hover-shadow" style={{ borderColor: '#BBF7D0', padding: '15px 18px', gap: '14px' }}>
                    <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <strong className="text-dark d-block" style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.35 }}>Complete Visibility Across Locations</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block', marginTop: '3px' }}>Unified operational governance in real-time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INDUSTRIES WE EMPOWER */}
      <section id="products" className="py-5 py-lg-6 bg-light bg-opacity-40 border-top">
        <div className="container-xl py-4">
          {/* Header */}
          <div className="row align-items-end mb-5 g-3">
            <div className="col-12 col-md-7">
              <span className="text-primary fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>
                INDUSTRIES WE EMPOWER
              </span>
              <h2 className="fw-bolder text-dark mt-2 mb-0" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.95rem)', lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>
                Built around the way your industry works.
              </h2>
            </div>
            <div className="col-12 col-md-5">
              <p className="text-secondary small mb-0" style={{ fontSize: '0.96rem', lineHeight: 1.6 }}>
                Every sector has different operational realities. We shape infrastructure, security and collaboration systems around yours.
              </p>
            </div>
          </div>

          {/* 4 Industry Cards */}
          <div className="row g-4">
            {/* 01 Manufacturing */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 overflow-hidden bg-white shadow-sm transition hover-shadow hover-translate">
                <div className="position-relative" style={{ height: '175px' }}>
                  <img
                    src="/landing/industry-manufacturing.jpg"
                    alt="Manufacturing industry automation"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="p-3.5 p-md-4">
                  <span className="fw-bolder text-primary small d-block mb-1">01</span>
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>Manufacturing</h5>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>
                    Connected plants, secure networks and real-time operational visibility.
                  </p>
                </div>
              </div>
            </div>

            {/* 02 Education */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 overflow-hidden bg-white shadow-sm transition hover-shadow hover-translate">
                <div className="position-relative" style={{ height: '175px' }}>
                  <img
                    src="/landing/industry-education.jpg"
                    alt="Education campuses cloud systems"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="p-3.5 p-md-4">
                  <span className="fw-bolder text-primary small d-block mb-1">02</span>
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>Education</h5>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>
                    Smarter campuses with Wi-Fi, cloud tools and safer learning environments.
                  </p>
                </div>
              </div>
            </div>

            {/* 03 Healthcare */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 overflow-hidden bg-white shadow-sm transition hover-shadow hover-translate">
                <div className="position-relative" style={{ height: '175px' }}>
                  <img
                    src="/landing/industry-healthcare.jpg"
                    alt="Healthcare hospital emergency infrastructure"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="p-3.5 p-md-4">
                  <span className="fw-bolder text-primary small d-block mb-1">03</span>
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>Healthcare</h5>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>
                    Protected data, resilient systems and communication that never misses a beat.
                  </p>
                </div>
              </div>
            </div>

            {/* 04 Banking & Finance */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border rounded-4 overflow-hidden bg-white shadow-sm transition hover-shadow hover-translate">
                <div className="position-relative" style={{ height: '175px' }}>
                  <img
                    src="/landing/industry-finance.jpg"
                    alt="Banking and finance security systems"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="p-3.5 p-md-4">
                  <span className="fw-bolder text-primary small d-block mb-1">04</span>
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>Banking &amp; Finance</h5>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>
                    Secure infrastructure and continuity-focused systems for critical operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT US SECTION (EXACT REPLICA OF IMAGE 2) */}
      <section id="contact" className="py-5 py-lg-6 bg-white border-top">
        <div className="container-xl py-2 py-md-4">
          <div className="row g-5 align-items-start">
            {/* Left Column: Contact details + Map */}
            <div className="col-12 col-lg-5">
              <span className="text-primary fw-bold text-uppercase small d-inline-block mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
                CONTACT US
              </span>
              <h2 className="fw-bolder text-dark mb-3" style={{ fontSize: 'clamp(1.55rem, 2.3vw, 2rem)', fontFamily: "'Poppins', sans-serif", lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Let&apos;s build smarter infrastructure together.
              </h2>
              <p className="text-secondary mb-4" style={{ fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '440px' }}>
                Tell us about your goals and our team will help you find the right technology path forward.
              </p>

              {/* Contact Details List */}
              <div className="d-flex flex-column gap-3.5 mb-4">
                {/* Email */}
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5" style={{ width: 42, height: 42 }}>
                    <i className="bi bi-envelope fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Email</span>
                    <a href="mailto:info@miraiclouditservices.com" className="fw-semibold text-dark text-decoration-none hover-primary" style={{ fontSize: '0.94rem' }}>
                      info@miraiclouditservices.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5" style={{ width: 42, height: 42 }}>
                    <i className="bi bi-telephone fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Phone</span>
                    <a href="tel:+919100218218" className="fw-semibold text-dark text-decoration-none hover-primary" style={{ fontSize: '0.94rem' }}>
                      +91 91002 18218
                    </a>
                  </div>
                </div>

                {/* Office */}
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5" style={{ width: 42, height: 42 }}>
                    <i className="bi bi-geo-alt fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Office</span>
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>
                      Kalki chambers A Block 108, NH 65, widia colony Miyapur, Hyderabad, India, 502032
                    </span>
                  </div>
                </div>
              </div>

              {/* Miyapur Map Container with Open in Maps button */}
              <div className="position-relative rounded-4 border overflow-hidden shadow-2xs" style={{ height: '190px' }}>
                <a
                  href="https://maps.google.com/?q=Kalki+chambers+A+Block+108+NH+65+widia+colony+Miyapur+Hyderabad+502032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-light border bg-white rounded-2 position-absolute shadow-sm d-inline-flex align-items-center gap-1.5 fw-semibold"
                  style={{ top: 12, left: 12, zIndex: 5, fontSize: '0.75rem', color: '#1D4ED8', textDecoration: 'none' }}
                >
                  <span>Open in Maps</span>
                  <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }}></i>
                </a>
                <iframe
                  title="Mirai Cloud IT Services Miyapur Location"
                  src="https://maps.google.com/maps?q=Kalki+chambers+Miyapur+Hyderabad&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* Right Column: Request a consultation form */}
            <div className="col-12 col-lg-7">
              <div className="card border rounded-4 p-4 p-md-5 bg-white shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.45rem', fontFamily: "'Poppins', sans-serif" }}>
                  Request a consultation
                </h3>
                <p className="text-secondary small mb-4" style={{ fontSize: '0.9rem' }}>
                  Share a few details and we&apos;ll get back to you shortly.
                </p>

                {directSubmitted ? (
                  <div className="p-4 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-center my-3">
                    <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 44, height: 44 }}>
                      <i className="bi bi-check-lg fs-4 fw-bold"></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">Message Sent Successfully!</h5>
                    <p className="text-secondary small mb-0">Our solution experts will review your requirements and reach out to you within 2 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDirectSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-dark mb-1">Your name</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your name"
                          className="form-control rounded-3 py-2 px-3"
                          style={{ fontSize: '0.9rem', borderColor: '#CBD5E1' }}
                          value={directForm.name}
                          onChange={(e) => setDirectForm({ ...directForm, name: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-dark mb-1">Work email</label>
                        <input
                          type="email"
                          required
                          placeholder="Enter work email"
                          className="form-control rounded-3 py-2 px-3"
                          style={{ fontSize: '0.9rem', borderColor: '#CBD5E1' }}
                          value={directForm.email}
                          onChange={(e) => setDirectForm({ ...directForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-dark mb-1">Phone number</label>
                        <input
                          type="tel"
                          required
                          placeholder="Enter phone number"
                          className="form-control rounded-3 py-2 px-3"
                          style={{ fontSize: '0.9rem', borderColor: '#CBD5E1' }}
                          value={directForm.phone}
                          onChange={(e) => setDirectForm({ ...directForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-dark mb-1">Service interest</label>
                        <select
                          className="form-select rounded-3 py-2 px-3"
                          style={{ fontSize: '0.9rem', borderColor: '#CBD5E1' }}
                          value={directForm.service}
                          onChange={(e) => setDirectForm({ ...directForm, service: e.target.value })}
                        >
                          <option value="Cloud Services">Cloud Services</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                          <option value="Network Infrastructure">Network Infrastructure</option>
                          <option value="Managed IT Support">Managed IT Support</option>
                          <option value="DevOps & Automation">DevOps &amp; Automation</option>
                          <option value="Property Management">Property Management</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-dark mb-1">How can we help?</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us about your requirements..."
                        className="form-control rounded-3 py-2 px-3"
                        style={{ fontSize: '0.9rem', borderColor: '#CBD5E1' }}
                        value={directForm.message}
                        onChange={(e) => setDirectForm({ ...directForm, message: e.target.value })}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                      style={{ backgroundColor: '#2563EB', borderColor: '#2563EB', fontSize: '0.95rem' }}
                    >
                      <span>Send Message</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DARK FOOTER (EXACT REPLICA OF IMAGE 3) */}
      <footer className="py-5 py-md-6 border-top mt-auto" style={{ backgroundColor: '#060B14', color: '#94A3B8' }}>
        <div className="container-xl">
          <div className="row g-4 justify-content-between mb-5">
            {/* Column 1: Brand / Description / Socials */}
            <div className="col-12 col-md-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 28L13 10L18 20L23 10L30 28" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="18" cy="8" r="3" fill="#60A5FA" />
                </svg>
                <span className="fw-bold text-white fs-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Mirai Cloud
                </span>
              </div>
              <p className="small mb-4" style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '280px' }}>
                Secure, scalable and reliable technology solutions for businesses ready to move forward.
              </p>
              {/* Social Icons */}
              <div className="d-flex align-items-center gap-2">
                <a
                  href="https://www.linkedin.com/company/mirai-cloud-it-services/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2 d-inline-flex align-items-center justify-content-center text-decoration-none transition"
                  style={{ width: 34, height: 34, backgroundColor: '#111827', color: '#94A3B8', border: '1px solid #1F2937' }}
                  aria-label="LinkedIn"
                >
                  <i className="bi bi-linkedin" style={{ fontSize: '0.85rem' }}></i>
                </a>
                <a
                  href="https://www.instagram.com/miraicloud_itservices?igsh=MTRqczhxYjFyemx3bQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2 d-inline-flex align-items-center justify-content-center text-decoration-none transition"
                  style={{ width: 34, height: 34, backgroundColor: '#111827', color: '#94A3B8', border: '1px solid #1F2937' }}
                  aria-label="Instagram"
                >
                  <i className="bi bi-instagram" style={{ fontSize: '0.85rem' }}></i>
                </a>
                <a
                  href="https://www.whatsapp.com/channel/0029Vb5ZMnB8fewwm8tvFk2c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2 d-inline-flex align-items-center justify-content-center text-decoration-none transition"
                  style={{ width: 34, height: 34, backgroundColor: '#111827', color: '#94A3B8', border: '1px solid #1F2937' }}
                  aria-label="WhatsApp"
                >
                  <i className="bi bi-whatsapp" style={{ fontSize: '0.85rem' }}></i>
                </a>
              </div>
            </div>

            {/* Column 2: Company */}
            <div className="col-6 col-sm-4 col-md-2">
              <h6 className="fw-bold text-white mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Company
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small mb-0" style={{ fontSize: '0.88rem' }}>
                <li><a href="#" className="text-decoration-none" style={{ color: '#94A3B8' }}>Home</a></li>
                <li><a href="#about" className="text-decoration-none" style={{ color: '#94A3B8' }}>About Us</a></li>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#94A3B8' }}>Services</a></li>
                <li><a href="#products" className="text-decoration-none" style={{ color: '#94A3B8' }}>Products</a></li>
                <li><a href="#why-us" className="text-decoration-none" style={{ color: '#94A3B8' }}>Why Us</a></li>
                <li><a href="#contact" className="text-decoration-none" style={{ color: '#94A3B8' }}>Contact</a></li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="col-6 col-sm-4 col-md-2">
              <h6 className="fw-bold text-white mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Services
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small mb-0" style={{ fontSize: '0.88rem' }}>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#94A3B8' }}>Cloud Services</a></li>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#94A3B8' }}>Cybersecurity</a></li>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#94A3B8' }}>Network Infrastructure</a></li>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#94A3B8' }}>Managed IT Support</a></li>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#94A3B8' }}>DevOps &amp; Automation</a></li>
              </ul>
            </div>

            {/* Column 4: Products */}
            <div className="col-6 col-sm-4 col-md-2">
              <h6 className="fw-bold text-white mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Products
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small mb-0" style={{ fontSize: '0.88rem' }}>
                <li><a href="#products" className="text-decoration-none" style={{ color: '#94A3B8' }}>Property Management</a></li>
                <li><a href="#products" className="text-decoration-none" style={{ color: '#94A3B8' }}>Coworking Space Portal</a></li>
                <li><a href="#products" className="text-decoration-none" style={{ color: '#94A3B8' }}>Visitor &amp; Gate Pass</a></li>
                <li><a href="#products" className="text-decoration-none" style={{ color: '#94A3B8' }}>Employee &amp; Helpdesk</a></li>
                <li><a href="#products" className="text-decoration-none" style={{ color: '#94A3B8' }}>Asset AMC &amp; SLA</a></li>
              </ul>
            </div>

            {/* Column 5: Get in touch */}
            <div className="col-12 col-md-3">
              <h6 className="fw-bold text-white mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Get in touch
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2.5 small mb-0" style={{ fontSize: '0.88rem' }}>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-envelope text-primary flex-shrink-0"></i>
                  <a href="mailto:info@miraiclouditservices.com" className="text-decoration-none" style={{ color: '#94A3B8' }}>
                    info@miraiclouditservices.com
                  </a>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-telephone text-primary flex-shrink-0"></i>
                  <a href="tel:+919100218218" className="text-decoration-none" style={{ color: '#94A3B8' }}>
                    +91 91002 18218
                  </a>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-geo-alt text-primary flex-shrink-0 mt-0.5"></i>
                  <span style={{ color: '#94A3B8', lineHeight: 1.45 }}>
                    Kalki chambers A Block 108, NH 65, widia colony Miyapur, Hyderabad, India, 502032
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Terms */}
          <div className="border-top pt-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2" style={{ borderColor: '#1F2937', color: '#64748B', fontSize: '0.82rem' }}>
            <div>
              &copy; 2026 Mirai Cloud IT Services. All rights reserved.
            </div>
            <div className="d-flex align-items-center gap-3">
              <a href="#contact" className="text-decoration-none" style={{ color: '#64748B' }}>Privacy Policy</a>
              <span>&bull;</span>
              <a href="#contact" className="text-decoration-none" style={{ color: '#64748B' }}>Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 9. GET A QUOTE MODAL */}
      {quoteModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white py-3 px-4">
                <h5 className="modal-title fw-bold">Request a Consultation / Quote</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setQuoteModalOpen(false)}
                ></button>
              </div>

              {quoteSubmitted ? (
                <div className="modal-body text-center py-5">
                  <div className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                    <i className="bi bi-check-circle-fill fs-2"></i>
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Thank You!</h4>
                  <p className="text-secondary small mb-0">Our solutions architect will contact you within 2 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Rajesh Sharma"
                        value={quoteForm.name}
                        onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-dark">Business Email *</label>
                        <input
                          type="email"
                          required
                          className="form-control"
                          placeholder="rajesh@company.com"
                          value={quoteForm.email}
                          onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-dark">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          className="form-control"
                          placeholder="+91 98765 43210"
                          value={quoteForm.phone}
                          onChange={e => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Service of Interest</label>
                      <select
                        className="form-select"
                        value={quoteForm.service}
                        onChange={e => setQuoteForm({ ...quoteForm, service: e.target.value })}
                      >
                        <option value="Cloud Services">Cloud Services &amp; Migration</option>
                        <option value="Network Infrastructure">Network Infrastructure &amp; Wi-Fi</option>
                        <option value="Cybersecurity">Cybersecurity &amp; Threat Defense</option>
                        <option value="Data Center Solutions">Data Center &amp; Storage</option>
                        <option value="Business Communication">Business Communication (VoIP/Email)</option>
                        <option value="CCTV & Surveillance">CCTV &amp; Smart Surveillance</option>
                        <option value="IT Support & AMC">Annual Maintenance Contract (AMC)</option>
                        <option value="Website Development">Custom Website &amp; Portal Development</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-semibold text-dark">Requirements Note</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        placeholder="Tell us about your team size or infrastructure needs..."
                        value={quoteForm.message}
                        onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer bg-light px-4 py-3 border-top">
                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setQuoteModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold">
                      Submit Request &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Landing Styles */}
      <style jsx global>{`
        .hover-primary:hover {
          color: #2563EB !important;
        }
        .hover-shadow:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04) !important;
        }
        .hover-translate {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-translate:hover {
          transform: translateY(-4px);
        }
        .shadow-xs {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .shadow-2xs {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
