'use client';

import { useEffect, useState } from 'react';
import { getMe, logout } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  name: string;
  email: string;
  member_number: string | null;
  photo: string | null;
  avatar: string | null;
  position: string | null;
  role: string;
  status: string;
  points: number;
  level: string;
  events_count?: number;
}

export default function ProfilPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        if (response.success && response.data) {
          setUser(response.data as UserData);
        }
      } catch (error) {
        console.error('Gagal mengambil data profil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout gagal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-bold animate-pulse uppercase tracking-widest text-xs">Memuat Profil...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* Identity Header Section */}
      <section className="flex flex-col items-center mb-10 text-center">
        <div className="relative group mb-6">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface">
              <img 
                className="w-full h-full object-cover" 
                alt={user.name} 
                src={user.photo || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
              />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-2.5 rounded-full shadow-lg border-4 border-surface hover:scale-105 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
          </button>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">{user.name}</h1>
          <p className="text-on-surface-variant font-medium text-sm">NIA: {user.member_number || 'BELUM TERSEDI'}</p>
          <div className="mt-3 flex justify-center">
            <span className={`px-4 py-1.5 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
              user.status === 'aktif' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${user.status === 'aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {user.status === 'aktif' ? 'Anggota Aktif' : 'Menunggu Aktivasi'}
            </span>
          </div>
        </div>
      </section>

      {/* Stats Bento-style Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] text-center shadow-sm border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Point</p>
          <p className="text-lg font-bold text-primary">{user.points.toLocaleString()}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] text-center shadow-sm border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Jabatan</p>
          <p className="text-[11px] font-bold text-primary truncate px-1">{user.position || user.role?.toUpperCase()}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] text-center shadow-sm border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Level</p>
          <p className="text-lg font-bold text-primary">{user.level}</p>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/10 overflow-hidden mb-10">
        <div className="py-2">
          {/* Menu Item 1 */}
          <button className="w-full flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface text-[15px]">Ubah Data Diri</p>
                <p className="text-xs text-on-surface-variant">Update alamat & informasi kontak</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          {/* Menu Item 2 */}
          <button className="w-full flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface text-[15px]">Ubah Kata Sandi</p>
                <p className="text-xs text-on-surface-variant">Kelola keamanan akun Anda</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          {/* Danger Zone Item */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-error-container/20 transition-colors group border-t border-outline-variant/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-error/5 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-error text-[15px]">Keluar</p>
                <p className="text-xs text-error/60">Sesi aman akan segera berakhir</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* App Footer Info */}
      <div className="mt-8 text-center pb-10">
        <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Karang Taruna Digital v2.4.0</p>
      </div>
    </>
  );
}