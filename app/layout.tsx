import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { AppLayout } from '../components/layout/AppLayout';

export const metadata = {
  title: 'NexusPMS - Multi-Tenant Property Management SaaS',
  description: 'Enterprise Residential, Commercial & Co-working Property Management SaaS Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
