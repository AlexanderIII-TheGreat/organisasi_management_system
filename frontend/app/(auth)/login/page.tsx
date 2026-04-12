'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login, getGoogleRedirectUrl } from '@/lib/api';

export default function LoginPage() {
  // ─── State (Logic Only) ─────────────────────────────────────────────
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInactive, setIsInactive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsInactive(false);

    try {
      const response = await login({ email: username, password });

      setIsLoading(false);

      if (response.success) {
        router.push('/home');
      } else {
        if (response.message?.includes('belum diaktifkan') || response.message?.includes('nonaktif')) {
          setIsInactive(true);
        }
        setError(response.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Terjadi kesalahan jaringan.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    const response = await getGoogleRedirectUrl();
    if (response.success && response.data?.url) {
      window.location.href = response.data.url;
    } else {
      setError('Gagal terhubung ke Google. Silakan coba lagi.');
      setIsGoogleLoading(false);
    }
  };

  // ─── UI Asli (Tidak Diubah — Hanya Ditambahkan Logic) ──────────────
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-hidden">
      
      <main className="flex-grow flex flex-col justify-center px-6 pt-24 pb-12 relative z-10">
        <div className="max-w-md w-full mx-auto">
          
          {/* Branding/Hero Section */}
          <header className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-white mb-6 shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
            </div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
              Masuk ke Akun
            </h1>
            <p className="text-on-surface-variant font-medium">Selamat datang kembali di pusat aksi pemuda.</p>
          </header>

          {/* Error Messages */}
          {error && (
            <div className={`mb-6 px-5 py-4 rounded-2xl flex items-start gap-3 ${isInactive ? 'bg-[#FFF3E0] border border-[#FFB74D]' : 'bg-error-container border border-error-container'}`}>
              <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${isInactive ? 'text-[#E67E22]' : 'text-on-error-container'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {isInactive ? 'hourglass_top' : 'error'}
              </span>
              <div>
                <p className={`text-sm font-semibold ${isInactive ? 'text-[#E67E22]' : 'text-on-error-container'}`}>
                  {isInactive ? 'Akun Belum Aktif' : 'Login Gagal'}
                </p>
                <p className={`text-xs mt-1 ${isInactive ? 'text-[#BF6A12]' : 'text-on-error-container/80'}`}>
                  {isInactive
                    ? 'Akun Anda sedang menunggu verifikasi dari admin. Silakan periksa email Anda secara berkala untuk pembaruan.'
                    : error}
                </p>
              </div>
            </div>
          )}

          {/* Login Form Container */}
          <section className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/15 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface px-1" htmlFor="username">
                  E-Mail
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-4 py-4 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl transition-all duration-200 placeholder:text-outline/60 text-on-surface" 
                    id="username" 
                    placeholder="Masukkan email" 
                    type="email"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-semibold text-on-surface" htmlFor="password">
                    Kata Sandi
                  </label>
                  <Link href="/lupa-password" className="text-xs font-bold text-primary hover:underline">
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-12 py-4 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl transition-all duration-200 placeholder:text-outline/60 text-on-surface" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button 
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-surface-container-lowest text-outline font-medium uppercase tracking-wider">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            {/* Social Login */}
            <button className="w-full py-4 bg-surface-container-high text-on-surface font-semibold rounded-full flex items-center justify-center gap-3 hover:bg-surface-variant transition-colors active:scale-95 duration-150 border border-outline-variant/10 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
              {isGoogleLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              )}
              Masuk dengan Google
            </button>
          </section>

          {/* Registration Link */}
          <footer className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant font-medium">
              Belum punya akun? {" "}
              <Link href="/daftar" className="text-primary font-bold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </footer>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/10 mt-auto bg-surface-container-low/30">
        <div className="text-lg font-bold text-primary font-headline tracking-tighter">
          Karang Taruna
        </div>
        <p className="text-on-surface-variant text-sm font-medium">
          © 2024 Karang Taruna. Built for the modern steward.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-on-surface-variant text-xs font-semibold hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-on-surface-variant text-xs font-semibold hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </footer>

      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/3 bg-gradient-to-tr from-secondary-container/20 to-transparent blur-3xl rounded-full"></div>
    </div>
  );
}