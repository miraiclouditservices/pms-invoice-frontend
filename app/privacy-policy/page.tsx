import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Mirai PMS',
  description: 'Privacy Policy for Mirai PMS application and services by Mirai Cloud IT Solutions.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <div className="border-b border-slate-700 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400">Privacy Policy</h1>
            <p className="text-sm text-slate-400 mt-1">
              Effective Date: November 19, 2026 &bull; Last Updated: November 19, 2026
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>Mirai PMS</strong> (&ldquo;Application&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
              operated by <strong>Mirai Cloud IT Solutions</strong>. Mirai PMS is a cloud-based Property Management System designed
              to streamline real estate, commercial, and residential property operations, including tenant records, lease tracking,
              visitor management, billing &amp; invoicing, CCTV integrations, and maintenance requests.
            </p>
            <p className="mt-2">
              We respect your privacy and are committed to protecting the personal data of our users, property owners, managers,
              staff, tenants, and visitors. This Privacy Policy describes how we collect, use, store, and safeguard your information
              when you use our mobile application and web portals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p>We collect information necessary to provide and enhance property management services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Account &amp; Profile Data:</strong> Full name, email address, phone number, job role/designation, and organization details when an account is provisioned.
              </li>
              <li>
                <strong>Property &amp; Tenancy Records:</strong> Unit/suite numbers, lease agreements, occupancy history, rent amounts, invoices, and maintenance logs.
              </li>
              <li>
                <strong>Visitor Information:</strong> Visitor names, vehicle numbers, contact numbers, host unit details, check-in/out timestamps, and digital access passes.
              </li>
              <li>
                <strong>Device &amp; Usage Information:</strong> Device model, operating system version, unique device identifiers, IP addresses, app version, and crash diagnostic logs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Device Permissions &amp; Hardware Access</h2>
            <p>To enable core app features, Mirai PMS requests the following permissions:</p>
            <div className="mt-3 space-y-3">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-blue-300">Camera Permission:</span>
                <p className="text-slate-400 text-sm mt-1">
                  Used solely to capture photos for maintenance issues, profile pictures, or scan QR codes for digital visitor passes and equipment checkpoints. We do not access your camera without explicit user action.
                </p>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-blue-300">Storage / Media Access:</span>
                <p className="text-slate-400 text-sm mt-1">
                  Used to allow users to attach documents, agreements, receipts, or maintenance photos from their gallery or file picker.
                </p>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-blue-300">Internet &amp; Network State:</span>
                <p className="text-slate-400 text-sm mt-1">
                  Required to securely synchronize property data, real-time alerts, and invoices with our cloud servers.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. How We Use Your Information</h2>
            <p>Your data is strictly utilized for operational and business management needs, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Managing tenant leases, units, building hierarchy, and occupancy status.</li>
              <li>Generating and tracking invoices, receipts, and payment statuses.</li>
              <li>Facilitating gate security and QR-based visitor check-in passes.</li>
              <li>Sending essential operational notifications, alerts, and system updates.</li>
              <li>Resolving technical issues and continuously improving platform performance and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Sharing and Third Parties</h2>
            <p>
              <strong>We do not sell, rent, or trade your personal data to any advertisers or third-party brokers.</strong>
            </p>
            <p className="mt-2">
              We may share information only under the following lawful circumstances:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Authorized Property Administrators:</strong> Property managers and organization admins within your enterprise have access to records relevant to their properties.</li>
              <li><strong>Cloud Infrastructure Providers:</strong> Secure cloud database and hosting providers (e.g., Render, AWS, MongoDB Cloud) bound by strict data confidentiality agreements.</li>
              <li><strong>Legal Compliance:</strong> When strictly required by law, subpoena, or competent regulatory authority.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Security &amp; Storage</h2>
            <p>
              We implement industry-standard technical and organizational security measures to protect your data, including
              TLS/SSL encryption for data in transit, encrypted storage, role-based access control (RBAC), and token-based
              session authentication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Data Retention and Account Deletion</h2>
            <p>
              We retain account information as long as your organization maintains an active subscription with Mirai PMS.
              In compliance with Google Play Store data safety requirements, users may request the deletion of their personal
              data or account at any time by emailing us at{' '}
              <a href="mailto:admin@miraiclouditservices.com" className="text-blue-400 underline">
                admin@miraiclouditservices.com
              </a>. Upon verified request, personal records not required for legal/financial audits will be permanently purged within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Children&rsquo;s Privacy</h2>
            <p>
              Mirai PMS is intended for enterprise property management and is not directed to individuals under the age of 18.
              We do not knowingly collect personal data from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy periodically. We will notify users of any material changes by updating the
              &ldquo;Last Updated&rdquo; date on this page or through an in-app notice.
            </p>
          </section>

          <section className="bg-slate-900/80 p-5 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2">10. Contact Us</h2>
            <p className="text-slate-300">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:
            </p>
            <div className="mt-3 text-sm space-y-1 text-slate-300">
              <p><strong>Company:</strong> Mirai Cloud IT Solutions</p>
              <p><strong>Product:</strong> Mirai PMS</p>
              <p><strong>Email:</strong> <a href="mailto:admin@miraiclouditservices.com" className="text-blue-400 underline">admin@miraiclouditservices.com</a></p>
              <p><strong>Location:</strong> Hyderabad, Telangana, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
