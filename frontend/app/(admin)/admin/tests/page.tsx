'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getTalentTests, createTalentTest, updateTalentTest, deleteTalentTest, createTalentTestQuestion } from '@/lib/api';
import ModernModal from '@/components/modern-modal';

interface TalentTest {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  status: string;
  questions_count?: number;
}

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TalentTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State Test
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TalentTest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  
  // Modern Modal State
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

  const showPrompt = (config: Omit<typeof modalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closePrompt = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Form State Test
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 10,
    status: 'aktif'
  });

  // Form State Question
  const [questionData, setQuestionData] = useState({
    question: '',
    weight: 1,
    options: [
      { option_text: '', score: 10, recommended_division: '' },
      { option_text: '', score: 10, recommended_division: '' },
      { option_text: '', score: 10, recommended_division: '' },
      { option_text: '', score: 10, recommended_division: '' },
    ]
  });

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const response = await getTalentTests();
      if (response.success && response.data) {
        setTests(response.data as unknown as TalentTest[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const openAddModal = () => {
    setEditingTest(null);
    setFormData({ title: '', description: '', duration_minutes: 10, status: 'aktif' });
    setIsModalOpen(true);
  };

  const openEditModal = (test: TalentTest) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description || '',
      duration_minutes: test.duration_minutes || 10,
      status: test.status || 'aktif'
    });
    setIsModalOpen(true);
  };

  const openQuestionModal = (testId: number) => {
    setSelectedTestId(testId);
    setQuestionData({
      question: '',
      weight: 1,
      options: [
        { option_text: '', score: 10, recommended_division: '' },
        { option_text: '', score: 10, recommended_division: '' },
        { option_text: '', score: 10, recommended_division: '' },
        { option_text: '', score: 10, recommended_division: '' },
      ]
    });
    setIsQuestionModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsQuestionModalOpen(false);
    setEditingTest(null);
    setSelectedTestId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let res;
      if (editingTest) {
        res = await updateTalentTest(editingTest.id, formData);
      } else {
        res = await createTalentTest(formData);
      }

      if (res.success) {
        closeModal();
        fetchTests();
        showPrompt({ title: 'Berhasil', message: 'Data tes berhasil disimpan.', type: 'success' });
      } else {
        showPrompt({ title: 'Gagal', message: res.message || 'Terjadi kesalahan saat menyimpan data tes.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      showPrompt({ title: 'Koneksi Error', message: 'Gagal menghubungi server.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) return;
    setIsSubmitting(true);

    try {
      const res = await createTalentTestQuestion(selectedTestId, questionData);
      if (res.success) {
        closeModal();
        fetchTests(); // Refresh stats (increment questions_count)
        showPrompt({ title: 'Berhasil', message: 'Pertanyaan baru berhasil ditambahkan.', type: 'success' });
      } else {
        showPrompt({ title: 'Gagal', message: res.message || 'Tertolak oleh server.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      showPrompt({ title: 'Kesalahan', message: 'Gagal menghubungi server.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    showPrompt({
      title: 'Hapus Modul Tes?',
      message: 'Apakah Anda yakin ingin menghapus tes ini beserta semua pertanyaannya secara permanen?',
      type: 'error',
      confirmText: 'Ya, Hapus Permanen',
      onConfirm: async () => {
        try {
          const res = await deleteTalentTest(id);
          if (res.success) {
            setTests(tests.filter(t => t.id !== id));
            showPrompt({ title: 'Terhapus', message: 'Modul tes telah dihapus.', type: 'success' });
          } else {
            showPrompt({ title: 'Gagal', message: res.message || 'Gagal menghapus tes.', type: 'error' });
          }
        } catch (e) {
          showPrompt({ title: 'Error', message: 'Gagal menghubungi server', type: 'error' });
        }
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Tes Minat & Bakat</h1>
          <p className="text-on-surface-variant font-medium">Kelola modul tes, daftar pertanyaan, dan parameter divisi pendaftar.</p>
        </div>
        <button onClick={openAddModal} className="px-6 py-3 bg-primary text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 w-full md:w-auto hover:bg-primary-dim">
          <span className="material-symbols-outlined">add</span> Tambah Tes Baru
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl mb-4 text-outline-variant">quiz</span>
            <p>Belum ada modul tes bakat yang dibuat.</p>
          </div>
        ) : (
          tests.map(test => (
            <div key={test.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => openEditModal(test)} className="w-8 h-8 rounded-full bg-white shadow border border-outline-variant/10 flex items-center justify-center text-primary hover:scale-110 transition-transform" title="Edit Pengaturan Tes">
                   <span className="material-symbols-outlined text-[16px]">edit</span>
                 </button>
                 <button onClick={() => openQuestionModal(test.id)} className="w-8 h-8 rounded-full bg-white shadow border border-outline-variant/10 flex items-center justify-center text-tertiary hover:scale-110 transition-transform" title="Tambah Pertanyaan">
                   <span className="material-symbols-outlined text-[16px]">post_add</span>
                 </button>
                 <button onClick={() => handleDelete(test.id)} className="w-8 h-8 rounded-full bg-white shadow border border-outline-variant/10 flex items-center justify-center text-error hover:scale-110 transition-transform" title="Hapus Modul">
                   <span className="material-symbols-outlined text-[16px]">delete</span>
                 </button>
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">psychology</span>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                  test.status === 'aktif' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {test.status}
                </span>
              </div>
              
              <h3 className="font-extrabold text-2xl text-on-surface mb-2 pr-20">{test.title}</h3>
              <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">{test.description}</p>
              
              <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4 border-t border-outline-variant/10">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    {test.duration_minutes} Menit
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    {test.questions_count || 0} Pertanyaan
                  </div>
                </div>
                <button onClick={() => openQuestionModal(test.id)} className="text-xs font-bold text-primary hover:text-primary-dim transition-colors flex items-center gap-1">
                  Kelola Pertanyaan <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit Ujian */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center bg-black/40 backdrop-blur-sm px-0 md:px-6">
            <div className="bg-white w-full md:w-full md:max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-8 transform transition-transform duration-300 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-on-surface">
                  {editingTest ? 'Edit Tes' : 'Tambah Modul Tes Baru'}
                </h2>
                <button onClick={closeModal} className="p-2 text-outline-variant hover:text-error transition-colors rounded-full hover:bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Judul Tes</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" 
                    placeholder="Contoh: Pemeringkatan Calon Pengurus"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Deskripsi & Instruksi</label>
                  <textarea 
                    required 
                    rows={4}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none" 
                    placeholder="Jelaskan tujuan tes ini secara singkat..."
                  ></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Durasi (Menit)</label>
                    <input 
                      required 
                      type="number" 
                      min="1"
                      value={formData.duration_minutes} 
                      onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Status Publikasi</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="aktif">Aktif (Dapat Dikerjakan)</option>
                      <option value="nonaktif">Draft / Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim transition-colors shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>}
                    Simpan Modul
                  </button>
                </div>
              </form>
            </div>
         </div>
      )}

      {/* Modal Tambah Pertanyaan */}
      {isQuestionModalOpen && (
         <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center bg-black/40 backdrop-blur-sm px-0 md:px-6">
            <div className="bg-white w-full md:w-full md:max-w-3xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-8 transform transition-transform duration-300 max-h-[95vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Penyusunan Pertanyaan</h2>
                  <p className="text-sm font-medium text-on-surface-variant mt-1">Tambahkan pertanyaan beserta 4 probabilitas pilihan gandanya.</p>
                </div>
                <button onClick={closeModal} className="p-2 text-outline-variant hover:text-error transition-colors rounded-full hover:bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleQuestionSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Pertanyaan</label>
                  <textarea 
                    required 
                    rows={2}
                    value={questionData.question} 
                    onChange={e => setQuestionData({...questionData, question: e.target.value})} 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none text-base font-medium" 
                    placeholder="Contoh: Jika ada waktu luang, apa yang kamu lakukan..."
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-on-surface-variant border-b border-outline-variant/20 pb-2">Opsi Jawaban & Pemetaan Divisi</label>
                  
                  {questionData.options.map((opt, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      
                      <input 
                        required
                        type="text"
                        value={opt.option_text}
                        onChange={(e) => {
                          const newOpts = [...questionData.options];
                          newOpts[index].option_text = e.target.value;
                          setQuestionData({...questionData, options: newOpts});
                        }}
                        className="w-full md:flex-1 px-3 py-2 bg-white border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        placeholder="Kalimat jawaban..."
                      />

                      <div className="flex gap-2 w-full md:w-auto">
                        <select
                          required
                          value={opt.recommended_division}
                          onChange={(e) => {
                            const newOpts = [...questionData.options];
                            newOpts[index].recommended_division = e.target.value;
                            setQuestionData({...questionData, options: newOpts});
                          }}
                          className="w-full md:w-[160px] px-3 py-2 bg-white border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm cursor-pointer"
                        >
                          <option value="" disabled>Pilih Divisi...</option>
                          <option value="Humas & Media">Humas & Media</option>
                          <option value="Kreatif & Konsep">Kreatif & Konsep</option>
                          <option value="Logistik & Dana">Logistik & Dana</option>
                          <option value="Olahraga">Olahraga</option>
                          <option value="Kerohanian">Kerohanian</option>
                        </select>
                        
                        <input 
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={opt.score}
                          title="Bobot Nilai"
                          onChange={(e) => {
                            const newOpts = [...questionData.options];
                            newOpts[index].score = parseInt(e.target.value);
                            setQuestionData({...questionData, options: newOpts});
                          }}
                          className="w-20 px-3 py-2 bg-white border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-tertiary text-white font-bold rounded-xl hover:bg-tertiary/90 transition-colors shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>}
                    Simpan Pertanyaan
                  </button>
                </div>
              </form>
            </div>
         </div>
      )}
      
      {/* Modern Modal System */}
      <ModernModal 
        isOpen={modalConfig.isOpen}
        onClose={closePrompt}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
