import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy – Mirai PMS | Mirai Cloud IT Solutions',
  description: 'Official Privacy Policy for Mirai PMS application and services operated by Mirai Cloud IT Solutions.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-800/90 border border-slate-700/70 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        
        {/* Header */}
        <div className="border-b border-slate-700/80 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400">Privacy Policy – Mirai PMS</h1>
            <p className="text-sm text-slate-400 mt-2">
              <span className="font-medium text-slate-300">Effective Date:</span> 19 November 2026 &nbsp;&bull;&nbsp; 
              <span className="font-medium text-slate-300"> Last Updated:</span> 19 November 2026
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
          >
            &larr; Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          
          {/* Overview */}
          <section className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
            <p>
              Mirai PMS is a property management platform operated by <strong>Mirai Cloud IT Solutions</strong> (&ldquo;Mirai,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). Mirai PMS helps property owners, administrators, facility teams, security personnel, residents, tenants, and authorized users manage properties, units, visitors, access, billing, maintenance, and related operations.
            </p>
            <p className="mt-3">
              This Privacy Policy explains how we collect, use, store, share, and protect information when you use the Mirai PMS mobile application, web application, and related services.
            </p>
            <p className="mt-3 font-medium text-blue-300">
              By using Mirai PMS, you acknowledge the practices described in this Privacy Policy.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>
              Depending on how Mirai PMS is configured and used by your organization or property, we may collect the following categories of information:
            </p>

            <div className="mt-4 space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-blue-300 text-base mb-2">1.1 Account and Profile Information</h3>
                <p className="mb-2">We may collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Login credentials or authentication information</li>
                  <li>User role and access permissions</li>
                  <li>Profile information provided by the user or authorized administrator</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-blue-300 text-base mb-2">1.2 Property and Tenancy Information</h3>
                <p className="mb-2">Mirai PMS may process information related to properties and their occupants, including:</p>
                <ul className="list-disc pl-5 space-y-1">
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

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-blue-300 text-base mb-2">1.3 Visitor and Access Information</h3>
                <p className="mb-2">Where visitor and security-management features are enabled, the application may process:</p>
                <ul className="list-disc pl-5 space-y-1">
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

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-blue-300 text-base mb-2">1.4 Device and Technical Information</h3>
                <p className="mb-2">We may collect limited technical information necessary to operate, maintain, and troubleshoot the application, such as:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Device type and model</li>
                  <li>Operating system and application version</li>
                  <li>Network information</li>
                  <li>Error logs and diagnostic information</li>
                  <li>Device identifiers where technically required</li>
                  <li>Application usage and performance information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Camera Permission</h2>
            <p>
              Mirai PMS may request access to your device camera for features that require capturing or scanning images, such as:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Visitor photographs</li>
              <li>Document or image capture</li>
              <li>QR-code or barcode scanning</li>
              <li>Other camera-based functions available within the application</li>
            </ul>
            <p className="mt-3">
              The camera is accessed when the user initiates a camera-based feature or when such access is required for an enabled application function.
            </p>
            <p className="mt-2 text-slate-400 italic">
              We do not use the camera for continuous or background surveillance through the mobile application unless a specific feature clearly requires and communicates such functionality.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Photos and Files</h2>
            <p>
              Mirai PMS may allow users to select or upload photographs, documents, or other files for legitimate property-management purposes, such as maintenance requests, resident records, visitor management, or supporting documents.
            </p>
            <p className="mt-2">
              We access files or photos only as necessary for the feature being used and subject to the permissions provided by the device and operating system.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. How We Use Information</h2>
            <p>We may use collected information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
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

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Property Administrator and Organization-Controlled Data</h2>
            <p>
              Mirai PMS may be provided to organizations, property owners, facility managers, residential communities, commercial properties, or other entities.
            </p>
            <p className="mt-2">
              In such cases, the organization or property administrator may determine what resident, tenant, visitor, employee, vendor, or property information is entered into the system and how that information is used for their operational purposes.
            </p>
            <p className="mt-2">
              If you use Mirai PMS through an organization, property, employer, residential community, or facility, questions regarding information entered or managed by that organization may need to be directed to the relevant administrator.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Sharing of Information</h2>
            <p className="font-semibold text-slate-200">
              We do not sell or rent personal information to third parties for advertising purposes.
            </p>
            <p className="mt-2">
              Information may be shared or made accessible in the following circumstances:
            </p>
            <div className="mt-3 space-y-3">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-blue-300">Authorized Users and Administrators:</span>
                <p className="text-slate-300 text-sm mt-1">
                  Information may be accessible to authorized property administrators, management personnel, security personnel, residents, tenants, vendors, or other users according to their assigned roles and permissions.
                </p>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-blue-300">Service Providers:</span>
                <p className="text-slate-300 text-sm mt-1">
                  We may use trusted third-party service providers to host, store, process, secure, or support Mirai PMS. Depending on the services actually enabled, these providers may include cloud infrastructure, database hosting, notification, communication, analytics, payment, or other technology providers.
                </p>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-blue-300">Legal Requirements:</span>
                <p className="text-slate-300 text-sm mt-1 mb-1">
                  We may disclose information where reasonably necessary to:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Comply with applicable law or legal process</li>
                  <li>Respond to lawful requests from government or law-enforcement authorities</li>
                  <li>Protect the rights, safety, security, or property of Mirai, our users, or others</li>
                  <li>Investigate fraud, abuse, security incidents, or unauthorized activity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Third-Party Services and Infrastructure</h2>
            <p>
              Mirai PMS may use third-party technology and cloud infrastructure to provide its services.
            </p>
            <p className="mt-2">
              Depending on the application configuration and features enabled, these services may include cloud hosting, database services, notification services, communication services, payment services, analytics, or integrations with third-party security/property-management systems.
            </p>
            <p className="mt-2">
              Third-party service providers may process information only as necessary to provide their relevant services, subject to their applicable terms and privacy policies.
            </p>
            <p className="mt-2">
              We will update this Privacy Policy when material changes to third-party data processing are introduced.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Data Security</h2>
            <p>
              We take reasonable technical and organizational measures to protect information against unauthorized access, alteration, disclosure, loss, or misuse.
            </p>
            <p className="mt-2 mb-2">Depending on the applicable service and implementation, security measures may include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>HTTPS/TLS-secured communication</li>
              <li>Authentication and access controls</li>
              <li>Role-based access permissions</li>
              <li>Secure credential handling</li>
              <li>Access restrictions for administrative functions</li>
              <li>Monitoring and troubleshooting measures</li>
            </ul>
            <p className="mt-3 text-slate-400 text-sm">
              However, no internet-based application or electronic storage system can be guaranteed to be completely secure.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Data Retention</h2>
            <p className="mb-2">We retain information for as long as reasonably necessary to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide Mirai PMS services</li>
              <li>Maintain user and property records</li>
              <li>Meet contractual obligations</li>
              <li>Resolve disputes</li>
              <li>Maintain security and operational records</li>
              <li>Comply with legal, accounting, tax, or regulatory requirements</li>
            </ul>
            <p className="mt-3">
              When information is no longer required for these purposes, we may delete, anonymize, or securely dispose of it in accordance with applicable requirements.
            </p>
            <p className="mt-2">
              Certain property, billing, financial, security, or legal records may need to be retained for longer periods where required by law or legitimate business requirements.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/60">
            <h2 className="text-xl font-bold text-white mb-3">10. Account and Data Deletion</h2>
            <p>
              Users may request deletion of their account and associated personal information by contacting:
            </p>
            <div className="my-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
              <p><strong>Email:</strong> <a href="mailto:admin@miraiclouditservices.com" className="text-blue-400 underline">admin@miraiclouditservices.com</a></p>
              <p><strong>Subject:</strong> Account Deletion Request</p>
            </div>
            <p>
              To protect users from unauthorized deletion requests, we may require verification of the identity or authority of the person making the request.
            </p>
            <p className="mt-2">
              After verification, we will process eligible deletion requests within a reasonable period, generally within 30 days, unless information must be retained for legal, regulatory, security, financial, contractual, or other legitimate purposes.
            </p>
            <p className="mt-2 text-slate-400 text-sm">
              Deletion of an individual user’s account may not automatically delete information that belongs to or is controlled by a property, organization, administrator, or other authorized entity.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Children&rsquo;s Privacy</h2>
            <p>
              Mirai PMS is designed primarily for property-management, facility-management, business, security, and related operational purposes.
            </p>
            <p className="mt-2">
              The application is not directed specifically toward children. We do not knowingly design or market Mirai PMS to children.
            </p>
            <p className="mt-2">
              If you believe that personal information belonging to a child has been provided to us without appropriate authorization, please contact us at: <a href="mailto:admin@miraiclouditservices.com" className="text-blue-400 underline">admin@miraiclouditservices.com</a>
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Payments and Financial Information</h2>
            <p>
              Where payment or billing functionality is provided, Mirai PMS may process information necessary to create invoices, record transactions, or track payment status.
            </p>
            <p className="mt-2">
              Where third-party payment services are used, payment information may be processed directly by the relevant payment service provider according to its own privacy policy and security practices.
            </p>
            <p className="mt-2">
              Mirai PMS does not intentionally store complete payment-card information unless specifically required and securely supported by the applicable payment infrastructure.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Notifications and Communications</h2>
            <p className="mb-2">Mirai PMS may send notifications relating to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Visitor entries</li>
              <li>Maintenance requests</li>
              <li>Billing and invoices</li>
              <li>Property announcements</li>
              <li>Account activity</li>
              <li>Security or access events</li>
              <li>Service-related communications</li>
            </ul>
            <p className="mt-2">
              Users may receive these communications through the application or other enabled communication channels.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. CCTV and Security Integrations</h2>
            <p>
              Where configured by a property or organization, Mirai PMS may integrate with CCTV, access-control, visitor-management, or other security systems.
            </p>
            <p className="mt-2">
              Such systems may process video, images, access events, or related security information.
            </p>
            <p className="mt-2">
              The use, retention, and access to such information may be controlled by the relevant property owner, organization, or administrator and may also be subject to applicable laws and regulations.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. User Responsibilities</h2>
            <p className="mb-2">Users are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Providing accurate information</li>
              <li>Keeping account credentials confidential</li>
              <li>Using the application only for authorized purposes</li>
              <li>Not accessing information belonging to other users without authorization</li>
              <li>Immediately reporting suspected unauthorized access or security incidents</li>
            </ul>
            <p className="mt-3">
              Property administrators and organizations are responsible for ensuring that information entered into Mirai PMS is collected and used lawfully and with appropriate authorization.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or data-processing practices.
            </p>
            <p className="mt-2">
              When material changes are made, we may update the &ldquo;Last Updated&rdquo; date and, where appropriate, provide additional notice through the application, website, or other available communication channels.
            </p>
          </section>

          {/* Section 17 & 18 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Section 17 */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700">
              <h2 className="text-lg font-bold text-white mb-2">17. Contact Us</h2>
              <p className="text-slate-300 text-sm mb-3">
                If you have questions, concerns, requests, or complaints regarding this Privacy Policy or the handling of personal information, please contact us:
              </p>
              <div className="text-sm space-y-1.5 text-slate-300">
                <p><strong>Entity:</strong> Mirai Cloud IT Solutions</p>
                <p><strong>Email:</strong> <a href="mailto:info@miraiclouditservices.com" className="text-blue-400 underline">info@miraiclouditservices.com</a></p>
                <p><strong>Website:</strong> <a href="https://miraiclouditservices.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">miraiclouditservices.com</a></p>
              </div>
            </div>

            {/* Section 18 */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700">
              <h2 className="text-lg font-bold text-white mb-2">18. Application Information</h2>
              <div className="text-sm space-y-2 text-slate-300 mt-3">
                <p><strong>Application Name:</strong> <span className="text-blue-300">Mirai PMS</span></p>
                <p><strong>Application ID:</strong> <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-300 text-xs">com.mirai.mobile_pms</span></p>
                <p><strong>Service Provider:</strong> Mirai Cloud IT Solutions</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
