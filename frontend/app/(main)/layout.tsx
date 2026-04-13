import Navbar from '@/components/navbar';
import AuthGuard from '@/components/auth-guard';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen pb-24 md:pb-0 pt-20 md:pt-24">
        <Navbar />
        
        {/* Konten Utama */}
        <main className="max-w-7xl mx-auto px-6 space-y-12">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}