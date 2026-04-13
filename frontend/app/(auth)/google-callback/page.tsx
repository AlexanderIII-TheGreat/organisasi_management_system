'use client';

import { useEffect, useState, Suspense } from 'react';
import { getMe } from '@/lib/api';

function CallbackContent() {
  const [error, setError] = useState('');

  useEffect(() => {
    const processGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (!token) {
        window.location.href = '/login?error=google_failed';
        return;
      }

      // Simpan token sementara untuk mengambil data user
      localStorage.setItem('auth_token', token);

      try {
        const response = await getMe();
        if (response.success && response.data) {
          // Data valid, simpan user info
          localStorage.setItem('auth_user', JSON.stringify(response.data));
          
          // Redirect ke dashboard
          window.location.replace('/home');
        } else {
          // Token tidak valid atau request gagal
          localStorage.removeItem('auth_token');
          window.location.href = '/login?error=google_failed';
        }
      } catch (err) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login?error=google_failed';
      }
    };

    processGoogleCallback();
  }, []);

  return (
    <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2.5rem] border border-outline-variant/15 shadow-sm max-w-sm w-full mx-auto flex flex-col items-center">
      <div className="relative mb-6">
        {error ? (
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center shadow-lg mx-auto">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center shadow-lg shadow-primary/10 mx-auto animate-pulse">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
            </div>
            <svg className="absolute -inset-2 w-20 h-20 text-primary animate-spin" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </>
        )}
      </div>
      
      <h2 className="font-headline text-2xl font-bold text-on-surface mb-2 tracking-tight text-center">
        {error ? 'Autentikasi Gagal' : 'Menyinkronkan Akun'}
      </h2>
      
      <p className="text-on-surface-variant font-medium text-center text-sm">
        {error || 'Harap tunggu, kami sedang menyiapkan sesi Anda melalui Google...'}
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/3 bg-gradient-to-tr from-secondary-container/20 to-transparent blur-3xl rounded-full"></div>
      <Suspense fallback={<div>Loading...</div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
