'use client';

import { useEffect, useState } from 'react';
import { getAspirations, submitAspiration } from '@/lib/api';

interface Aspiration {
  id: number;
  category: string;
  message: string;
  is_anonymous: boolean;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export default function AspirasiPage() {
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [category, setCategory] = useState('Saran Kegiatan');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['Saran Kegiatan', 'Keluhan Fasilitas', 'Ide Inovasi'];

  const fetchAspirations = async () => {
    try {
      const response = await getAspirations<Aspiration[]>();
      if (response.success && response.data) {
        setAspirations(response.data);
      }
    } catch (error) {
      console.error('Gagal mengambil riwayat aspirasi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await submitAspiration({
        category,
        message,
        is_anonymous: isAnonymous
      });

      if (response.success) {
        setSuccessMsg('Aspirasi Anda berhasil dikirim!');
        setMessage('');
        fetchAspirations(); // Refresh list
      } else {
        setErrorMsg(response.message || 'Gagal mengirim aspirasi.');
      }
    } catch (error) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'belum ditinjau':
      case 'sedang ditinjau':
        return (
          <div className="flex items-center gap-2 pt-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Sedang Ditinjau</span>
          </div>
        );
      case 'selesai':
        return (
          <div className="flex items-center gap-2 pt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Selesai</span>
          </div>
        );
      case 'dalam diskusi':
      case 'akan dibahas':
        return (
          <div className="flex items-center gap-2 pt-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">Dalam Diskusi</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 pt-2 text-on-surface-variant font-bold text-[10px]">
            {status.toUpperCase()}
          </div>
        );
    }
  };

  return (
    <>
      {/* Header Page Section */}
      <header className="max-w-4xl mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight">
          Aspirasi Anda
        </h1>
        <p className="text-on-surface-variant text-lg mt-3">
          Sampaikan ide, saran, atau keluhan untuk kemajuan lingkungan kita bersama.
        </p>
      </header>

      {/* Split Layout for Desktop/Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
        
        {/* ================= LEFT COLUMN: FORM ASPIRASI ================= */}
        <section className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-outline-variant/10 space-y-8">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">edit_note</span>
              <h2 className="text-xl font-bold">Buat Aspirasi Baru</h2>
            </div>

            {successMsg && <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-bold rounded-xl">{successMsg}</div>}
            {errorMsg && <div className="p-4 bg-error/10 text-error text-sm font-bold rounded-xl">{errorMsg}</div>}

            {/* Category Selector */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pilih Kategori</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                      category === cat ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pesan Aspirasi</label>
                <span className="text-[10px] font-bold text-on-surface-variant">{message.length} / 1000</span>
              </div>
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40 p-4 transition-all resize-none" 
                placeholder="Apa yang ingin Anda sampaikan? Tulis detailnya di sini..." 
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between py-4 border-y border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {isAnonymous ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">Kirim sebagai Anonim</span>
                  <span className="text-[10px] text-on-surface-variant">Identitas Anda tidak akan ditampilkan</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  className="sr-only peer" 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <div className="w-12 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
            >
              <span>{submitting ? 'Mengirim...' : 'Kirim Aspirasi'}</span>
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>

          {/* Privacy Box */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">security</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-on-surface">Privasi & Keamanan Terjaga</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Semua aspirasi diproses secara profesional oleh pengurus inti Karang Taruna untuk memastikan tindak lanjut yang tepat sasaran.
              </p>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: RIWAYAT ASPIRASI ================= */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">history</span>
              <h3 className="text-2xl font-bold text-on-surface">Riwayat Aspirasi</h3>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-surface-container-low rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {aspirations.length > 0 ? (
                aspirations.map((item) => (
                  <div key={item.id} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 hover:border-primary/20 transition-all shadow-sm hover:shadow-md space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-[10px] font-black uppercase tracking-widest">{item.category}</div>
                      <span className="text-[11px] text-on-surface-variant font-bold">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed font-medium">
                      {item.message}
                    </p>
                    {item.admin_response && (
                      <div className="p-3 bg-primary/5 rounded-xl border-l-4 border-primary mt-2">
                        <p className="text-[10px] font-bold text-primary uppercase mb-1">Respon Pengurus:</p>
                        <p className="text-xs text-on-surface-variant italic">"{item.admin_response}"</p>
                      </div>
                    )}
                    {getStatusBadge(item.status)}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">forum</span>
                  <p className="text-on-surface-variant font-medium">Anda belum pernah mengirim aspirasi.</p>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </>
  );
}