'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleRes, permRes] = await Promise.all([
        apiClient.get('/rbac/roles'),
        apiClient.get('/rbac/permissions')
      ]);
      if (roleRes.data.success) setRoles(roleRes.data.data);
      if (permRes.data.success) setPermissions(permRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Dynamic Roles & Access Control Matrix</h2>
          <p className="text-secondary mb-0 small">Scope-based role configurations, permission actions, and user privilege matrices</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Roles List */}
        <div className="col-lg-7">
          <div className="pms-card p-3">
            <h5 className="fw-bold mb-3">Configured Roles ({roles.length})</h5>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Role Name & Code</th>
                      <th>Scope Level</th>
                      <th>Property Target</th>
                      <th>Permissions</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div className="fw-semibold text-dark">{r.roleName}</div>
                          <small className="text-muted">Code: {r.roleCode}</small>
                        </td>
                        <td><span className="badge bg-light text-dark border">{r.scopeType}</span></td>
                        <td><span className="badge bg-primary-soft">{r.propertyType}</span></td>
                        <td>
                          <span className="small text-secondary">{r.permissions?.length || 'Full Scope'} Actions</span>
                        </td>
                        <td>
                          <span className="badge badge-active">{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic RBAC Rule Guide */}
        <div className="col-lg-5">
          <div className="pms-card p-4">
            <h5 className="fw-bold mb-3">RBAC Authorization Engine</h5>
            <div className="small text-secondary mb-3">
              This system evaluates 5-dimensional security constraints on each API request:
            </div>
            <div className="p-3 bg-light rounded-3 mb-3 border small font-monospace">
              user.isActive === true<br />
              &amp;&amp; role.isActive === true<br />
              &amp;&amp; permission.action === requestedAction<br />
              &amp;&amp; user.organisationId === target.organisationId<br />
              &amp;&amp; scope.matches(requestedResource)
            </div>
            <h6 className="fw-bold small text-dark mb-2">Supported Permission Actions:</h6>
            <div className="d-flex flex-wrap gap-1 mb-3">
              {['create', 'view', 'list', 'edit', 'delete', 'approve', 'reject', 'export', 'assign', 'manage'].map((action) => (
                <span key={action} className="badge bg-light text-dark border">{action}</span>
              ))}
            </div>
            <h6 className="fw-bold small text-dark mb-2">Scope Hierarchies:</h6>
            <div className="d-flex flex-wrap gap-1">
              {['PLATFORM', 'ORGANISATION', 'PROPERTY', 'BUILDING', 'FLOOR', 'UNIT', 'DEPARTMENT'].map((scope) => (
                <span key={scope} className="badge bg-primary-soft">{scope}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
