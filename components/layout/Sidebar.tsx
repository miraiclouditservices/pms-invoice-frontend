'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | number;
  roles?: string[];
  propertyTypes?: string[];
}

interface NavSection {
  title: string;
  roles?: string[];
  items: NavItem[];
}

interface PropertyTypeConfig {
  badgeLabel: string;
  badgeClass: string;
  icon: string;
  infrastructureTitle: string;
  buildingsLabel: string;
  floorsLabel: string;
  unitsLabel: string;
  occupancyTitle: string;
  occupanciesLabel: string;
  allocationsLabel: string;
  residentsLabel: string;
  agreementsLabel: string;
  servicesTitle: string;
  bookingsLabel: string;
  billingLabel: string;
  visitorsLabel: string;
  parkingLabel: string;
  maintenanceTitle: string;
  complaintsLabel: string;
}

const PROPERTY_CONFIGS: Record<string, PropertyTypeConfig> = {
  RESIDENTIAL: {
    badgeLabel: 'Residential Society',
    badgeClass: 'bg-success text-white',
    icon: 'bi-house-heart-fill',
    infrastructureTitle: 'Towers & Spaces',
    buildingsLabel: 'Towers & Wings',
    floorsLabel: 'Floors',
    unitsLabel: 'Flats & Apartments',
    occupancyTitle: 'Residents & Tenancy',
    occupanciesLabel: 'Resident Directory',
    allocationsLabel: 'Flat Allocations',
    residentsLabel: 'Residents & Owners',
    agreementsLabel: 'Tenancy Agreements',
    servicesTitle: 'Society Services',
    bookingsLabel: 'Clubhouse & Amenities',
    billingLabel: 'Maintenance Bills & Dues',
    visitorsLabel: 'Visitor & Maid Passes',
    parkingLabel: 'Resident Parking Bays',
    maintenanceTitle: 'Society Helpdesk',
    complaintsLabel: 'Complaints & Requests'
  },
  COMMERCIAL: {
    badgeLabel: 'Commercial Real Estate',
    badgeClass: 'bg-primary text-white',
    icon: 'bi-briefcase-fill',
    infrastructureTitle: 'Towers & Leasable Space',
    buildingsLabel: 'Office Towers & Blocks',
    floorsLabel: 'Floor Plates',
    unitsLabel: 'Office Suites & Retail',
    occupancyTitle: 'Corporate Tenancy',
    occupanciesLabel: 'Lease Occupancies',
    allocationsLabel: 'Suite & Floor Allocations',
    residentsLabel: 'Tenant Companies',
    agreementsLabel: 'Master Leases & Contracts',
    servicesTitle: 'Commercial Operations',
    bookingsLabel: 'Boardrooms & Lounges',
    billingLabel: 'Rent, CAM & Invoices',
    visitorsLabel: 'Employee & Guest Badges',
    parkingLabel: 'Reserved Tenant Parking',
    maintenanceTitle: 'Facilities & SLA',
    complaintsLabel: 'Facility SLA Tickets'
  },
  COWORKING: {
    badgeLabel: 'Co-working Hub',
    badgeClass: 'bg-warning text-dark',
    icon: 'bi-laptop-fill',
    infrastructureTitle: 'Hub & Workspaces',
    buildingsLabel: 'Hubs & Centres',
    floorsLabel: 'Floors & Zones',
    unitsLabel: 'Desks, Cabins & Pods',
    occupancyTitle: 'Community & Members',
    occupanciesLabel: 'Member Directory',
    allocationsLabel: 'Desk & Seat Allocations',
    residentsLabel: 'Coworking Members',
    agreementsLabel: 'Membership Plans',
    servicesTitle: 'Flex Services',
    bookingsLabel: 'Meeting Rooms & Credits',
    billingLabel: 'Subscriptions & Invoices',
    visitorsLabel: 'Guest Check-in & Passes',
    parkingLabel: 'Member Parking Slots',
    maintenanceTitle: 'Workspace Helpdesk',
    complaintsLabel: 'Helpdesk & Requests'
  },
  ALL: {
    badgeLabel: 'Multi-Property PMS',
    badgeClass: 'bg-secondary text-white',
    icon: 'bi-buildings-fill',
    infrastructureTitle: 'Infrastructure & Spaces',
    buildingsLabel: 'Buildings & Blocks',
    floorsLabel: 'Floors',
    unitsLabel: 'Units & Spaces',
    occupancyTitle: 'Occupancy & Contracts',
    occupanciesLabel: 'Occupancy Directory',
    allocationsLabel: 'Space Allocations',
    residentsLabel: 'Residents & Tenants',
    agreementsLabel: 'Agreements & Leases',
    servicesTitle: 'Services & Operations',
    bookingsLabel: 'Bookings & Facilities',
    billingLabel: 'Billing & Invoices',
    visitorsLabel: 'Visitors & Gate Passes',
    parkingLabel: 'Parking Bays',
    maintenanceTitle: 'Facility Maintenance',
    complaintsLabel: 'Complaints & SLA'
  }
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, organisation, activeProperty, activePropertyType, logout } = useAuth();
  const { notifications } = useSocket();

  const primaryRole = user?.primaryRole?.toUpperCase() || (user?.isPlatformAdmin ? 'PLATFORM_OWNER' : 'VIEWER');
  const isPlatformOwner = user?.isPlatformAdmin || primaryRole === 'PLATFORM_OWNER';
  const propType = activePropertyType || activeProperty?.propertyType?.toUpperCase() || organisation?.type?.toUpperCase() || 'ALL';
  const typeConfig = PROPERTY_CONFIGS[propType] || PROPERTY_CONFIGS.ALL;

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // Role categorization helpers
  const isOrgAdmin = ['ORGANISATION_OWNER', 'ORGANISATION_ADMIN'].includes(primaryRole);
  const isManager = primaryRole === 'PROPERTY_MANAGER' || isOrgAdmin || isPlatformOwner;
  const isResident = primaryRole === 'RESIDENT';
  const isTenant = ['TENANT', 'COMMERCIAL_TENANT'].includes(primaryRole);
  const isMember = ['MEMBER', 'COWORKING_MEMBER'].includes(primaryRole);
  const isSecurity = primaryRole === 'SECURITY_GUARD';
  const isAccountant = primaryRole === 'ACCOUNTANT';
  const isFacility = ['FACILITY_MANAGER', 'TECHNICIAN'].includes(primaryRole);
  const isTaxInvoiceOnly = primaryRole === 'TAX_INVOICE_USER';

  // Dynamic Navigation Sections based on Business Logins & Roles
  const getNavSections = (): NavSection[] => {
    // 0. DEDICATED TAX INVOICE + CASHFREE + EMAIL AUTOMATION SUITE
    if (isTaxInvoiceOnly) {
      return [
        {
          title: 'Tax Invoice Operations',
          items: [
            { name: 'Invoice Dashboard', href: '/invoices/dashboard', icon: 'bi-speedometer' },
            { name: 'All Tax Invoices', href: '/invoices', icon: 'bi-receipt' },
            { name: 'Create Tax Invoice', href: '/invoices/create', icon: 'bi-plus-circle' },
            { name: 'Customer Directory', href: '/invoices/customers', icon: 'bi-people' }
          ]
        },
        {
          title: 'Payments & Automation',
          items: [
            { name: 'Cashfree Payment Links', href: '/invoices/payments', icon: 'bi-credit-card-2-front' },
            { name: 'Email Automation Logs', href: '/invoices/emails', icon: 'bi-envelope-paper' },
            { name: 'Invoice & Gateway Settings', href: '/invoices/settings', icon: 'bi-sliders' }
          ]
        }
      ];
    }

    // 1. PLATFORM OWNER / SUPER ADMIN
    if (isPlatformOwner) {
      return [
        {
          title: 'Platform Overview',
          items: [
            { name: 'Global Dashboard', href: '/dashboard', icon: 'bi-speedometer2' }
          ]
        },
        {
          title: 'Platform Governance',
          items: [
            { name: 'Organisations', href: '/organisations', icon: 'bi-diagram-3' },
            { name: 'Properties', href: '/properties', icon: 'bi-building' },
            { name: 'Global Users & Staff', href: '/users', icon: 'bi-person-lines-fill' },
            { name: 'Roles & RBAC Matrix', href: '/roles', icon: 'bi-shield-lock' }
          ]
        },
        {
          title: 'Tax Invoices & Cashfree',
          items: [
            { name: 'Invoice Dashboard', href: '/invoices/dashboard', icon: 'bi-speedometer' },
            { name: 'All Invoices', href: '/invoices', icon: 'bi-receipt' },
            { name: 'Create Invoice', href: '/invoices/create', icon: 'bi-plus-circle' },
            { name: 'Customers', href: '/invoices/customers', icon: 'bi-people' },
            { name: 'Transactions', href: '/invoices/payments', icon: 'bi-credit-card-2-front' },
            { name: 'Email History', href: '/invoices/emails', icon: 'bi-envelope-paper' },
            { name: 'Invoice Settings', href: '/invoices/settings', icon: 'bi-sliders' }
          ]
        },
        {
          title: 'Intelligence & Audit',
          items: [
            { name: 'Global Analytics', href: '/reports', icon: 'bi-graph-up-arrow' },
            { name: 'Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'Platform Settings', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 2. RESIDENT (Apartment / Residential Society)
    if (isResident) {
      return [
        {
          title: 'My Residence',
          items: [
            { name: 'Resident Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
            { name: 'My Flat / Space', href: '/units', icon: 'bi-door-open' }
          ]
        },
        {
          title: 'Daily Services & Gate',
          items: [
            { name: 'Visitor Passes', href: '/visitors', icon: 'bi-person-badge' },
            { name: 'Amenity Bookings', href: '/bookings', icon: 'bi-calendar2-check' },
            { name: 'Maintenance Bills', href: '/billing', icon: 'bi-receipt' },
            { name: 'My Parking Slot', href: '/parking', icon: 'bi-p-square' }
          ]
        },
        {
          title: 'Helpdesk & Community',
          items: [
            { name: 'Complaints & Requests', href: '/complaints', icon: 'bi-tools' },
            { name: 'Society Chat', href: '/chat', icon: 'bi-chat-dots-fill', badge: 'Live' },
            { name: 'Alerts', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'My Profile', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 3. COMMERCIAL TENANT REPRESENTATIVE
    if (isTenant) {
      return [
        {
          title: 'Tenant Workspace',
          items: [
            { name: 'Tenant Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
            { name: 'Leased Offices', href: '/units', icon: 'bi-door-open' },
            { name: 'Master Leases', href: '/agreements', icon: 'bi-file-earmark-text' }
          ]
        },
        {
          title: 'Operations & Access',
          items: [
            { name: 'Employee & Guest Passes', href: '/visitors', icon: 'bi-person-badge' },
            { name: 'Conference Bookings', href: '/bookings', icon: 'bi-calendar2-check' },
            { name: 'CAM & Rent Invoices', href: '/billing', icon: 'bi-receipt' },
            { name: 'Reserved Parking', href: '/parking', icon: 'bi-p-square' }
          ]
        },
        {
          title: 'Support & Comms',
          items: [
            { name: 'Facility Tickets', href: '/complaints', icon: 'bi-tools' },
            { name: 'Management Chat', href: '/chat', icon: 'bi-chat-dots-fill', badge: 'Live' },
            { name: 'Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'Account Settings', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 4. COWORKING MEMBER
    if (isMember) {
      return [
        {
          title: 'Member Hub',
          items: [
            { name: 'Member Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
            { name: 'My Desks & Cabins', href: '/units', icon: 'bi-door-open' }
          ]
        },
        {
          title: 'Reservations & Dues',
          items: [
            { name: 'Book Room / Desk', href: '/bookings', icon: 'bi-calendar2-check' },
            { name: 'Membership Invoices', href: '/billing', icon: 'bi-receipt' },
            { name: 'Guest Check-in', href: '/visitors', icon: 'bi-person-badge' }
          ]
        },
        {
          title: 'Help & Networking',
          items: [
            { name: 'Helpdesk Tickets', href: '/complaints', icon: 'bi-tools' },
            { name: 'Coworking Chat', href: '/chat', icon: 'bi-chat-dots-fill', badge: 'Live' },
            { name: 'Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'Preferences', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 5. SECURITY GUARD
    if (isSecurity) {
      return [
        {
          title: 'Gate Security Operations',
          items: [
            { name: 'Gate Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
            { name: 'CCTV Surveillance', href: '/cctv', icon: 'bi-camera-video', badge: 'Live' },
            { name: 'Visitor Passes & QR', href: '/visitors', icon: 'bi-person-badge' },
            { name: 'Vehicle & Parking Bay', href: '/parking', icon: 'bi-p-square' }
          ]
        },
        {
          title: 'Communications',
          items: [
            { name: 'Duty Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'Security Chat', href: '/chat', icon: 'bi-chat-dots-fill' },
            { name: 'Profile', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 6. ACCOUNTANT / FINANCIAL AUDITOR
    if (isAccountant) {
      return [
        {
          title: 'Financial Overview',
          items: [
            { name: 'Financial Dashboard', href: '/dashboard', icon: 'bi-speedometer2' }
          ]
        },
        {
          title: 'Tax Invoices & Cashfree',
          items: [
            { name: 'Invoice Dashboard', href: '/invoices/dashboard', icon: 'bi-speedometer' },
            { name: 'All Invoices', href: '/invoices', icon: 'bi-receipt' },
            { name: 'Create Invoice', href: '/invoices/create', icon: 'bi-plus-circle' },
            { name: 'Customers', href: '/invoices/customers', icon: 'bi-people' },
            { name: 'Transactions', href: '/invoices/payments', icon: 'bi-credit-card-2-front' },
            { name: 'Email History', href: '/invoices/emails', icon: 'bi-envelope-paper' },
            { name: 'Invoice Settings', href: '/invoices/settings', icon: 'bi-sliders' }
          ]
        },
        {
          title: 'Billing & Contracts',
          items: [
            { name: 'Billing & Payments', href: '/billing', icon: 'bi-receipt' },
            { name: 'Agreements & Leases', href: '/agreements', icon: 'bi-file-earmark-text' },
            { name: 'Occupancy & Units', href: '/units', icon: 'bi-door-open' },
            { name: 'Residents & Tenants', href: '/residents', icon: 'bi-people' }
          ]
        },
        {
          title: 'Analytics & Audit',
          items: [
            { name: 'Financial Reports', href: '/reports', icon: 'bi-graph-up-arrow' },
            { name: 'Audit Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'Settings', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 7. FACILITY MANAGER / TECHNICIAN
    if (isFacility) {
      return [
        {
          title: 'Facility Operations',
          items: [
            { name: 'Facility Dashboard', href: '/dashboard', icon: 'bi-speedometer2' }
          ]
        },
        {
          title: 'Maintenance Execution',
          items: [
            { name: 'Complaints & SLA', href: '/complaints', icon: 'bi-tools' },
            { name: 'Work Orders Dispatch', href: '/work-orders', icon: 'bi-clipboard-check' },
            { name: 'AMC & Assets Registry', href: '/assets-amc', icon: 'bi-cpu' },
            { name: 'Certified Vendors', href: '/vendors', icon: 'bi-shop' },
            { name: 'Parking & Bays', href: '/parking', icon: 'bi-p-square' }
          ]
        },
        {
          title: 'Comms & Tools',
          items: [
            { name: 'Operations Chat', href: '/chat', icon: 'bi-chat-dots-fill', badge: 'Live' },
            { name: 'SLA Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
            { name: 'Settings', href: '/settings', icon: 'bi-gear' }
          ]
        }
      ];
    }

    // 8. ORGANISATION ADMIN / PROPERTY MANAGER (Full Enterprise Suite)
    const sections: NavSection[] = [
      {
        title: 'Overview',
        items: [
          { name: 'Dashboard', href: '/dashboard', icon: 'bi-speedometer2' }
        ]
      }
    ];

    if (isOrgAdmin) {
      sections.push({
        title: 'Properties & Teams',
        items: [
          { name: 'Properties', href: '/properties', icon: 'bi-building' },
          { name: 'Users & Staff', href: '/users', icon: 'bi-person-lines-fill' },
          { name: 'Roles & Permissions', href: '/roles', icon: 'bi-shield-lock' }
        ]
      });
    } else if (primaryRole === 'PROPERTY_MANAGER') {
      sections.push({
        title: 'Properties & Staff',
        items: [
          { name: 'Properties', href: '/properties', icon: 'bi-building' },
          { name: 'Users & Staff', href: '/users', icon: 'bi-person-lines-fill' }
        ]
      });
    }

    sections.push({
      title: typeConfig.infrastructureTitle,
      items: [
        { name: typeConfig.buildingsLabel, href: '/buildings', icon: 'bi-houses' },
        { name: typeConfig.floorsLabel, href: '/floors', icon: 'bi-layers' },
        { name: typeConfig.unitsLabel, href: '/units', icon: 'bi-door-open' }
      ]
    });

    sections.push({
      title: typeConfig.occupancyTitle,
      items: [
        {
          name: typeConfig.occupanciesLabel,
          href: '/occupancies',
          icon: 'bi-person-check-fill'
        },
        {
          name: typeConfig.allocationsLabel,
          href: '/allocations',
          icon: 'bi-grid-3x3-gap'
        },
        {
          name: typeConfig.residentsLabel,
          href: '/residents',
          icon: 'bi-people'
        },
        {
          name: typeConfig.agreementsLabel,
          href: '/agreements',
          icon: 'bi-file-earmark-text'
        }
      ]
    });

    sections.push({
      title: 'Tax Invoice Management',
      items: [
        { name: 'Invoice Dashboard', href: '/invoices/dashboard', icon: 'bi-speedometer' },
        { name: 'All Invoices', href: '/invoices', icon: 'bi-receipt' },
        { name: 'Create Invoice', href: '/invoices/create', icon: 'bi-plus-circle' },
        { name: 'Customers', href: '/invoices/customers', icon: 'bi-people' },
        { name: 'Payment Transactions', href: '/invoices/payments', icon: 'bi-credit-card-2-front' },
        { name: 'Email History', href: '/invoices/emails', icon: 'bi-envelope-paper' },
        { name: 'Invoice Settings', href: '/invoices/settings', icon: 'bi-sliders' }
      ]
    });

    sections.push({
      title: typeConfig.servicesTitle,
      items: [
        { name: typeConfig.bookingsLabel, href: '/bookings', icon: 'bi-calendar2-check' },
        { name: 'CCTV Surveillance', href: '/cctv', icon: 'bi-camera-video', badge: 'Live' },
        { name: typeConfig.billingLabel, href: '/billing', icon: 'bi-receipt' },
        { name: typeConfig.visitorsLabel, href: '/visitors', icon: 'bi-person-badge' },
        { name: typeConfig.parkingLabel, href: '/parking', icon: 'bi-p-square' }
      ]
    });

    sections.push({
      title: typeConfig.maintenanceTitle,
      items: [
        { name: typeConfig.complaintsLabel, href: '/complaints', icon: 'bi-tools' },
        { name: 'Work Orders', href: '/work-orders', icon: 'bi-clipboard-check' },
        { name: 'AMC & Assets', href: '/assets-amc', icon: 'bi-cpu' },
        { name: 'Certified Vendors', href: '/vendors', icon: 'bi-shop' }
      ]
    });

    sections.push({
      title: 'Intelligence & Comms',
      items: [
        { name: 'Reports & Analytics', href: '/reports', icon: 'bi-graph-up-arrow' },
        { name: 'Live Chat', href: '/chat', icon: 'bi-chat-dots-fill', badge: 'Live' },
        { name: 'Notifications', href: '/notifications', icon: 'bi-bell', badge: notifications.length || undefined },
        { name: 'Settings', href: '/settings', icon: 'bi-gear' }
      ]
    });

    return sections;
  };

  const navSections = getNavSections();

  // Color mapping for roles
  const getRoleBadgeClass = () => {
    if (isPlatformOwner) return 'bg-purple-subtle text-purple border-purple-subtle';
    if (isOrgAdmin) return 'bg-primary-subtle text-primary border-primary-subtle';
    if (primaryRole === 'PROPERTY_MANAGER') return 'bg-info-subtle text-info border-info-subtle';
    if (isResident) return 'bg-success-subtle text-success border-success-subtle';
    if (isTenant) return 'bg-teal-subtle text-teal border-teal-subtle';
    if (isMember) return 'bg-warning-subtle text-warning border-warning-subtle';
    if (isSecurity) return 'bg-dark-subtle text-dark border-dark-subtle';
    return 'bg-secondary-subtle text-secondary border-secondary-subtle';
  };

  return (
    <aside className="pms-sidebar d-flex flex-column">
      {/* Brand */}
      <div className="brand">
        <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: 30, height: 30 }}>
          <i className="bi bi-buildings-fill" style={{ fontSize: '0.95rem' }}></i>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <h6 className="mb-0 text-white fw-bold text-truncate" style={{ fontSize: '0.88rem', letterSpacing: '0.02em', lineHeight: 1.2 }} title={organisation?.name || 'NexusPMS'}>
            {organisation?.name || 'NexusPMS'}
          </h6>
          {organisation?.type && (
            <div className="text-secondary text-truncate" style={{ fontSize: '0.64rem', lineHeight: 1, letterSpacing: '0.04em' }}>
              {organisation.type}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Property Mode Banner */}
      {!isPlatformOwner && !isTaxInvoiceOnly && (
        <div className="px-3 pt-2 pb-1">
          <div className="d-flex align-items-center justify-content-between p-1 px-2 rounded-2 bg-white bg-opacity-10 border border-white border-opacity-10">
            <div className="d-flex align-items-center gap-1 overflow-hidden">
              <i className={`bi ${typeConfig.icon} text-info`} style={{ fontSize: '0.78rem' }}></i>
              <span className="text-white small fw-semibold text-truncate" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                {typeConfig.badgeLabel}
              </span>
            </div>
            {activeProperty?.name && (
              <span className="badge bg-white bg-opacity-20 text-white text-truncate ms-1" style={{ fontSize: '0.6rem', maxWidth: '85px' }} title={activeProperty.name}>
                {activeProperty.code || activeProperty.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tax Invoice Specialist Dedicated Mode Banner */}
      {isTaxInvoiceOnly && (
        <div className="px-3 pt-2 pb-1">
          <div className="d-flex align-items-center justify-content-between p-1 px-2 rounded-2 bg-primary bg-opacity-25 border border-primary border-opacity-40">
            <div className="d-flex align-items-center gap-1 overflow-hidden">
              <i className="bi bi-receipt-cutoff text-warning" style={{ fontSize: '0.82rem' }}></i>
              <span className="text-white small fw-semibold text-truncate" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                Tax & Payment Suite
              </span>
            </div>
            <span className="badge bg-success text-white" style={{ fontSize: '0.6rem' }}>
              Cashfree
            </span>
          </div>
        </div>
      )}

      {/* Navigation Modules (Role & Permission filtered) */}
      <div className="flex-grow-1 py-2 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="mb-2">
            <div className="nav-category">
              {sec.title}
            </div>
            {sec.items.map((item, itemIdx) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={itemIdx}
                  href={item.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span className="flex-grow-1 text-truncate">{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`badge rounded-pill ${
                        item.badge === 'Live' ? 'bg-danger text-white' : 'bg-primary text-white'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer User Profile */}
      <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div
            className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 32, height: 32, fontSize: '0.8rem' }}
          >
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-white small fw-semibold text-truncate" style={{ fontSize: '0.8rem' }}>
              {user?.fullName || `${user?.firstName || 'Logged in'} ${user?.lastName || ''}`}
            </div>
            <div className="text-secondary text-truncate" style={{ fontSize: '0.7rem' }}>
              {user?.email || 'authenticated'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-link text-secondary p-1 hover-text-danger flex-shrink-0"
          title="Sign Out"
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
        </button>
      </div>
    </aside>
  );
};
