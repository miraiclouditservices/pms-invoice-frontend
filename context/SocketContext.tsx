'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { apiClient } from '../lib/apiClient';

export interface CctvAlert {
  id: string;
  notificationId?: string;
  title: string;
  message?: string;
  eventType?: string;
  severity?: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: string;
  cameraId?: any;
  cameraName?: string;
  zoneId?: string;
  propertyId?: string;
  time?: string;
  timestamp?: string;
  snapshotUrl?: string;
  requiresAcknowledgement?: boolean;
  aggregatedCount?: number;
  data?: any;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: CctvAlert[];
  unreadCctvCount: number;
  clearNotifications: () => void;
  refreshUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCctvCount: 0,
  clearNotifications: () => {},
  refreshUnreadCount: () => {}
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organisation, activeProperty } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<CctvAlert[]>([]);
  const [unreadCctvCount, setUnreadCctvCount] = useState<number>(0);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.get('/cctv/notifications/unread-count');
      if (res.data?.success) {
        setUnreadCctvCount(res.data.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      refreshUnreadCount();
    }
  }, [user?._id, refreshUnreadCount]);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      if (organisation?._id) {
        socketInstance.emit('join_organisation', organisation._id);
      }
      if (activeProperty?._id) {
        socketInstance.emit('join_property', activeProperty._id);
      }
      if (user?._id) {
        socketInstance.emit('join_user', user._id);
      }
      if (user?.primaryRole) {
        socketInstance.emit('join_role', user.primaryRole);
      }
    });

    // CCTV Real-Time Event Handlers
    socketInstance.on('cctv.notification.created', (data: any) => {
      const newAlert: CctvAlert = {
        id: data.notificationId || String(Date.now()),
        notificationId: data.notificationId,
        title: data.title || 'CCTV Security Alert',
        message: data.message || 'Security camera event detected',
        eventType: data.eventType || 'motion.detected',
        severity: data.severity || 'MEDIUM',
        status: 'UNREAD',
        cameraId: data.cameraId,
        cameraName: data.cameraName || 'Surveillance Camera',
        zoneId: data.zoneId,
        propertyId: data.propertyId,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
        snapshotUrl: data.snapshotUrl,
        requiresAcknowledgement: data.requiresAcknowledgement,
        aggregatedCount: data.aggregatedCount || 1,
        data
      };

      setNotifications(prev => [newAlert, ...prev.slice(0, 19)]);
      setUnreadCctvCount(prev => prev + 1);

      // Play soft notification beep if audio context is permitted
      try {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = data.severity === 'CRITICAL' ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(data.severity === 'CRITICAL' ? 880 : 587, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {
        // audio blocked by browser policy until gesture
      }
    });

    socketInstance.on('cctv.notification.acknowledged', (data: any) => {
      setNotifications(prev => prev.map(n => 
        n.notificationId === data.notificationId ? { ...n, status: 'ACKNOWLEDGED' } : n
      ));
      refreshUnreadCount();
    });

    socketInstance.on('cctv.notification.resolved', (data: any) => {
      setNotifications(prev => prev.map(n => 
        n.notificationId === data.notificationId ? { ...n, status: 'RESOLVED' } : n
      ));
      refreshUnreadCount();
    });

    socketInstance.on('cctv.camera.offline', (data: any) => {
      const offlineAlert: CctvAlert = {
        id: String(Date.now()),
        title: `Camera Offline: ${data.name}`,
        message: `Device lost connection in zone ${data.zoneId || 'General'}`,
        severity: 'HIGH',
        eventType: 'camera.offline',
        status: 'UNREAD',
        cameraName: data.name,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [offlineAlert, ...prev.slice(0, 19)]);
      setUnreadCctvCount(prev => prev + 1);
    });

    socketInstance.on('cctv.camera.online', (data: any) => {
      const onlineAlert: CctvAlert = {
        id: String(Date.now()),
        title: `Camera Restored: ${data.name}`,
        message: `Device re-established connection and is online`,
        severity: 'INFORMATIONAL',
        eventType: 'camera.online',
        status: 'UNREAD',
        cameraName: data.name,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [onlineAlert, ...prev.slice(0, 19)]);
    });

    // Standard business events
    const handleEvent = (eventTitle: string) => (data: any) => {
      setNotifications(prev => [
        {
          id: String(Date.now()),
          title: eventTitle,
          data,
          time: new Date().toLocaleTimeString(),
          severity: 'INFORMATIONAL',
          status: 'UNREAD'
        },
        ...prev.slice(0, 19)
      ]);
    };

    socketInstance.on('visitor.created', handleEvent('New Visitor Pass Expected'));
    socketInstance.on('visitor.checkedIn', handleEvent('Visitor Checked In'));
    socketInstance.on('booking.created', handleEvent('New Booking Created'));
    socketInstance.on('booking.cancelled', handleEvent('Booking Released'));
    socketInstance.on('payment.success', handleEvent('Payment Received Successfully'));
    socketInstance.on('complaint.created', handleEvent('New Complaint Ticket Raised'));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id, user?.primaryRole, organisation?._id, activeProperty?._id, refreshUnreadCount]);

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCctvCount, clearNotifications, refreshUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
