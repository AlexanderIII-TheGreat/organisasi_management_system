import AdminNavbar from '@/components/admin-navbar';
import React from 'react';
import AuthGuard from '@/components/auth-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen pb-24 md:pb-0 pt-20 md:pt-24 bg-surface-container-lowest">
        <AdminNavbar />
        
        {/* Konten Utama Admin */}
        <main className="max-w-7xl mx-auto px-6 space-y-12">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
