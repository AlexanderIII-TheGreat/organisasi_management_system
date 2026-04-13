'use client';

import { useEffect, useState, useRef } from 'react';
import { getMe, logout, updateProfile, updatePassword } from '@/lib/api';
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
  phone: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  events_count?: number;
}

export default function ProfilPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    district: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await getMe();
      if (response.success && response.data) {
        const userData = response.data as UserData;
        setUser(userData);
        setEditForm({
          name: userData.name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          province: userData.province || '',
          city: userData.city || '',
          district: userData.district || '',
        });
      }
    } catch (error) {
      console.error('Gagal mengambil data profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout gagal:', error);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setIsUpdating(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui.' });
        await fetchUser();
      } else {
        setMessage({ type: 'error', text: res.message || 'Gagal memperbarui foto profil.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengunggah foto.' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await updateProfile(editForm);
      if (res.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
        setShowEditProfile(false);
        await fetchUser();
      } else {
        setMessage({ type: 'error', text: res.message || 'Gagal memperbarui profil.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updatePassword(passwordForm);
      if (res.success) {
        setMessage({ type: 'success', text: 'Kata sandi berhasil diubah.' });
        setShowChangePassword(false);
        setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Gagal mengubah kata sandi.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengubah kata sandi.' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage(null), 3000);
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
      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-24 right-6 left-6 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-error text-white'
        }`}>
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      {/* Identity Header Section */}
      <section className="flex flex-col items-center mb-10 text-center">
        <div className="relative group mb-6">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface bg-surface-container-low">
              <img 
                className="w-full h-full object-cover" 
                alt={user.name} 
                src={user.photo || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
              />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handlePhotoChange} 
          />
          <button 
            onClick={handlePhotoClick}
            disabled={isUpdating}
            className="absolute bottom-0 right-0 bg-primary text-on-primary p-2.5 rounded-full shadow-lg border-4 border-surface hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isUpdating ? 'sync' : 'camera_alt'}
            </span>
          </button>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">{user.name}</h1>
          <p className="text-on-surface-variant font-medium text-sm">NIA: {user.member_number || 'BELUM TERSEDIA'}</p>
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
          <p className="text-lg font-bold text-primary">{user.points?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] text-center shadow-sm border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Jabatan</p>
          <p className="text-[11px] font-bold text-primary truncate px-1">{user.position || user.role?.toUpperCase()}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] text-center shadow-sm border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Level</p>
          <p className="text-lg font-bold text-primary">{user.level || 'Beginner'}</p>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/10 overflow-hidden mb-10">
        <div className="py-2">
          {/* Menu Item 1: Ubah Data Diri */}
          <button 
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors group"
          >
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

          {/* Menu Item 2: Ubah Kata Sandi */}
          <button 
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors group"
          >
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

      {/* MODAL: Edit Profile */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
          <div className="bg-surface rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-primary">Ubah Data Diri</h3>
                <button onClick={() => setShowEditProfile(false)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Provinsi</label>
                    <input 
                      type="text" 
                      value={editForm.province}
                      onChange={(e) => setEditForm({...editForm, province: e.target.value})}
                      placeholder="Jawa Tengah"
                      className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Kota/Kab</label>
                    <input 
                      type="text" 
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      placeholder="Kota Semarang"
                      className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Alamat Lengkap</label>
                  <textarea 
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="Jl. Merdeka No. 123"
                    className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold h-24 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Nomor Telepon</label>
                  <input 
                    type="tel" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="0812xxxx"
                    className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Password */}
      {showChangePassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
          <div className="bg-surface rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-primary">Ubah Kata Sandi</h3>
                <button onClick={() => setShowChangePassword(false)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Kata Sandi Lama</label>
                  <input 
                    type="password" 
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Konfirmasi Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
                    placeholder="Masukkan ulang kata sandi baru"
                    className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Memproses...' : 'Perbarui Kata Sandi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* App Footer Info */}
      <div className="mt-8 text-center pb-10">
        <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Karang Taruna Digital v2.4.0</p>
      </div>
    </>
  );
}