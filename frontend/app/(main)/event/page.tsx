'use client';

import { useEffect, useState } from 'react';
import { getEvents, getStoredUser } from '@/lib/api';

interface EventData {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  location: string;
  event_date: string;
  status: string;
  panitias?: Array<{
    id: number;
    name: string;
    photo: string | null;
  }>;
}

export default function EventPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Ambil data user login untuk pengecekan badge panitia
    setCurrentUser(getStoredUser());

    const fetchEvents = async () => {
      try {
        const response = await getEvents<EventData[]>();
        if (response.success && response.data) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'berlangsung':
        return (
          <div className="absolute top-4 left-4 bg-error text-on-error px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 z-10">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Sedang Berlangsung
          </div>
        );
      case 'mendatang':
        return (
          <div className="absolute top-4 left-4 bg-primary-fixed-dim text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10">
            Akan Datang
          </div>
        );
      case 'selesai':
        return (
          <div className="absolute top-4 left-4 bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10">
            Telah Selesai
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Page Title Section */}
      <div className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-4">
          Agenda Kegiatan
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          Jadwal kegiatan pemberdayaan pemuda dan bakti sosial masyarakat. Mari berkontribusi untuk lingkungan yang lebih baik.
        </p>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-xl h-[400px] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => {
              // Cek apakah user saat ini adalah panitia di event ini
              const isUserPanitia = event.panitias?.some(p => p.id === currentUser?.id);

              return (
                <div key={event.id} className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      src={event.image || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800"} 
                    />
                    {getStatusBadge(event.status)}
                    
                    {/* Badge Panitia Dinamis */}
                    {isUserPanitia && (
                      <div className="absolute bottom-4 right-4 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-lg z-10 transition-transform group-hover:scale-105">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                        Anda Panitia
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    
                    {/* Daftar Wajah Panitia (Avatar Group) */}
                    <div className="flex items-center mb-6">
                      <div className="flex -space-x-3 overflow-hidden">
                        {event.panitias?.slice(0, 3).map((panitia) => (
                          <img
                            key={panitia.id}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            src={panitia.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(panitia.name)}&background=random`}
                            alt={panitia.name}
                            title={panitia.name}
                          />
                        ))}
                      </div>
                      {event.panitias && event.panitias.length > 0 && (
                        <span className="text-[10px] font-bold text-on-surface-variant ml-3 bg-surface-container-high px-2 py-1 rounded-md">
                          {event.panitias.length > 3 ? `+${event.panitias.length - 3} ` : ""}Panitia
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mt-auto">
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary-fixed-dim">calendar_today</span>
                        <span className="text-sm font-medium">
                          {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary-fixed-dim">schedule</span>
                        <span className="text-sm font-medium">
                          {new Date(event.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary-fixed-dim">location_on</span>
                        <span className="text-sm font-medium">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">event_busy</span>
              <p className="text-on-surface-variant font-medium text-lg">Belum ada agenda kegiatan saat ini.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}