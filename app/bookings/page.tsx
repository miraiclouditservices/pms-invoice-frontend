'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/coworking/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking and release the resource?')) return;
    try {
      const res = await apiClient.put(`/coworking/bookings/${id}/cancel`, { reason: 'Cancelled by user' });
      if (res.data.success) {
        loadBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Resource & Facility Bookings</h2>
          <p className="text-secondary mb-0 small">Manage conference rooms, meeting spaces, amenities, and hot desks with real-time conflict protection</p>
        </div>
      </div>

      <div className="pms-card p-3">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Type & Resource</th>
                  <th>Booked For / Title</th>
                  <th>Date & Time Slot</th>
                  <th>Booked By</th>
                  <th>Charges / Credits</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="fw-bold text-primary">{b.bookingNumber}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{b.bookingType}</span>
                      <small className="d-block text-muted mt-1">{b.unitId?.unitNumber || b.amenityId?.name || 'Assigned Slot'}</small>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{b.title}</div>
                      <small className="text-muted">{b.companyName || 'Private'}</small>
                    </td>
                    <td>
                      <div>{new Date(b.bookingDate).toLocaleDateString()}</div>
                      <small className="text-primary fw-medium">{b.startTime} - {b.endTime}</small>
                    </td>
                    <td>
                      <div>{b.memberId?.memberName || b.residentId?.name || 'User'}</div>
                    </td>
                    <td>
                      {b.creditsUsed > 0 ? (
                        <span className="badge bg-info text-dark">{b.creditsUsed} Credits</span>
                      ) : (
                        <span>₹{(b.charges || 0).toLocaleString()}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-active' : 'badge-danger-soft'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'CONFIRMED' && (
                        <button onClick={() => handleCancel(b._id)} className="btn btn-outline-danger btn-sm py-0 px-2">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
