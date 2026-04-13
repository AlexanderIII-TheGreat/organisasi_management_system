'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('auth_user');
    
    // 1. Cek Token dasar
    if (!token && pathname !== '/login' && pathname !== '/daftar') {
      router.push('/login');
      return;
    }

    // 2. Cek Role jika diperlukan
    if (requiredRole && userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role !== requiredRole) {
          // Jika bukan admin/sesuai role, tendang ke home
          router.push('/home');
        }
      } catch (e) {
        console.error("Gagal verifikasi role:", e);
        router.push('/login');
      }
    }
  }, [router, pathname, requiredRole]);

  return <>{children}</>;
}
