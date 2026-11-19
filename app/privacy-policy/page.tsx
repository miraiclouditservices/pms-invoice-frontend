import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy – Mirai PMS | Mirai Cloud IT Solutions',
  description: 'Official Privacy Policy for Mirai PMS application and services operated by Mirai Cloud IT Solutions.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F8FAFC', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header Bar */}
      <header className="border-bottom sticky-top" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', zIndex: 100 }}>
        <div className="container py-3 d-flex align-items-center justify-content-between" style={{ maxWidth: '960px' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 fw-semibold" style={{ fontSize: '0.85rem' }}>
              Mirai PMS
            </span>
            <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.88rem' }}>
              &bull; Official Legal Document
            </span>
          </div>
          <Link
            href="/"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 text-decoration-none fw-medium"
            style={{ fontSize: '0.85rem' }}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="container py-4 py-md-5" style={{ maxWidth: '960px' }}>
        
        {/* Document Card */}
        <div
          className="card border-0 shadow-sm rounded-4 p-4 p-md-5"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 25px rgba(15, 23, 42, 0.05)',
          }}
        >
          
          {/* Header Section */}
          <div className="border-bottom pb-4 mb-4" style={{ borderColor: '#E2E8F0' }}>
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: 'calc(1.4rem + 1vw)', letterSpacing: '-0.02em' }}>
              Privacy Policy &ndash; Mirai PMS
            </h1>
            
            <div className="d-flex flex-wrap align-items-center gap-3 pt-2 text-muted" style={{ fontSize: '0.88rem' }}>
              <div className="d-flex align-items-center gap-1.5">
                <i className="bi bi-calendar3 text-primary"></i>
                <span><strong>Effective Date:</strong> 19 November 2026</span>
              </div>
              <span className="d-none d-sm-inline">&bull;</span>
              <div className="d-flex align-items-center gap-1.5">
                <i className="bi bi-clock-history text-primary"></i>
                <span><strong>Last Updated:</strong> 19 November 2026</span>
              </div>
            </div>
          </div>

          {/* Intro Paragraphs */}
          <div className="p-3 p-md-4 rounded-3 mb-4" style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <p className="mb-3" style={{ lineHeight: 1.75, fontSize: '0.96rem' }}>
              Mirai PMS is a property management platform operated by Mirai Cloud IT Solutions (&ldquo;Mirai,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). Mirai PMS helps property owners, administrators, facility teams, security personnel, residents, tenants, and authorized users manage properties, units, visitors, access, billing, maintenance, and related operations.
            </p>
            <p className="mb-3" style={{ lineHeight: 1.75, fontSize: '0.96rem' }}>
              This Privacy Policy explains how we collect, use, store, share, and protect information when you use the Mirai PMS mobile application, web application, and related services.
            </p>
            <p className="mb-0 fw-semibold text-primary" style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
              By using Mirai PMS, you acknowledge the practices described in this Privacy Policy.
            </p>
          </div>

          {/* Document Content */}
          <div className="document-body" style={{ color: '#334155', lineHeight: 1.8, fontSize: '0.95rem' }}>

            {/* 1. Information We Collect */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                Depending on how Mirai PMS is configured and used by your organization or property, we may collect the following categories of information.
              </p>

              {/* 1.1 */}
              <div className="p-3 p-md-3 rounded-3 mb-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <h3 className="h6 fw-bold text-dark mb-2">1.1 Account and Profile Information</h3>
                <p className="mb-2">We may collect:</p>
                <ul className="mb-0 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Login credentials or authentication information</li>
                  <li>User role and access permissions</li>
                  <li>Profile information provided by the user or authorized administrator</li>
                </ul>
              </div>

              {/* 1.2 */}
              <div className="p-3 p-md-3 rounded-3 mb-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <h3 className="h6 fw-bold text-dark mb-2">1.2 Property and Tenancy Information</h3>
                <p className="mb-2">Mirai PMS may process information related to properties and their occupants, including:</p>
                <ul className="mb-0 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Property, building, floor, and unit details</li>
                  <li>Tenant or resident information</li>
                  <li>Lease or occupancy information</li>
                  <li>Owner information</li>
                  <li>Vendor information</li>
                  <li>Maintenance requests and service records</li>
                  <li>Billing and invoice information</li>
                  <li>Payment-related records where applicable</li>
                </ul>
              </div>

              {/* 1.3 */}
              <div className="p-3 p-md-3 rounded-3 mb-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <h3 className="h6 fw-bold text-dark mb-2">1.3 Visitor and Access Information</h3>
                <p className="mb-2">Where visitor and security-management features are enabled, the application may process:</p>
                <ul className="mb-0 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Visitor name and contact information</li>
                  <li>Visit details</li>
                  <li>Host/resident details</li>
                  <li>Entry and exit information</li>
                  <li>Vehicle details where provided</li>
                  <li>Visitor photographs where the relevant feature is enabled</li>
                  <li>Gate or access-related records</li>
                  <li>Information entered by security personnel, residents, administrators, or other authorized users</li>
                </ul>
              </div>

              {/* 1.4 */}
              <div className="p-3 p-md-3 rounded-3 mb-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <h3 className="h6 fw-bold text-dark mb-2">1.4 Device and Technical Information</h3>
                <p className="mb-2">We may collect limited technical information necessary to operate, maintain, and troubleshoot the application, such as:</p>
                <ul className="mb-0 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Device type and model</li>
                  <li>Operating system and application version</li>
                  <li>Network information</li>
                  <li>Error logs and diagnostic information</li>
                  <li>Device identifiers where technically required</li>
                  <li>Application usage and performance information</li>
                </ul>
              </div>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 2. Camera Permission */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                2. Camera Permission
              </h2>
              <p className="mb-2">
                Mirai PMS may request access to your device camera for features that require capturing or scanning images, such as:
              </p>
              <ul className="mb-3 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Visitor photographs</li>
                <li>Document or image capture</li>
                <li>QR-code or barcode scanning</li>
                <li>Other camera-based functions available within the application</li>
              </ul>
              <p className="mb-2">
                The camera is accessed when the user initiates a camera-based feature or when such access is required for an enabled application function.
              </p>
              <p className="mb-0 text-muted">
                We do not use the camera for continuous or background surveillance through the mobile application unless a specific feature clearly requires and communicates such functionality.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 3. Photos and Files */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                3. Photos and Files
              </h2>
              <p className="mb-2">
                Mirai PMS may allow users to select or upload photographs, documents, or other files for legitimate property-management purposes, such as maintenance requests, resident records, visitor management, or supporting documents.
              </p>
              <p className="mb-0">
                We access files or photos only as necessary for the feature being used and subject to the permissions provided by the device and operating system.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 4. How We Use Information */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                4. How We Use Information
              </h2>
              <p className="mb-2">We may use collected information to:</p>
              <ul className="mb-0 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Create and manage user accounts</li>
                <li>Manage properties, buildings, floors, units, residents, tenants, and vendors</li>
                <li>Manage visitor and gate-entry workflows</li>
                <li>Support access-control and security-related operations</li>
                <li>Generate and manage invoices and billing records</li>
                <li>Manage maintenance requests and service activities</li>
                <li>Provide notifications and operational communications</li>
                <li>Integrate with compatible CCTV, access-control, or other property-management systems where configured</li>
                <li>Provide customer and technical support</li>
                <li>Diagnose application errors and improve application performance</li>
                <li>Maintain application security and prevent unauthorized access, misuse, or fraud</li>
                <li>Comply with applicable legal, regulatory, and contractual requirements</li>
                <li>Provide and improve Mirai PMS services</li>
              </ul>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 5. Property Administrator and Organization-Controlled Data */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                5. Property Administrator and Organization-Controlled Data
              </h2>
              <p className="mb-2">
                Mirai PMS may be provided to organizations, property owners, facility managers, residential communities, commercial properties, or other entities.
              </p>
              <p className="mb-2">
                In such cases, the organization or property administrator may determine what resident, tenant, visitor, employee, vendor, or property information is entered into the system and how that information is used for their operational purposes.
              </p>
              <p className="mb-0">
                If you use Mirai PMS through an organization, property, employer, residential community, or facility, questions regarding information entered or managed by that organization may need to be directed to the relevant administrator.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 6. Sharing of Information */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                6. Sharing of Information
              </h2>
              <p className="mb-3 fw-medium text-dark">
                We do not sell or rent personal information to third parties for advertising purposes.
              </p>
              <p className="mb-3">
                Information may be shared or made accessible in the following circumstances:
              </p>

              <div className="ps-3 border-start border-2 border-secondary border-opacity-25 my-3">
                <h3 className="h6 fw-bold text-dark mb-1">Authorized Users and Administrators</h3>
                <p className="mb-0">
                  Information may be accessible to authorized property administrators, management personnel, security personnel, residents, tenants, vendors, or other users according to their assigned roles and permissions.
                </p>
              </div>

              <div className="ps-3 border-start border-2 border-secondary border-opacity-25 my-3">
                <h3 className="h6 fw-bold text-dark mb-1">Service Providers</h3>
                <p className="mb-2">
                  We may use trusted third-party service providers to host, store, process, secure, or support Mirai PMS.
                </p>
                <p className="mb-0">
                  Depending on the services actually enabled, these providers may include cloud infrastructure, database hosting, notification, communication, analytics, payment, or other technology providers.
                </p>
              </div>

              <div className="ps-3 border-start border-2 border-secondary border-opacity-25 my-3">
                <h3 className="h6 fw-bold text-dark mb-1">Legal Requirements</h3>
                <p className="mb-2">We may disclose information where reasonably necessary to:</p>
                <ul className="mb-0 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Comply with applicable law or legal process</li>
                  <li>Respond to lawful requests from government or law-enforcement authorities</li>
                  <li>Protect the rights, safety, security, or property of Mirai, our users, or others</li>
                  <li>Investigate fraud, abuse, security incidents, or unauthorized activity</li>
                </ul>
              </div>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 7. Third-Party Services and Infrastructure */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                7. Third-Party Services and Infrastructure
              </h2>
              <p className="mb-2">
                Mirai PMS may use third-party technology and cloud infrastructure to provide its services.
              </p>
              <p className="mb-2">
                Depending on the application configuration and features enabled, these services may include cloud hosting, database services, notification services, communication services, payment services, analytics, or integrations with third-party security/property-management systems.
              </p>
              <p className="mb-2">
                Third-party service providers may process information only as necessary to provide their relevant services, subject to their applicable terms and privacy policies.
              </p>
              <p className="mb-0">
                We will update this Privacy Policy when material changes to third-party data processing are introduced.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 8. Data Security */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                8. Data Security
              </h2>
              <p className="mb-2">
                We take reasonable technical and organizational measures to protect information against unauthorized access, alteration, disclosure, loss, or misuse.
              </p>
              <p className="mb-2">Depending on the applicable service and implementation, security measures may include:</p>
              <ul className="mb-3 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>HTTPS/TLS-secured communication</li>
                <li>Authentication and access controls</li>
                <li>Role-based access permissions</li>
                <li>Secure credential handling</li>
                <li>Access restrictions for administrative functions</li>
                <li>Monitoring and troubleshooting measures</li>
              </ul>
              <p className="mb-0 text-muted">
                However, no internet-based application or electronic storage system can be guaranteed to be completely secure.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 9. Data Retention */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                9. Data Retention
              </h2>
              <p className="mb-2">We retain information for as long as reasonably necessary to:</p>
              <ul className="mb-3 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Provide Mirai PMS services</li>
                <li>Maintain user and property records</li>
                <li>Meet contractual obligations</li>
                <li>Resolve disputes</li>
                <li>Maintain security and operational records</li>
                <li>Comply with legal, accounting, tax, or regulatory requirements</li>
              </ul>
              <p className="mb-2">
                When information is no longer required for these purposes, we may delete, anonymize, or securely dispose of it in accordance with applicable requirements.
              </p>
              <p className="mb-0">
                Certain property, billing, financial, security, or legal records may need to be retained for longer periods where required by law or legitimate business requirements.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 10. Account and Data Deletion */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                10. Account and Data Deletion
              </h2>
              <p className="mb-2">
                Users may request deletion of their account and associated personal information by contacting:
              </p>
              <div className="p-3 rounded-3 my-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                <p className="mb-1"><strong>Email:</strong> <a href="mailto:admin@miraiclouditservices.com" className="text-primary text-decoration-none">admin@miraiclouditservices.com</a></p>
                <p className="mb-0"><strong>Subject:</strong> Account Deletion Request</p>
              </div>
              <p className="mb-2">
                To protect users from unauthorized deletion requests, we may require verification of the identity or authority of the person making the request.
              </p>
              <p className="mb-2">
                After verification, we will process eligible deletion requests within a reasonable period, generally within 30 days, unless information must be retained for legal, regulatory, security, financial, contractual, or other legitimate purposes.
              </p>
              <p className="mb-0 text-muted">
                Deletion of an individual user&rsquo;s account may not automatically delete information that belongs to or is controlled by a property, organization, administrator, or other authorized entity.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 11. Children’s Privacy */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                11. Children&rsquo;s Privacy
              </h2>
              <p className="mb-2">
                Mirai PMS is designed primarily for property-management, facility-management, business, security, and related operational purposes.
              </p>
              <p className="mb-2">
                The application is not directed specifically toward children. We do not knowingly design or market Mirai PMS to children.
              </p>
              <p className="mb-0">
                If you believe that personal information belonging to a child has been provided to us without appropriate authorization, please contact us at: <a href="mailto:admin@miraiclouditservices.com" className="text-primary text-decoration-none">admin@miraiclouditservices.com</a>
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 12. Payments and Financial Information */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                12. Payments and Financial Information
              </h2>
              <p className="mb-2">
                Where payment or billing functionality is provided, Mirai PMS may process information necessary to create invoices, record transactions, or track payment status.
              </p>
              <p className="mb-2">
                Where third-party payment services are used, payment information may be processed directly by the relevant payment service provider according to its own privacy policy and security practices.
              </p>
              <p className="mb-0">
                Mirai PMS does not intentionally store complete payment-card information unless specifically required and securely supported by the applicable payment infrastructure.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 13. Notifications and Communications */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                13. Notifications and Communications
              </h2>
              <p className="mb-2">Mirai PMS may send notifications relating to:</p>
              <ul className="mb-2 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Visitor entries</li>
                <li>Maintenance requests</li>
                <li>Billing and invoices</li>
                <li>Property announcements</li>
                <li>Account activity</li>
                <li>Security or access events</li>
                <li>Service-related communications</li>
              </ul>
              <p className="mb-0">
                Users may receive these communications through the application or other enabled communication channels.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 14. CCTV and Security Integrations */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                14. CCTV and Security Integrations
              </h2>
              <p className="mb-2">
                Where configured by a property or organization, Mirai PMS may integrate with CCTV, access-control, visitor-management, or other security systems.
              </p>
              <p className="mb-2">
                Such systems may process video, images, access events, or related security information.
              </p>
              <p className="mb-0">
                The use, retention, and access to such information may be controlled by the relevant property owner, organization, or administrator and may also be subject to applicable laws and regulations.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 15. User Responsibilities */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                15. User Responsibilities
              </h2>
              <p className="mb-2">Users are responsible for:</p>
              <ul className="mb-3 ps-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Providing accurate information</li>
                <li>Keeping account credentials confidential</li>
                <li>Using the application only for authorized purposes</li>
                <li>Not accessing information belonging to other users without authorization</li>
                <li>Immediately reporting suspected unauthorized access or security incidents</li>
              </ul>
              <p className="mb-0">
                Property administrators and organizations are responsible for ensuring that information entered into Mirai PMS is collected and used lawfully and with appropriate authorization.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 16. Changes to This Privacy Policy */}
            <section className="mb-4 pb-2">
              <h2 className="h5 fw-bold text-dark border-start border-3 border-primary ps-3 mb-3">
                16. Changes to This Privacy Policy
              </h2>
              <p className="mb-2">
                We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or data-processing practices.
              </p>
              <p className="mb-0">
                When material changes are made, we may update the &ldquo;Last Updated&rdquo; date and, where appropriate, provide additional notice through the application, website, or other available communication channels.
              </p>
            </section>

            <hr className="my-4" style={{ borderColor: '#E2E8F0' }} />

            {/* 17. Contact Us & 18. Application Information */}
            <div className="row g-3 pt-2">
              
              <div className="col-12 col-md-6">
                <div className="p-3.5 p-md-4 rounded-3 h-100" style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                  <h2 className="h6 fw-bold text-dark mb-2">17. Contact Us</h2>
                  <p className="mb-2" style={{ fontSize: '0.92rem' }}>
                    If you have questions, concerns, requests, or complaints regarding this Privacy Policy or the handling of personal information, please contact us:
                  </p>
                  <div className="pt-1" style={{ fontSize: '0.92rem' }}>
                    <p className="mb-1"><strong>Mirai Cloud IT Solutions</strong></p>
                    <p className="mb-1">
                      <strong>Email:</strong>{' '}
                      <a href="mailto:info@miraiclouditservices.com" className="text-primary text-decoration-none">
                        info@miraiclouditservices.com
                      </a>
                    </p>
                    <p className="mb-0">
                      <strong>Website:</strong>{' '}
                      <a href="https://miraiclouditservices.com" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                        miraiclouditservices.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3.5 p-md-4 rounded-3 h-100" style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                  <h2 className="h6 fw-bold text-dark mb-2">18. Application Information</h2>
                  <div className="pt-1" style={{ fontSize: '0.92rem' }}>
                    <p className="mb-2">
                      <strong>Application Name:</strong>{' '}
                      <span className="badge bg-primary text-white ms-1 px-2 py-1">Mirai PMS</span>
                    </p>
                    <p className="mb-2">
                      <strong>Application ID:</strong>{' '}
                      <code className="bg-white border px-2 py-0.5 rounded text-dark ms-1" style={{ fontSize: '0.85rem' }}>
                        com.mirai.mobile_pms
                      </code>
                    </p>
                    <p className="mb-0">
                      <strong>Service Provider:</strong> Mirai Cloud IT Solutions
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer inside Card */}
          <div className="border-top pt-4 mt-5 text-center text-muted" style={{ borderColor: '#E2E8F0', fontSize: '0.85rem' }}>
            &copy; 2026 Mirai Cloud IT Solutions. All rights reserved. &bull; Mirai PMS
          </div>

        </div>

      </main>

    </div>
  );
}
