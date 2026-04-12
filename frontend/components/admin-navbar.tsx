'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getMe, getStoredUser, getNotifications, markAsRead, markAllAsRead } from '@/lib/api';

interface NavUser {
  id: number;
  name: string;
  photo: string | null;
  role: string;
  position: string | null;
}

interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    title?: string;
    url?: string;
  };
  read_at: string | null;
  time_ago: string;
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser | null>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ambil data user awal dari localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser as NavUser);
    }

    // Ambil data terbaru dari server untuk sinkronisasi jika diperlukan
    async function syncData() {
      const now = Date.now();
      const lastSync = sessionStorage.getItem('last_user_sync');
      
      // Hanya sync jika data belum ada atau sudah lebih dari 60 detik
      if (!storedUser || !lastSync || now - parseInt(lastSync) > 60000) {
        try {
          const response = await getMe();
          if (response.success && response.data) {
            const freshUser = response.data as NavUser;
            setUser(freshUser);
            localStorage.setItem('auth_user', JSON.stringify(freshUser));
            sessionStorage.setItem('last_user_sync', now.toString());
          }
        } catch (error) {
          console.error("Gagal sinkronisasi data di navbar:", error);
        }
      }

      // Fetch Notifications (Selalu fetch untuk memastikan unread count update)
      try {
        const notifResponse = await getNotifications();
        if (notifResponse.success) {
          setNotifications(notifResponse.data);
          setUnreadCount(notifResponse.unread_count);
        }
      } catch (error) {
        console.error("Gagal ambil notifikasi:", error);
      }
    }
    syncData();

    // Close dropdown on click outside (Desktop ONLY)
    function handleClickOutside(event: MouseEvent) {
      if (window.innerWidth >= 768 && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReadNotif = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { nameDesktop: 'Dashboard', nameMobile: 'Dash', href: '/admin', icon: 'dashboard' },
    { nameDesktop: 'Anggota', nameMobile: 'Anggota', href: '/admin/anggota', icon: 'manage_accounts' },
    { nameDesktop: 'Events', nameMobile: 'Event', href: '/admin/events', icon: 'event_note' },
    { nameDesktop: 'Aspirasi', nameMobile: 'Aspirasi', href: '/admin/aspirasi', icon: 'rule' },
    { nameDesktop: 'Tests', nameMobile: 'Test', href: '/admin/tests', icon: 'quiz' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center px-6 h-16 md:px-12 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold text-[var(--color-primary)] font-['Manrope'] tracking-tight">Karang Taruna</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === '/admin' && item.href === '/admin');
              return (
                <Link
                  key={item.nameDesktop}
                  href={item.href}
                  className={`pb-1 transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--color-primary)] font-bold border-b-2 border-[var(--color-primary)]'
                      : 'text-slate-600 font-medium hover:text-[var(--color-primary)]'
                  }`}
                >
                  {item.nameDesktop}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-500 hover:text-[var(--color-primary)] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute top-12 right-0 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Notifikasi</h3>
                    <button 
                      onClick={handleReadAll}
                      className="text-[10px] font-bold text-primary hover:underline hover:text-primary-dim"
                    >
                      Tandai Semua Dibaca
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleReadNotif(notif.id)}
                          className={`p-4 border-b border-gray-50 flex gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.read_at ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!notif.read_at ? 'bg-primary text-white' : 'bg-gray-100 text-slate-400'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {!notif.read_at ? 'mark_chat_unread' : 'done'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                              {notif.data.message}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
                              {notif.time_ago}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">notifications_off</span>
                        <p className="text-xs text-gray-400 font-medium tracking-wide">Tidak ada notifikasi baru</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                <img 
                  alt={user?.name || "User profile"} 
                  className="w-full h-full object-cover" 
                  src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
                />
              </div>
            </div>

            <div className="flex md:hidden items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--color-primary)] leading-none truncate max-w-[80px]">{user?.name || "Guest"}</p>
                <p className="text-[8px] text-slate-500 capitalize">{user?.position || user?.role || "Anggota"}</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img 
                  alt={user?.name || "User profile"} 
                  className="w-full h-full object-cover" 
                  src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotifOpen(!isNotifOpen);
                }}
                className="relative p-2 text-slate-500 hover:text-[var(--color-primary)] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NOTIFICATION DRAWER - Moved outside header for better stacking context */}
      {isNotifOpen && (
        <div className="md:hidden fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm" onClick={() => setIsNotifOpen(false)}>
          <div className="absolute bottom-0 w-full bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-6 transition-transform duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Notifikasi</h3>
              <button onClick={handleReadAll} className="text-xs font-bold text-primary">Baca Semua</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pb-10 scrollbar-hide">
               {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      handleReadNotif(notif.id);
                    }}
                    className={`p-4 rounded-2xl flex gap-4 transition-colors ${!notif.read_at ? 'bg-primary/5' : 'bg-gray-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.read_at ? 'bg-primary text-white' : 'bg-white text-slate-400 font-bold border border-gray-100'}`}>
                      <span className="material-symbols-outlined">{!notif.read_at ? 'mark_chat_unread' : 'done'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{notif.data.message}</p>
                      <span className="text-xs text-slate-400 font-medium">{notif.time_ago}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">notifications_off</span>
                  <p className="text-gray-400 font-medium">Belum ada notifikasi baru untukmu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4_-20px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/admin' && item.href === '/admin');
            return (
              <Link
                key={item.nameMobile}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-full transition-colors ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-slate-500 hover:text-[var(--color-primary)]'
                }`}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className={`font-['Inter'] text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.nameMobile}
                </span>
              </Link>
            );
          })}
        </div>
      </footer>
    </>
  );
}