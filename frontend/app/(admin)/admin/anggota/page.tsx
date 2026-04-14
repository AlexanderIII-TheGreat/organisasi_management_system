'use client';

import { useEffect, useState } from 'react';
import { getUsers, updateUserStatus, updateUserRole, deleteUser, sendActivationEmail, getPositions, updateUserPosition, sendWhatsAppReminder, renewMembership, updateExpiryDate } from '@/lib/api';
import ModernModal from '@/components/modern-modal';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  member_number: string | null;
  photo: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  position_id: number | null;
  position: string | null;
  remaining_days: number | null;
  renewal_requested_at: string | null;
}

export default function AdminAnggotaPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    type: 'confirm' | 'alert' | 'input' | 'error' | 'success';
    inputType?: string;
    inputValue?: string;
    confirmText?: string;
    onConfirm?: (val?: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm'
  });

  const showModal = (config: Omit<typeof modalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Data Meta for Pagination (Mocked structure based on Laravel paginator)
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchUsers = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await getUsers<UserData[]>({ page: page.toString(), search, per_page: '15' });
      if (response.success && response.data) {
        setUsers(response.data); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    const fetchPositions = async () => {
      try {
        const res = await getPositions<any[]>();
        if (res.success && res.data) {
          setPositions(res.data);
        }
      } catch (e) {
        console.error("Gagal ambil posisi:", e);
      }
    };
    fetchPositions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  const handeStatusChange = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
    
    showModal({
      title: 'Ubah Status Anggota',
      message: `Apakah Anda yakin ingin mengubah status user ini menjadi ${newStatus.toUpperCase()}?`,
      type: 'confirm',
      confirmText: 'Ya, Ubah Status',
      onConfirm: async () => {
        try {
          const res = await updateUserStatus(userId, newStatus);
          if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            showModal({ title: 'Berhasil', message: 'Status anggota berhasil diperbarui.', type: 'success' });
          } else {
            showModal({ title: 'Gagal', message: res.message || 'Error tidak diketahui', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server.', type: 'error' });
        }
      }
    });
  };

  const handleRoleChange = (userId: number, newRole: 'admin' | 'pengurus' | 'anggota') => {
    showModal({
      title: 'Ubah Peran Anggota',
      message: `Yakin ingin mengubah peran anggota ini menjadi ${newRole.toUpperCase()}?`,
      type: 'confirm',
      confirmText: 'Ya, Ubah Peran',
      onConfirm: async () => {
        try {
          const res = await updateUserRole(userId, newRole);
          if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showModal({ title: 'Berhasil', message: 'Peran anggota berhasil diperbarui.', type: 'success' });
          } else {
            showModal({ title: 'Gagal', message: res.message || 'Gagal mengubah role', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server.', type: 'error' });
        }
      }
    });
  };

  const handlePositionChange = async (userId: number, positionId: number) => {
    try {
      const res = await updateUserPosition(userId, positionId);
      if (res.success) {
        const updatedPos = positions.find(p => p.id === positionId)?.name || 'Anggota';
        setUsers(users.map(u => u.id === userId ? { ...u, position_id: positionId, position: updatedPos } : u));
      } else {
        showModal({ title: 'Gagal', message: res.message || 'Gagal mengubah jabatan', type: 'error' });
      }
    } catch (e) {
      showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server.', type: 'error' });
    }
  };

  const handleSendEmail = (userId: number) => {
    showModal({
      title: 'Kirim Email Aktivasi',
      message: 'Sistem akan mengirimkan email berisi konfirmasi aktivasi dan Nomor Anggota (NIA). Lanjutkan?',
      type: 'confirm',
      confirmText: 'Kirim Sekarang',
      onConfirm: async () => {
        try {
          const res = await sendActivationEmail(userId);
          if (res.success) {
            showModal({ title: 'Terkirim!', message: res.message ?? 'Email aktivasi berhasil dikirim.', type: 'success' });
          } else {
            showModal({ title: 'Gagal', message: res.message ?? 'Gagal mengirim email.', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server mail.', type: 'error' });
        }
      }
    });
  };

  const handleSendWhatsappReminder = (userId: number) => {
    showModal({
      title: 'Kirim Pengingat WA',
      message: 'Kirimkan pesan WhatsApp berisi pengingat perpanjangan masa aktif ke nomor anggota ini?',
      type: 'confirm',
      confirmText: 'Kirim WhatsApp',
      onConfirm: async () => {
        try {
          const res = await sendWhatsAppReminder(userId);
          if (res.success) {
            showModal({ title: 'Berhasil', message: res.message ?? 'WhatsApp reminder berhasil dikirim.', type: 'success' });
          } else {
            showModal({ title: 'Gagal', message: res.message ?? 'Gagal mengirim WhatsApp.', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server WhatsApp', type: 'error' });
        }
      }
    });
  };

  const handleRenewMembership = (userId: number) => {
    showModal({
      title: 'Setujui Perpanjangan',
      message: 'Masa aktif anggota akan ditambah 1 bulan dari sekarang atau tanggal berakhir terakhir. Lanjutkan?',
      type: 'confirm',
      confirmText: 'Setujui & Perpanjang',
      onConfirm: async () => {
        try {
          const res = await renewMembership(userId);
          if (res.success) {
            showModal({ title: 'Berhasil', message: 'Masa aktif telah diperpanjang 1 bulan.', type: 'success' });
            fetchUsers();
          } else {
            showModal({ title: 'Gagal', message: res.message || 'Gagal memperpanjang.', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server', type: 'error' });
        }
      }
    });
  };

  const handleEditExpiryDate = (userId: number) => {
    showModal({
      title: 'Ubah Masa Aktif',
      message: 'Masukkan tanggal kedaluwarsa baru untuk anggota ini agar dapat mengakses fitur portal.',
      type: 'input',
      inputType: 'date',
      confirmText: 'Simpan Tanggal',
      onConfirm: async (newDate) => {
        if (!newDate) return;
        try {
          const res = await updateExpiryDate(userId, newDate);
          if (res.success) {
            showModal({ title: 'Diperbarui', message: 'Tanggal kedaluwarsa berhasil diperbarui.', type: 'success' });
            fetchUsers();
          } else {
            showModal({ title: 'Gagal', message: res.message || 'Gagal memperbarui tanggal.', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Koneksi Error', message: 'Gagal menghubungi server', type: 'error' });
        }
      }
    });
  };

  const handleDelete = (userId: number) => {
    showModal({
      title: 'Hapus Anggota?',
      message: 'Peringatan: Aksi ini permanen dan tidak dapat dibatalkan. Seluruh data user ini akan hilang.',
      type: 'error',
      confirmText: 'Ya, Hapus Permanen',
      onConfirm: async () => {
        try {
          const res = await deleteUser(userId);
          if (res.success) {
            setUsers(users.filter(u => u.id !== userId));
            showModal({ title: 'Terhapus', message: 'User berhasil dihapus.', type: 'success' });
          } else {
            showModal({ title: 'Gagal', message: res.message, type: 'error' });
          }
        } catch(e) {
          showModal({ title: 'Error', message: 'Gagal menghapus user.', type: 'error' });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Manajemen Anggota</h1>
          <p className="text-on-surface-variant font-medium">Verifikasi pendaftar baru dan kelola peran anggota.</p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
          />
          <button type="submit" className="px-5 py-3 bg-primary text-white rounded-xl font-bold active:scale-95 transition-all">
            Cari
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                <th className="p-4 font-bold text-[10px] md:text-sm text-on-surface-variant uppercase tracking-wider">User</th>
                <th className="p-4 font-bold text-[10px] md:text-sm text-on-surface-variant uppercase tracking-wider">Kontak & Alamat</th>
                <th className="p-4 font-bold text-[10px] md:text-sm text-on-surface-variant uppercase tracking-wider">Status & Kedudukan</th>
                <th className="p-4 font-bold text-[10px] md:text-sm text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
                    Memuat data anggota...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-outline-variant/20">
                          <img src={u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-sm md:text-base leading-tight mb-1">{u.name}</div>
                          <div className="flex flex-col gap-1 items-start">
                            <div className="text-[10px] md:text-xs font-mono text-primary font-bold bg-primary/5 inline-block px-2 py-0.5 rounded-md leading-none">{u.member_number || 'BELUM ADA NIA'}</div>
                            {u.status === 'aktif' && u.remaining_days !== null && (
                              <div className="flex flex-col gap-1">
                                <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-tight px-1 ${u.remaining_days <= 3 ? 'text-error' : 'text-on-surface-variant/60'}`}>
                                  {u.remaining_days <= 0 ? 'Kedaluwarsa' : `Sisa ${Math.floor(u.remaining_days)} hari`}
                                </div>
                                {u.renewal_requested_at && (
                                  <button 
                                    onClick={() => handleRenewMembership(u.id)}
                                    className="px-2 py-1 bg-amber-500 text-white rounded-md text-[9px] font-bold uppercase hover:bg-amber-600 transition-all active:scale-95 shadow-sm"
                                  >
                                    Perpanjang Membership
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top max-w-[200px] md:max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          <span className="truncate">{u.phone || '-'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px] mt-0.5">location_on</span>
                          <span className="line-clamp-2 md:whitespace-normal whitespace-pre-wrap leading-tight">
                            {[u.address, u.district, u.city, u.province].filter(Boolean).join(', ') || '-'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                       <div className="space-y-3">
                        <button 
                          onClick={() => handeStatusChange(u.id, u.status)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 w-max transition-transform active:scale-95 shadow-sm ${
                            u.status === 'aktif' ? 'bg-secondary-container text-on-secondary-container hover:bg-red-100 hover:text-red-700' 
                            : 'bg-error text-white hover:bg-green-600'
                          }`}
                          title="Klik untuk mengubah status"
                        >
                          {u.status === 'aktif' ? 'Aktif' : 'Tinjau / Aktifkan'}
                        </button>
                        
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] uppercase font-bold text-on-surface-variant">Kedudukan:</span>
                           <select 
                            value={u.position_id || ''}
                            onChange={(e) => handlePositionChange(u.id, parseInt(e.target.value))}
                            className="text-xs font-bold bg-white border border-outline-variant/30 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                          >
                            <option value="" disabled>Pilih Jabatan</option>
                            {positions.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                           <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="text-xs font-bold bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                          >
                            <option value="anggota">Role: Anggota</option>
                            <option value="pengurus">Role: Pengurus</option>
                            <option value="admin">Role: Admin</option>
                          </select>
                        </div>
                       </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col items-end gap-2">
                        {u.status === 'aktif' && (
                          <button 
                            onClick={() => handleSendEmail(u.id)}
                            className="p-2 text-primary bg-primary/5 hover:bg-primary/20 rounded-xl transition-colors border border-primary/20"
                            title="Kirim Email Pemberitahuan Aktivasi & NIA"
                          >
                            <span className="material-symbols-outlined text-sm md:text-base">forward_to_inbox</span>
                          </button>
                        )}
                        {u.status === 'aktif' && u.phone && (
                          <button 
                            onClick={() => handleSendWhatsappReminder(u.id)}
                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                            title="Kirim Pengingat Perpanjangan WA"
                          >
                            <span className="material-symbols-outlined text-sm md:text-base">chat</span>
                          </button>
                        )}
                        {u.status === 'aktif' && (
                          <button 
                            onClick={() => handleEditExpiryDate(u.id)}
                            className="p-2 text-primary bg-primary/5 hover:bg-primary/20 rounded-xl transition-colors border border-primary/20"
                            title="Ubah Tanggal Kedaluwarsa Manual"
                          >
                            <span className="material-symbols-outlined text-sm md:text-base">event</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors"
                          title="Hapus User"
                        >
                          <span className="material-symbols-outlined text-sm md:text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modern Modal System */}
      <ModernModal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        inputType={modalConfig.inputType}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
