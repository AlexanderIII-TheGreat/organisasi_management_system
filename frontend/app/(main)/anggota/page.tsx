'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/api';

interface Member {
  id: number;
  name: string;
  photo: string | null;
  position: string | null;
  role: string;
}

export default function AnggotaPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  const filters = ['Semua', 'Ketua', 'Sekretaris', 'Bendahara', 'Humas', 'Anggota'];

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await getUsers<Member[]>();
      if (response.success && response.data) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data anggota:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'Semua' || m.position === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Search & Filter Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
              Organisasi
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight">
              Direktori Anggota
            </h1>
            <p className="text-on-surface-variant text-lg font-medium max-w-xl">
              Temukan dan terhubung dengan sesama penggerak organisasi dalam platform kolaborasi digital.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <span className="material-symbols-outlined text-sm">group</span>
            <span>{members.length} Anggota Terdaftar</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Search Bar */}
          <div className="lg:col-span-5 relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              className="w-full pl-14 pr-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all text-on-surface placeholder:text-on-surface-variant/50 font-medium" 
              placeholder="Cari nama anggota..." 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {filters.map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    activeFilter === filter 
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                      : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:bg-secondary-container hover:text-on-secondary-container'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Member List Grid */}
      {loading ? (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-[2rem] p-6 flex flex-col items-center animate-pulse">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface-container-highest mb-4"></div>
              <div className="h-4 w-24 bg-surface-container-highest rounded mb-3"></div>
              <div className="h-3 w-16 bg-surface-container-highest rounded-full"></div>
            </div>
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div key={member.id} className="bg-surface-container-lowest rounded-[2rem] p-6 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                <div className="relative mb-4 group">
                  <img 
                    alt={member.name} 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-surface shadow-md" 
                    src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                  />
                  <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-bold text-on-surface text-base md:text-lg leading-tight mb-2">{member.name}</h3>
                <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider">
                  {member.position || 'Anggota'}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">person_search</span>
              <p className="text-on-surface-variant font-medium text-lg">Tidak ada anggota yang ditemukan.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}