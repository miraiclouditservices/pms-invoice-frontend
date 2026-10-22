'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import Link from 'next/link';

// Chart.js imports & registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeProperty, properties, switchProperty } = useAuth();
  const [data, setData] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard Filters
  const [dateRange, setDateRange] = useState('month');
  const [selectedBuilding, setSelectedBuilding] = useState('');

  const primaryRole = user?.primaryRole?.toUpperCase() || (user?.isPlatformAdmin ? 'PLATFORM_OWNER' : 'VIEWER');
  const isPlatformOwner = user?.isPlatformAdmin || primaryRole === 'PLATFORM_OWNER';

  const loadDashboard = async () => {
    if (primaryRole === 'TAX_INVOICE_USER') {
      router.replace('/invoices/dashboard');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const endpoint = isPlatformOwner
        ? '/platform/dashboard'
        : `/properties/dashboard?role=${primaryRole}${selectedBuilding ? `&buildingId=${selectedBuilding}` : ''}&range=${dateRange}`;

      const [dashRes, bldgRes] = await Promise.all([
        apiClient.get(endpoint),
        !isPlatformOwner ? apiClient.get('/structure/buildings') : Promise.resolve({ data: { success: true, data: [] } })
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data.data);
      }
      if (bldgRes.data?.success) {
        setBuildings(bldgRes.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load live dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?._id, activeProperty?._id, primaryRole, selectedBuilding, dateRange]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Loading live role-specific dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-octagon-fill fs-5"></i>
          <div>{error}</div>
        </div>
        <button onClick={loadDashboard} className="btn btn-outline-danger btn-sm">
          Retry
        </button>
      </div>
    );
  }

  const summaryCards = data?.summaryCards || [];
  const quickActions = data?.quickActions || [];
  const charts = data?.charts || {};
  const recent = data?.recentActivities || {};

  // Palette constants matching enterprise architectural theme
  const chartColors = {
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    secondary: '#64748B',
    slate: '#334155',
    teal: '#14B8A6'
  };

  // 1. Occupancy or Property Types Doughnut
  const occupancyChartData = isPlatformOwner
    ? {
        labels: charts.propertyTypes?.labels || ['Residential', 'Commercial', 'Coworking'],
        datasets: [
          {
            data: charts.propertyTypes?.data || [1, 1, 1],
            backgroundColor: [chartColors.primary, chartColors.teal, chartColors.warning],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        ]
      }
    : {
        labels: charts.occupancy?.labels || ['Occupied', 'Vacant', 'Reserved', 'Maintenance'],
        datasets: [
          {
            data: charts.occupancy?.data || [10, 2, 1, 0],
            backgroundColor: [chartColors.success, chartColors.secondary, chartColors.primary, chartColors.danger],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        ]
      };

  // 2. Collections / Revenue Bar Chart
  const collectionsChartData = isPlatformOwner
    ? {
        labels: charts.revenueComparison?.labels || ['Total Billed', 'Collected', 'Pending'],
        datasets: [
          {
            label: 'Amount (₹)',
            data: charts.revenueComparison?.data || [0, 0, 0],
            backgroundColor: [chartColors.slate, chartColors.success, chartColors.warning],
            borderRadius: 6
          }
        ]
      }
    : {
        labels: charts.collections?.labels || ['Billed', 'Collected', 'Outstanding'],
        datasets: [
          {
            label: 'Amount (₹)',
            data: charts.collections?.data || [0, 0, 0],
            backgroundColor: [chartColors.slate, chartColors.success, chartColors.warning],
            borderRadius: 6
          }
        ]
      };

  // 3. Complaints Status / SLA Doughnut
  const complaintsChartData = {
    labels: charts.complaints?.labels || ['Open', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: charts.complaints?.data || [1, 1, 2],
        backgroundColor: [chartColors.danger, chartColors.warning, chartColors.success],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  // 4. Activity / Visitors Trend Line Chart
  const visitorTrendData = {
    labels: ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM'],
    datasets: [
      {
        label: 'Gate Passes / Visitors',
        data: [2, 7, 14, 9, 18, 11, 4],
        fill: true,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        tension: 0.35,
        pointRadius: 3
      }
    ]
  };

  return (
    <div>
      {/* 1. Dashboard Header & Filter Toolbar */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between mb-4 pb-3 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0" style={{ color: '#1E242E' }}>
              {isPlatformOwner ? 'Platform Governance Overview' : `${activeProperty?.name || 'Enterprise'} Dashboard`}
            </h2>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2" style={{ fontSize: '0.72rem' }}>
              {primaryRole.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-secondary small mb-0">
            {isPlatformOwner
              ? 'Multi-tenant SaaS metrics, active subscriptions, and enterprise revenue analytics'
              : `Operational status and real-time live metrics for ${activeProperty?.propertyType || 'Portfolio'}`}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {!isPlatformOwner && properties.length > 1 && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: 160 }}
              value={activeProperty?._id || ''}
              onChange={(e) => switchProperty(e.target.value)}
            >
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
              ))}
            </select>
          )}

          {!isPlatformOwner && buildings.length > 0 && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: 140 }}
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          )}

          <div className="btn-group btn-group-sm">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'quarter', label: 'Quarter' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                className={`btn ${dateRange === r.id ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setDateRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button onClick={loadDashboard} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" title="Refresh Live Data">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {summaryCards.map((card: any, idx: number) => {
          const isUp = card.trend === 'up';
          return (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <Link href={card.href || '#'} className="text-decoration-none text-dark">
                <div className="stats-card h-100 p-3 bg-white border rounded-3 transition hover-shadow">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-secondary small fw-medium text-truncate">{card.title}</span>
                    <div className="rounded-circle p-2 bg-light text-primary d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                      <i className={`bi ${card.icon || 'bi-speedometer'}`}></i>
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1" style={{ color: '#0F172A' }}>{card.value}</h3>
                  <div className="d-flex align-items-center gap-1 small">
                    <span className={`fw-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
                      <i className={`bi ${isUp ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`}></i>
                      {card.changePercent}%
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>vs last period</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* 3. Permitted Quick Actions Row */}
      {quickActions.length > 0 && (
        <div className="pms-card p-3 mb-4 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Permitted Quick Actions
            </span>
            <span className="badge bg-light text-muted border small">Role Scoped</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {quickActions.map((act: any, idx: number) => (
              <Link
                key={idx}
                href={act.href}
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 py-2 px-3 rounded-3"
                style={{ fontSize: '0.85rem' }}
              >
                <i className={`bi ${act.icon}`}></i>
                <span>{act.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. Charts Section */}
      <div className="row g-4 mb-4">
        {/* Left Chart: Occupancy or Org Types */}
        <div className="col-12 col-lg-4">
          <div className="pms-card p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">
                {isPlatformOwner ? 'Property Distribution' : 'Space Occupancy'}
              </h6>
              <span className="badge bg-light text-dark border small">Live DB</span>
            </div>
            <div style={{ height: 230 }} className="d-flex align-items-center justify-content-center">
              <Doughnut
                data={occupancyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Center Chart: Revenue / Collection Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="pms-card p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">
                {isPlatformOwner ? 'Subscription Invoicing' : 'Collection Breakdown'}
              </h6>
              <span className="badge bg-light text-dark border small">Invoices API</span>
            </div>
            <div style={{ height: 230 }}>
              <Bar
                data={collectionsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Chart: Complaint SLA or Category */}
        <div className="col-12 col-lg-4">
          <div className="pms-card p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">
                {isPlatformOwner ? 'Organisation Status' : 'Ticket SLA Status'}
              </h6>
              <span className="badge bg-light text-dark border small">Tickets API</span>
            </div>
            <div style={{ height: 230 }} className="d-flex align-items-center justify-content-center">
              <Doughnut
                data={isPlatformOwner ? {
                  labels: charts.orgStatus?.labels || ['Active', 'Suspended', 'Pending'],
                  datasets: [{
                    data: charts.orgStatus?.data || [2, 0, 0],
                    backgroundColor: [chartColors.success, chartColors.danger, chartColors.warning],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                  }]
                } : complaintsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Visitor Trend & Recent Operational Records */}
      <div className="row g-4">
        {/* Visitor Activity Trend Chart */}
        <div className="col-12 col-lg-6">
          <div className="pms-card p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold mb-0">Hourly Visitor & Security Traffic</h6>
                <small className="text-muted">Gate activity throughout the day</small>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle small">
                Live Gate
              </span>
            </div>
            <div style={{ height: 240 }}>
              <Line
                data={visitorTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities & Audit Table */}
        <div className="col-12 col-lg-6">
          <div className="pms-card p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">Recent Operational Events</h6>
              <Link href="/reports" className="small text-decoration-none">
                View Full Logs &rarr;
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Item #</th>
                    <th>Type / Title</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.complaints && recent.complaints.length > 0 ? (
                    recent.complaints.map((c: any) => (
                      <tr key={c._id}>
                        <td className="fw-semibold text-primary">{c.complaintNumber}</td>
                        <td className="text-truncate" style={{ maxWidth: 160 }}>{c.title || c.category}</td>
                        <td>
                          <span className={`badge ${c.status === 'RESOLVED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : recent.visitors && recent.visitors.length > 0 ? (
                    recent.visitors.map((v: any) => (
                      <tr key={v._id}>
                        <td className="fw-semibold text-primary">{v.visitorPassNumber || 'PASS'}</td>
                        <td>{v.visitorName} ({v.purpose})</td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary">{v.status}</span>
                        </td>
                        <td className="text-muted small">Today</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">No recent events logged</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
