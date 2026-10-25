'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = (path: string | null) => {
    if (!path) return false;
    return path === '/' || path === '/login' || path.startsWith('/invoices/pay');
  };

  const isPublic = isPublicRoute(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push('/login');
    }
  }, [user, loading, isPublic, router]);

  // Public pages render without the PMS admin sidebar/topbar
  if (isPublic) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 text-secondary fw-semibold">Connecting to PMS Multi-Tenant SaaS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Sidebar />
      <Topbar />
      <main className="pms-main-content flex-grow-1">
        {children}
      </main>
    </div>
  );
};
