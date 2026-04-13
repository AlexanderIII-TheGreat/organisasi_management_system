'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe, downloadKta } from "@/lib/api";

interface UserData {
  id: number;
  name: string;
  email: string;
  member_number: string | null;
  photo: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  role: string;
  position: string | null;
  events?: Array<{
    id: number;
    title: string;
    image: string | null;
    location: string;
    event_date: string;
    status: string;
    my_position?: string;
  }>;
  talent_results?: Array<{
    id: number;
    recommended_division: string;
    total_score: number;
    analysis: string;
    talent_test: {
      title: string;
    };
  }>;
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Muat data dari cache dulu agar cepat (Optimistic UI)
    const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed as UserData);
        // Jika data ada, muat sisanya secara async di background
        setIsLoading(false);
      } catch (e) {
        console.error("Gagal parse cache:", e);
      }
    }

    async function fetchUser() {
      try {
        const response = await getMe<UserData>();
        if (response.success && response.data) {
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        }
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      await downloadKta();
    } catch (error) {
      console.error("Gagal mendownload KTA:", error);
      alert("Gagal mendownload kartu. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const joinedEvent = user.events && user.events.length > 0 ? user.events[0] : null;
  const latestTalentResult = user.talent_results && user.talent_results.length > 0 ? user.talent_results[0] : null;

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary leading-tight">
            Membangun Masa Depan Desa.
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg font-medium leading-relaxed">
            Platform digital resmi Karang Taruna untuk kolaborasi, transparansi, dan pemberdayaan pemuda desa.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Ikut Berdonasi
            </button>
            <button className="px-8 py-4 bg-secondary-container text-on-secondary-container font-bold rounded-full active:scale-95 transition-all">
              Pelajari Program
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-primary/5 flex items-center justify-between border border-outline-variant/10">
            <div className="space-y-1">
              <h3 className="font-bold text-on-surface">{user.name}</h3>
              {!user.member_number ? (
                <Link href="/profile" className="text-xs font-semibold text-green-600 hover:underline">
                  Lengkapi profil sekarang
                </Link>
              ) : (
                <p className="text-xs font-medium text-on-surface-variant">Anggota Terverifikasi</p>
              )}
            </div>
            <button className="w-12 h-12 flex items-center justify-center border-2 border-outline-variant/30 rounded-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-on-surface-variant px-1">
              {isFlipped ? 'Sisi Belakang Kartu (Peraturan)' : 'Sisi Depan Kartu Tanda Anggota'}
            </h4>
            
            <div className="relative w-full aspect-[1.6/1] preserve-3d group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              {/* Card Container with Flip Logic */}
              <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT SIDE */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary-container to-primary rounded-xl overflow-hidden shadow-2xl border border-black/5 p-4 md:p-6 flex flex-col pointer-events-none">
                  <div className="flex gap-3 items-center mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                      <img alt="Logo" className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyJfrokhgVJyBQcEYH4eA-vpDrEZIzjv_7bvVahPX7OlpL2JwQvC9rMH5ESTH3cPGpufqZEpMJkfj49dDHewL9NweYUvWTxPMiFYO4LFgyEHfWQrXbs54rCgdDsqzGdVzSqLl1Z_gsTKD8xGBswVZ_ZeRgJqJrtCHh2UspctZprCOEui0yR_BlVpcZzdMN7q9gg_NcQlKKOsAoChqHlVvI6Fj2zHoeKTa_IDFu_uiQJdPuy-aDxpN0ERcL1s12zNUD3ol8WVvm1_g0"/>
                    </div>
                    <div className="leading-tight">
                      <h5 className="text-[12px] md:text-sm font-black uppercase tracking-tight text-white">Karang Taruna Indonesia</h5>
                      <p className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase">Kartu Tanda Anggota</p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-white/20 mb-4"></div>
                  
                  <div className="flex gap-4 flex-1">
                    <div className="w-1/4">
                      <div className="aspect-[3/4] bg-white rounded shadow-inner overflow-hidden border border-black/10">
                        <img 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                          src={user.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=random"}
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-[8px] md:text-[10px] space-y-1 font-mono text-white">
                      <div className="flex"><span className="w-16 font-bold">Nama</span><span className="truncate">: {user.name}</span></div>
                      <div className="flex"><span className="w-16 font-bold">NIA</span><span>: {user.member_number || "BELUM TERSEDIA"}</span></div>
                      <div className="flex"><span className="w-16 font-bold">Alamat</span><span className="flex-1">: {[user.address, user.district, user.city, user.province].filter(Boolean).join(", ") || "Belum diisi"}</span></div>
                      <div className="flex"><span className="w-16 font-bold">Jabatan</span><span>: {user.position ? user.position.toUpperCase() : "ANGGOTA"}</span></div>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end text-[7px] md:text-[9px] font-bold text-white/80">
                    <p>Masa Berlaku : Seumur Hidup</p>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20 p-6 flex flex-col pointer-events-none">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-primary/5">
                    <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                    <h5 className="text-xs font-black uppercase tracking-tight text-primary">Ketentuan & Peraturan</h5>
                  </div>
                  <div className="flex-1 space-y-3">
                    <ul className="text-[8px] md:text-[10px] space-y-2 text-on-surface-variant font-bold list-disc pl-4">
                      <li>Kartu ini adalah tanda anggota resmi Karang Taruna Desa.</li>
                      <li>Pemegang kartu wajib menaati AD/ART organisasi yang berlaku.</li>
                      <li>Wajib dibawa & ditunjukkan saat mengikuti kegiatan resmi organisasi.</li>
                      <li>Penyalahgunaan kartu dapat dikenakan sanksi sesuai aturan internal.</li>
                      <li>Jika menemukan kartu ini, harap lapor ke sekretariat terdekat.</li>
                    </ul>
                  </div>
                  <div className="mt-auto pt-4 flex justify-center opacity-30">
                    <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-primary">Dikeluarkan Oleh Pengurus Pusat Karang Taruna</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                   <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                ) : 'Download Kartu'}
              </button>
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                title="Balik Kartu"
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isFlipped ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}
              >
                <span className={`material-symbols-outlined text-xl transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`}>
                  {isFlipped ? 'front_loader' : 'flip_to_back'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Talent Test Widget */}
      <section className="relative bg-tertiary text-on-tertiary-container p-8 md:p-12 rounded-[2rem] overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          {latestTalentResult ? (
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase">Hasil Analisis</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Divisi {latestTalentResult.recommended_division}</h2>
              <p className="text-blue-100/70 text-lg">Berdasarkan tes, kamu direkomendasikan untuk bergabung di divisi ini. Semangat berkontribusi!</p>
              <div className="flex gap-3 mt-4">
                <Link 
                  href="/minatbakat" 
                  className="px-6 py-3 bg-white text-primary font-bold rounded-full shadow-xl hover:scale-105 transition-all text-sm"
                >
                  Ulangi Tes
                </Link>
                <Link 
                  href="/profile" 
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase">Eksplorasi Divisi</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Temukan Bakatmu!</h2>
              <p className="text-blue-100/70 text-lg">Ikuti tes 5 pertanyaan untuk menentukan divisi yang cocok untukmu di Karang Taruna.</p>
              <Link 
                href="/minatbakat" 
                className="inline-block mt-4 px-10 py-4 bg-white text-primary font-bold rounded-full shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all text-center"
              >
                Mulai Tes Sekarang
              </Link>
            </div>
          )}
          <div className="hidden md:flex justify-center">
            <span className={`material-symbols-outlined text-[120px] text-white/20 ${latestTalentResult ? 'animate-pulse text-white/40' : ''}`}>
              {latestTalentResult ? 'verified_user' : 'psychology'}
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container/20 to-transparent"></div>
      </section>

      {/* 3. Quick Akses */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-primary">Quick Akses</h2>
            <p className="text-on-surface-variant text-sm">Akses cepat semua kebutuhan organisasimu</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/anggota" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">group</span>
            </div>
            <h3 className="font-bold text-lg">Anggota Lain</h3>
            <p className="text-xs text-on-surface-variant mt-1">Daftar teman sejawat</p>
          </Link>

          <Link href="/aspirasi" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
            </div>
            <h3 className="font-bold text-lg">Aspirasi</h3>
            <p className="text-xs text-on-surface-variant mt-1">Aduan & masukan warga</p>
          </Link>

          <Link href="/event" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">event</span>
            </div>
            <h3 className="font-bold text-lg">Event</h3>
            <p className="text-xs text-on-surface-variant mt-1">Kegiatan mendatang</p>
          </Link>

          <Link href="/profile" className="group p-6 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 cursor-pointer">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
            </div>
            <h3 className="font-bold text-lg">Akun</h3>
            <p className="text-xs text-on-surface-variant mt-1">Pengaturan profil</p>
          </Link>
        </div>
      </section>

      {/* 4. Upcoming Event */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-primary">Event yang Diikuti</h2>
        {joinedEvent ? (
          <div className="bg-surface-container-low rounded-[2.5rem] p-4 flex flex-col md:flex-row gap-8 items-center overflow-hidden">
            <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-[2rem] overflow-hidden">
              <img 
                alt={joinedEvent.title} 
                className="w-full h-full object-cover" 
                src={joinedEvent.image || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"}
              />
            </div>
            <div className="flex-1 space-y-6 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">Terdaftar</span>
                  {joinedEvent.my_position && (
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                      Anda Panitia
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-extrabold text-on-surface">{joinedEvent.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Tanggal</p>
                    <p className="font-bold text-sm">
                      {new Date(joinedEvent.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Lokasi</p>
                    <p className="font-bold text-sm">{joinedEvent.location}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <Link 
                  href={`/event`}
                  className="flex-1 md:flex-none px-8 py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all text-center"
                >
                  Lihat Detail
                </Link>
                <button className="p-3 border border-outline-variant rounded-xl active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant">share</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 text-center border-2 border-dashed border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">event_busy</span>
            <p className="text-on-surface-variant font-medium">Anda belum bergabung dalam agenda apapun.</p>
            <Link href="/event" className="inline-block mt-4 text-primary font-bold hover:underline">
              Cari kegiatan sekarang →
            </Link>
          </div>
        )}
      </section>
      
      {/* Global CSS for Flip Animation */}
      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  );
}