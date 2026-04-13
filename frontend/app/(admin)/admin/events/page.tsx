'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, getUsers } from '@/lib/api';

interface EventData {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  event_date: string;
  location: string;
  description: string;
  status: string;
  panitias_count: number;
  panitias?: Array<{ id: number; name: string }>;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    status: 'mendatang',
    panitias: [] as number[]
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await getEvents();
      if (response.success && response.data) {
        setEvents(response.data as unknown as EventData[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Fetch users for panitia selection
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        if (res.success && res.data) {
          setUsers(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', location: '', event_date: '', status: 'mendatang', panitias: [] });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventData) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
      status: event.status || 'mendatang',
      panitias: event.panitias?.map(p => p.id) || []
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payaload = new FormData();
      payaload.append('title', formData.title);
      payaload.append('description', formData.description);
      payaload.append('location', formData.location);
      payaload.append('event_date', formData.event_date);
      payaload.append('status', formData.status);
      
      formData.panitias.forEach((id, index) => {
        payaload.append(`panitias[${index}]`, id.toString());
      });

      if (imageFile) {
        payaload.append('image', imageFile);
      }

      let res;
      if (editingEvent) {
        res = await updateEvent(editingEvent.id, payaload);
      } else {
        res = await createEvent(payaload);
      }

      if (res.success) {
        closeModal();
        fetchEvents(); // Refresh data
      } else {
        alert(res.message || 'Terjadi kesalahan saat menyimpan event.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini secara permanen?')) return;
    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents(events.filter(ev => ev.id !== id));
      } else {
        alert(res.message || 'Gagal menghapus kegiatan.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Manajemen Event</h1>
          <p className="text-on-surface-variant font-medium">Buat, edit, dan kelola kegiatan Karang Taruna serta status pelaksanaannya.</p>
        </div>
        <button onClick={openAddModal} className="px-6 py-3 bg-primary text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 w-full md:w-auto hover:bg-primary-dim">
          <span className="material-symbols-outlined">add</span> Tambah Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl mb-4 text-outline-variant">event_busy</span>
            <p>Belum ada event yang dibuat.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => openEditModal(event)} className="w-8 h-8 rounded-full bg-white shadow border border-outline-variant/10 flex items-center justify-center text-primary hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-[16px]">edit</span>
                 </button>
                 <button onClick={() => handleDelete(event.id)} className="w-8 h-8 rounded-full bg-white shadow border border-outline-variant/10 flex items-center justify-center text-error hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-[16px]">delete</span>
                 </button>
              </div>
              
              {event.image && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 border border-outline-variant/10">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                  event.status === 'mendatang' ? 'bg-primary-container text-on-primary-container' :
                  event.status === 'berlangsung' ? 'bg-secondary-container text-on-secondary-container' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <h3 className="font-extrabold text-xl text-on-surface mb-2 line-clamp-2 pr-12">{event.title}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{event.description}</p>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>{new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="truncate max-w-[120px]">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">groups</span>
                    {event.panitias_count || 0}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit Event */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center bg-black/40 backdrop-blur-sm px-0 md:px-6">
            <div className="bg-white w-full md:w-full md:max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-8 transform transition-transform duration-300 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-on-surface">
                  {editingEvent ? 'Edit Event' : 'Tambah Event Baru'}
                </h2>
                <button onClick={closeModal} className="p-2 text-outline-variant hover:text-error transition-colors rounded-full hover:bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Upload Poster/Foto Event</label>
                  <label className="border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-surface-container-lowest transition-colors group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                      }}
                    />
                    <div className="w-12 h-12 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                    </div>
                    <span className="text-sm font-bold text-on-surface-variant">{imageFile ? imageFile.name : 'Pilih Foto Kegiatan'}</span>
                    <span className="text-xs text-outline-variant mt-1">Maks. 5MB (JPG, PNG)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Judul Kegiatan</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" 
                    placeholder="Contoh: Rapat Paripurna Tahunan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Deskripsi Singkat</label>
                  <textarea 
                    required 
                    rows={3}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none" 
                    placeholder="Tuliskan tujuan dan kegiatan utama..."
                  ></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Lokasi Kegiatan</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" 
                      placeholder="Contoh: Balai Warga RW 08"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Tanggal Pelaksanaan</label>
                    <input 
                      required 
                      type="date" 
                      value={formData.event_date} 
                      onChange={e => setFormData({...formData, event_date: e.target.value})} 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Status Event</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="mendatang">Mendatang (Persiapan)</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Kepanitiaan Event</label>
                  <select 
                    multiple
                    value={formData.panitias.map(String)}
                    onChange={e => {
                      const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setFormData({...formData, panitias: selectedIds});
                    }}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer h-32"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-on-surface-variant mt-1">Tahan tombol Ctrl (Windows) atau Command (Mac) untuk memilih lebih dari satu panitia.</p>
                </div>

                <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim transition-colors shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
         </div>
      )}

    </div>
  );
}
