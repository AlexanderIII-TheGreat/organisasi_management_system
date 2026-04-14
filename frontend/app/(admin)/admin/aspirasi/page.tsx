'use client';

import { useEffect, useState } from 'react';
import { getAspirations, updateAspirationStatus } from '@/lib/api';
import ModernModal from '@/components/modern-modal';

interface AspirationData {
  id: number;
  category: string;
  message: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  user?: {
    name: string;
    photo: string | null;
  };
}

export default function AdminAspirasiPage() {
  const [aspirations, setAspirations] = useState<AspirationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    type: 'confirm' | 'alert' | 'error' | 'success';
    confirmText?: string;
    onConfirm?: () => void;
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

  useEffect(() => {
    async function fetchAspirations() {
      try {
        const response = await getAspirations<AspirationData[]>();
        if (response.success && response.data) {
          setAspirations(response.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAspirations();
  }, []);

  const handleStatusChange = (id: number, newStatus: string) => {
    showModal({
      title: 'Update Status Aspirasi',
      message: `Ubah status aspirasi ini menjadi "${newStatus.toUpperCase()}"?`,
      type: 'confirm',
      confirmText: 'Terapkan Perubahan',
      onConfirm: async () => {
        try {
          const res = await updateAspirationStatus(id, newStatus);
          if (res.success) {
            setAspirations(aspirations.map(a => a.id === id ? { ...a, status: newStatus } : a));
            showModal({ title: 'Tersimpan', message: 'Status aspirasi telah diperbarui.', type: 'success' });
          } else {
            showModal({ title: 'Gagal', message: res.message || 'Gagal mengubah status', type: 'error' });
          }
        } catch (e) {
          showModal({ title: 'Kesalahan', message: 'Gagal menghubungi server.', type: 'error' });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary">Tinjauan Aspirasi</h1>
        <p className="text-on-surface-variant font-medium mt-1">Kelola dan tindaklanjuti masukan dari warga dan anggota.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
        {isLoading ? (
           <div className="p-12 flex justify-center">
             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
           </div>
        ) : aspirations.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 text-outline-variant">inbox</span>
            <p>Belum ada aspirasi yang masuk.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {aspirations.map(aspiration => (
              <div key={aspiration.id} className="p-6 hover:bg-surface-container-lowest transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {aspiration.category}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {new Date(aspiration.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-on-surface font-medium leading-relaxed bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 italic">
                    "{aspiration.message}"
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                      {aspiration.is_anonymous ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[12px]">visibility_off</span>
                        </div>
                      ) : (
                        <img 
                          src={aspiration.user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(aspiration.user?.name || 'Anon')}`} 
                          alt="Sender" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant">
                      Dikirim oleh: {aspiration.is_anonymous ? 'Anonim (Dilindungi)' : aspiration.user?.name}
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Status Tinjauan</span>
                  <select 
                    value={aspiration.status}
                    onChange={(e) => handleStatusChange(aspiration.id, e.target.value)}
                    className={`font-bold border border-outline-variant/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto appearance-none cursor-pointer text-sm ${
                      aspiration.status === 'selesai' ? 'bg-secondary-container text-on-secondary-container' :
                      aspiration.status === 'belum ditinjau' ? 'bg-error/10 text-error' :
                      'bg-primary/10 text-primary'
                    }`}
                  >
                    <option value="belum ditinjau">Belum Ditinjau</option>
                    <option value="sedang ditinjau">Sedang Ditinjau</option>
                    <option value="sedang ditangani">Sedang Ditangani</option>
                    <option value="akan dibahas">Akan Dibahas (Rapat)</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Modal System */}
      <ModernModal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
