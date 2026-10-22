'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: 'Password@123',
    primaryRole: 'PROPERTY_MANAGER',
    propertyId: ''
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes, propRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/rbac/roles'),
        apiClient.get('/properties')
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (rolesRes.data.success) setRoles(rolesRes.data.data);
      if (propRes.data.success) {
        setProperties(propRes.data.data);
        if (propRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, propertyId: propRes.data.data[0]._id }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/users', formData);
      if (res.data.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await apiClient.put(`/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating user status');
    }
  };

  const filteredUsers = users.filter(u => {
    const query = search.toLowerCase();
    const matchesSearch =
      (u.firstName && u.firstName.toLowerCase().includes(query)) ||
      (u.lastName && u.lastName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.mobile && u.mobile.includes(query));
    const matchesRole = !roleFilter || u.primaryRole === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Users & Staff Directory</h2>
          <p className="text-secondary mb-0 small">Manage platform administrators, managers, supervisors, security guards, and technicians</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-person-plus"></i> Add User
        </button>
      </div>

      <div className="pms-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="PLATFORM_OWNER">Platform Owner</option>
              <option value="ORGANISATION_ADMIN">Organisation Admin</option>
              <option value="PROPERTY_MANAGER">Property Manager</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="FACILITY_MANAGER">Facility Manager</option>
              <option value="SECURITY_GUARD">Security Guard</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end text-muted small">
            Total: <strong>{filteredUsers.length}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No Users Found"
          message="No user accounts match your search parameters."
          actionText="Add New User"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="pms-card table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Assigned Property</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div className="fw-semibold">{u.firstName} {u.lastName}</div>
                        <div className="text-muted small">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{u.primaryRole}</span>
                  </td>
                  <td>
                    <span className="text-muted small">{u.propertyId?.name || 'All Properties'}</span>
                  </td>
                  <td>{u.mobile || '-'}</td>
                  <td>
                    <span className={`badge ${
                      u.status === 'ACTIVE'
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-danger-subtle text-danger border border-danger-subtle'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2`}
                      onClick={() => handleStatusToggle(u._id, u.status)}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Platform / Staff User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Initial Password</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Role *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.primaryRole}
                        onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                      >
                        <option value="PROPERTY_MANAGER">Property Manager</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="FACILITY_MANAGER">Facility Manager</option>
                        <option value="SECURITY_GUARD">Security Guard</option>
                        <option value="ORGANISATION_ADMIN">Organisation Admin</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assigned Property</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.propertyId}
                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                      >
                        <option value="">All Properties (Global)</option>
                        {properties.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Create User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
