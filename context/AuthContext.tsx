'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile?: string;
  primaryRole: string;
  isPlatformAdmin: boolean;
  organisationId?: string;
  propertyId?: string;
}

interface Organisation {
  _id: string;
  name: string;
  code: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logo?: string;
}

interface Property {
  _id: string;
  name: string;
  code: string;
  propertyType: string;
}

interface AuthContextType {
  user: User | null;
  organisation: Organisation | null;
  activeOrganisation?: Organisation | null;
  properties: Property[];
  activeProperty: Property | null;
  activePropertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'COWORKING' | 'ALL';
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchProperty: (propertyId: string) => void;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pms_user');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });
  const [organisation, setOrganisation] = useState<Organisation | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pms_organisation');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('pms_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        const u = res.data.data.user;
        const org = res.data.data.organisation;
        const props = res.data.data.properties || [];

        setUser(u);
        setOrganisation(org);
        setProperties(props);

        if (u) {
          localStorage.setItem('pms_user', JSON.stringify(u));
        }
        if (org) {
          localStorage.setItem('pms_organisation', JSON.stringify(org));
          localStorage.setItem('pms_active_org_id', org._id);
        }

        const savedPropId = localStorage.getItem('pms_active_property_id');
        const matchedProp = props.find((p: Property) => p._id === savedPropId) || props[0] || null;
        setActiveProperty(matchedProp);

        if (matchedProp?._id) {
          localStorage.setItem('pms_active_property_id', matchedProp._id);
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: u, tokens, organisation: org, properties: props } = res.data.data;
        localStorage.setItem('pms_access_token', tokens.accessToken);
        localStorage.setItem('pms_refresh_token', tokens.refreshToken);
        localStorage.setItem('pms_user', JSON.stringify(u));
        if (org) {
          localStorage.setItem('pms_organisation', JSON.stringify(org));
          localStorage.setItem('pms_active_org_id', org._id);
        }

        setUser(u);
        setOrganisation(org);
        setProperties(props || []);

        if (props && props.length > 0) {
          setActiveProperty(props[0]);
          localStorage.setItem('pms_active_property_id', props[0]._id);
        }

        return true;
      }
      return false;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('pms_access_token');
    localStorage.removeItem('pms_refresh_token');
    localStorage.removeItem('pms_user');
    localStorage.removeItem('pms_organisation');
    localStorage.removeItem('pms_active_org_id');
    localStorage.removeItem('pms_active_property_id');
    setUser(null);
    setOrganisation(null);
    setProperties([]);
    setActiveProperty(null);
  };

  const switchProperty = (propertyId: string) => {
    const prop = properties.find(p => p._id === propertyId);
    if (prop) {
      setActiveProperty(prop);
      localStorage.setItem('pms_active_property_id', prop._id);
      window.location.reload();
    }
  };

  const hasPermission = (moduleName: string, actionName: string): boolean => {
    if (!user) return false;
    if (user.isPlatformAdmin || user.primaryRole === 'PLATFORM_OWNER' || user.primaryRole === 'ORGANISATION_OWNER') {
      return true;
    }
    // Property manager permission
    if (user.primaryRole === 'PROPERTY_MANAGER' && !['PLATFORM_OWNER', 'ORGANISATION'].includes(moduleName)) {
      return true;
    }
    return true; // Simplified for role actions
  };

  const activePropertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'COWORKING' | 'ALL' = 
    (activeProperty?.propertyType?.toUpperCase() as any) ||
    (organisation?.type?.toUpperCase() as any) ||
    'ALL';

  return (
    <AuthContext.Provider value={{
      user,
      organisation,
      activeOrganisation: organisation,
      properties,
      activeProperty,
      activePropertyType,
      loading,
      login,
      logout,
      switchProperty,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
