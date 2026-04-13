'use client';

import { useEffect, useState } from 'react';
import { getUsers, updateUserStatus, updateUserRole, deleteUser, sendActivationEmail, getPositions, updateUserPosition } from '@/lib/api';

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
}

export default function AdminAnggotaPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data Meta for Pagination (Mocked structure based on Laravel paginator)
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchUsers = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await getUsers({ page: page.toString(), search, per_page: '15' });
      if (response.success && response.data) {
        // Asumsi laravel pagination resource array dibungkus dalam 'data' array
        setUsers(response.data as unknown as UserData[]); 
        // Note: For full pagination you'd extract meta here. Keeping simple for sprint.
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUsers();
    
    // Fetch positions
    const fetchPositions = async () => {
      try {
        const res = await getPositions();
        if (res.success && res.data) {
          setPositions(res.data as any[]);
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

  const handeStatusChange = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
    if (!confirm(`Yakin ingin mengubah status user menjadi ${newStatus}?`)) return;
    
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengubah status');
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'pengurus' | 'anggota') => {
    if (!confirm(`Yakin ingin mengubah role menjadi ${newRole}?`)) return;

    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengubah role');
    }
  };

  const handlePositionChange = async (userId: number, positionId: number) => {
    try {
      const res = await updateUserPosition(userId, positionId);
      if (res.success) {
        const updatedPos = positions.find(p => p.id === positionId)?.name || 'Anggota';
        setUsers(users.map(u => u.id === userId ? { ...u, position_id: positionId, position: updatedPos } : u));
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengubah jabatan');
    }
  };

  const handleSendEmail = async (userId: number) => {
    if (!confirm('Kirimkan pemberitahuan aktivasi via Email ke user ini?')) return;
    try {
      const res = await sendActivationEmail(userId);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.message || 'Gagal mengirim email.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server mail');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Peringatan: Aksi ini akan menghapus data user secara permanen. Lanjutkan?')) return;

    try {
      const res = await deleteUser(userId);
      if (res.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
         alert(res.message);
      }
    } catch(e) {
      alert('Gagal menghapus');
    }
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
                          <div className="text-xs font-mono text-primary font-bold bg-primary/5 inline-block px-2 py-0.5 rounded-md">{u.member_number || 'BELUM ADA NIA'}</div>
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
    </div>
  );
}
