'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser, getAdminDashboardStats } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  total_members: number;
  pending_activations: number;
  active_events: number;
  pending_aspirations: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'pengurus') {
      alert('Akses Ditolak: Halaman ini khusus untuk Admin atau Pengurus Karang Taruna.');
      router.push('/home');
      return;
    }

    setIsAdmin(true);
    setUserName(user.name);

    async function fetchStats() {
      try {
        const response = await getAdminDashboardStats();
        if (response.success && response.data) {
          setStats(response.data as DashboardStats);
        }
      } catch (e) {
        console.error('Gagal mengambil statistik dashboard:', e);
      }
    }
    fetchStats();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary">
            Dashboard Panel
          </h1>
          <p className="text-on-surface-variant font-medium mt-2">
            Selamat datang kembali, <strong>{userName}</strong>. Berikut adalah ringkasan aktivitas Karang Taruna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">groups</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Anggota</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{stats ? stats.total_members : <span className="animate-pulse">--</span>}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 flex items-center gap-4">
            <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-3xl">how_to_reg</span>
            </div>
            <div>
              <p className="text-xs font-bold text-error uppercase tracking-wider">Menunggu Aktifasi</p>
              <h3 className="text-3xl font-extrabold text-error mt-1">{stats ? stats.pending_activations : <span className="animate-pulse">--</span>}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container text-3xl">event</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Event Aktif</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{stats ? stats.active_events : <span className="animate-pulse">--</span>}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 flex items-center gap-4">
            <div className="w-14 h-14 bg-tertiary-container rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-container text-3xl">campaign</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Aspirasi Masuk</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{stats ? stats.pending_aspirations : <span className="animate-pulse">--</span>}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-primary">Akses Cepat Pengelolaan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/admin/anggota" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">manage_accounts</span>
            </div>
            <h3 className="font-bold text-lg">Anggota</h3>
            <p className="text-xs text-on-surface-variant mt-1">Verifikasi & Status</p>
          </Link>

          <Link href="/admin/events" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">event_note</span>
            </div>
            <h3 className="font-bold text-lg">Event</h3>
            <p className="text-xs text-on-surface-variant mt-1">Kelola Kegiatan</p>
          </Link>

          <Link href="/admin/aspirasi" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">rule</span>
            </div>
            <h3 className="font-bold text-lg">Aspirasi</h3>
            <p className="text-xs text-on-surface-variant mt-1">Tinjau Masukan</p>
          </Link>

          <Link href="/admin/tests" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">quiz</span>
            </div>
            <h3 className="font-bold text-lg">Tes Bakat</h3>
            <p className="text-xs text-on-surface-variant mt-1">Ubah Pertanyaan</p>
          </Link>
        </div>
      </section>
    </>
  );
}
