'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { provinsi, kabupaten, kecamatan, type Provinsi, type Kabupaten, type Kecamatan } from 'daftar-wilayah-indonesia';
import { registerWithPhoto, getGoogleRedirectUrl } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFieldError(errors: Record<string, string[]> | undefined, field: string) {
  return errors?.[field]?.[0] ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DaftarPage() {

  // ── Form state ───────────────────────────────────────────────────────────
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [password, setPassword]   = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);

  // ── Wilayah state ────────────────────────────────────────────────────────
  const [provinsiList, setProvinsiList]   = useState<Provinsi[]>([]);
  const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);

  const [selectedProvinsi, setSelectedProvinsi]   = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');

  // ── Nama wilayah (untuk dikirim ke backend) ───────────────────────────────
  const [namaProvinsi, setNamaProvinsi]   = useState('');
  const [namaKabupaten, setNamaKabupaten] = useState('');
  const [namaKecamatan, setNamaKecamatan] = useState('');

  // ── Foto profil state ────────────────────────────────────────────────────
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]         = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]                 = useState('');
  const [fieldErrors, setFieldErrors]     = useState<Record<string, string[]>>({});
  const [success, setSuccess]             = useState(false);

  // ── Load provinsi on mount ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const data = provinsi();
      setProvinsiList(data);
    } catch (e) {
      console.error('Gagal memuat data provinsi:', e);
    }
  }, []);

  // ── Cascading: provinsi → kabupaten ─────────────────────────────────────
  const handleProvinsiChange = useCallback((kode: string) => {
    setSelectedProvinsi(kode);
    setSelectedKabupaten('');
    setSelectedKecamatan('');
    setKecamatanList([]);

    const found = provinsiList.find(p => p.kode === kode);
    setNamaProvinsi(found?.nama ?? '');

    if (kode) {
      try {
        const data = kabupaten(kode);
        setKabupatenList(data);
      } catch {
        setKabupatenList([]);
      }
    } else {
      setKabupatenList([]);
    }
  }, [provinsiList]);

  // ── Cascading: kabupaten → kecamatan ─────────────────────────────────────
  const handleKabupatenChange = useCallback((kode: string) => {
    setSelectedKabupaten(kode);
    setSelectedKecamatan('');

    const found = kabupatenList.find(k => k.kode === kode);
    setNamaKabupaten(found?.nama ?? '');

    if (kode) {
      try {
        const data = kecamatan(kode);
        setKecamatanList(data);
      } catch {
        setKecamatanList([]);
      }
    } else {
      setKecamatanList([]);
    }
  }, [kabupatenList]);

  const handleKecamatanChange = useCallback((kode: string) => {
    setSelectedKecamatan(kode);
    const found = kecamatanList.find(k => k.kode === kode);
    setNamaKecamatan(found?.nama ?? '');
  }, [kecamatanList]);

  // ── Foto profil handler ───────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, photo: ['Ukuran foto maksimal 2MB.'] }));
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFieldErrors(prev => { const next = { ...prev }; delete next.photo; return next; });
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (password !== passwordConf) {
      setFieldErrors({ password_confirmation: ['Konfirmasi password tidak cocok.'] });
      return;
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('password_confirmation', passwordConf);
      if (phone)          fd.append('phone',    phone);
      if (address)        fd.append('address',  address);
      if (namaProvinsi)   fd.append('province', namaProvinsi);
      if (namaKabupaten)  fd.append('city',     namaKabupaten);
      if (namaKecamatan)  fd.append('district', namaKecamatan);
      if (photoFile)      fd.append('photo',    photoFile);

      const response = await registerWithPhoto(fd);

      if (response.success) {
        setSuccess(true);
      } else {
        if (response.errors) setFieldErrors(response.errors);
        setError(response.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const response = await getGoogleRedirectUrl();
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Gagal terhubung ke Google. Silakan coba lagi.');
        setIsGoogleLoading(false);
      }
    } catch {
      setIsGoogleLoading(false);
    }
  };

  // ─── UI ──────────────────────────────────────────────────────────────────

  // Halaman sukses
  if (success) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-hidden">
        <main className="flex-grow flex flex-col justify-center items-center px-6 relative z-10">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="material-symbols-outlined text-5xl text-[#2E7D32]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">
              Pendaftaran Berhasil!
            </h1>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Akun Anda telah terdaftar dan sedang menunggu verifikasi dari admin. 
              Kami akan menghubungi Anda setelah akun diaktifkan.
            </p>
            <Link
              href="/login"
              className="inline-block bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-extrabold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
            >
              Kembali ke Login
            </Link>
          </div>
        </main>
        <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full" />
        <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/3 bg-gradient-to-tr from-secondary-container/20 to-transparent blur-3xl rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-hidden">

      {/* Top Bar
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/70 backdrop-blur-xl">
        <div className="text-2xl font-bold tracking-tight text-primary font-headline">
          Karang Taruna
        </div>
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors rounded-full active:scale-95"
        >
          Masuk
        </Link>
      </nav> */}

      <main className="flex-grow pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-[1000px] mx-auto">

          {/* Header */}
          <header className="mb-12 text-center md:text-left">
            <h1 className="font-headline font-extrabold text-5xl md:text-6xl text-primary tracking-tighter mb-4">
              Daftar Akun Baru
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl">
              Bergabunglah dengan generasi baru pemimpin komunitas. Platform ini dirancang untuk memberdayakan pemuda dalam menciptakan perubahan nyata.
            </p>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="mb-8 px-5 py-4 rounded-2xl flex items-start gap-3 bg-error-container border border-error-container">
              <span className="material-symbols-outlined text-xl shrink-0 mt-0.5 text-on-error-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                error
              </span>
              <div>
                <p className="text-sm font-semibold text-on-error-container">Pendaftaran Gagal</p>
                <p className="text-xs mt-1 text-on-error-container/80">{error}</p>
              </div>
            </div>
          )}

          {/* Form Container */}
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-outline-variant/15 grid grid-cols-1 md:grid-cols-12 gap-12">

            {/* ── Foto Profil ── */}
            <div className="md:col-span-4 flex flex-col items-center">
              <label className="font-headline font-bold text-primary mb-6 self-start uppercase tracking-widest text-xs">
                Foto Profil
              </label>

              <div
                className="relative group cursor-pointer"
                onClick={() => photoInputRef.current?.click()}
              >
                <div className="w-48 h-48 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex justify-center items-center overflow-hidden transition-all group-hover:border-primary">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Preview foto profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-outline-variant text-5xl group-hover:text-primary transition-colors">
                      person
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">{photoPreview ? 'edit' : 'add_a_photo'}</span>
                </div>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
                id="photo-upload"
              />

              <p className="text-[10px] text-center text-on-surface-variant mt-4 font-medium uppercase tracking-wider">
                Klik untuk unggah (Max 2MB)
              </p>

              {formatFieldError(fieldErrors, 'photo') && (
                <p className="text-xs text-error mt-2 text-center">{formatFieldError(fieldErrors, 'photo')}</p>
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="mt-3 text-xs text-error hover:underline font-medium"
                >
                  Hapus foto
                </button>
              )}
            </div>

            {/* ── Fields ── */}
            <div className="md:col-span-8 space-y-8">
              <form className="space-y-6" onSubmit={handleSubmit}>

                {/* Identity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama */}
                  <div className="space-y-1.5">
                    <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="fullname">
                      Nama Lengkap <span className="text-error">*</span>
                    </label>
                    <input
                      className={`w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50 ${formatFieldError(fieldErrors, 'name') ? 'ring-2 ring-error/40' : ''}`}
                      id="fullname"
                      placeholder="Contoh: Andi Wijaya"
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setError(''); }}
                      required
                    />
                    {formatFieldError(fieldErrors, 'name') && (
                      <p className="text-xs text-error mt-1">{formatFieldError(fieldErrors, 'name')}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="email">
                      Email Address <span className="text-error">*</span>
                    </label>
                    <input
                      className={`w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50 ${formatFieldError(fieldErrors, 'email') ? 'ring-2 ring-error/40' : ''}`}
                      id="email"
                      placeholder="andi@example.com"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      required
                    />
                    {formatFieldError(fieldErrors, 'email') && (
                      <p className="text-xs text-error mt-1">{formatFieldError(fieldErrors, 'email')}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="phone">
                    Nomor Telepon
                  </label>
                  <input
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50"
                    id="phone"
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="password">
                      Password <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50 pr-12 ${formatFieldError(fieldErrors, 'password') ? 'ring-2 ring-error/40' : ''}`}
                        id="password"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {formatFieldError(fieldErrors, 'password') && (
                      <p className="text-xs text-error mt-1">{formatFieldError(fieldErrors, 'password')}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="password_confirmation">
                      Konfirmasi Password <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50 pr-12 ${formatFieldError(fieldErrors, 'password_confirmation') ? 'ring-2 ring-error/40' : ''}`}
                        id="password_confirmation"
                        placeholder="••••••••"
                        type={showPasswordConf ? 'text' : 'password'}
                        value={passwordConf}
                        onChange={e => setPasswordConf(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                        type="button"
                        onClick={() => setShowPasswordConf(!showPasswordConf)}
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPasswordConf ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {formatFieldError(fieldErrors, 'password_confirmation') && (
                      <p className="text-xs text-error mt-1">{formatFieldError(fieldErrors, 'password_confirmation')}</p>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6 pt-4 border-t border-outline-variant/15">

                  <div className="space-y-1.5">
                    <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="address">
                      Alamat Lengkap
                    </label>
                    <textarea
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50 resize-none"
                      id="address"
                      placeholder="Nama jalan, nomor rumah..."
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Cascading Wilayah */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Provinsi */}
                    <div className="space-y-1.5">
                      <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="provinsi">
                        Provinsi
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none pr-10 cursor-pointer"
                          id="provinsi"
                          value={selectedProvinsi}
                          onChange={e => handleProvinsiChange(e.target.value)}
                        >
                          <option value="">Pilih Provinsi</option>
                          {provinsiList.map(p => (
                            <option key={p.kode} value={p.kode}>{p.nama}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none text-[18px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Kabupaten/Kota */}
                    <div className="space-y-1.5">
                      <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="kabupaten">
                        Kabupaten / Kota
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          id="kabupaten"
                          value={selectedKabupaten}
                          onChange={e => handleKabupatenChange(e.target.value)}
                          disabled={!selectedProvinsi}
                        >
                          <option value="">{selectedProvinsi ? 'Pilih Kab/Kota' : '— Pilih Provinsi dulu —'}</option>
                          {kabupatenList.map(k => (
                            <option key={k.kode} value={k.kode}>{k.nama}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none text-[18px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Kecamatan */}
                    <div className="space-y-1.5">
                      <label className="block font-headline font-bold text-sm text-on-surface" htmlFor="kecamatan">
                        Kecamatan
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          id="kecamatan"
                          value={selectedKecamatan}
                          onChange={e => handleKecamatanChange(e.target.value)}
                          disabled={!selectedKabupaten}
                        >
                          <option value="">{selectedKabupaten ? 'Pilih Kecamatan' : '— Pilih Kab/Kota dulu —'}</option>
                          {kecamatanList.map(k => (
                            <option key={k.kode} value={k.kode}>{k.nama}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none text-[18px]">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 space-y-4">
                  <button
                    className="w-full bg-primary text-on-primary py-4 rounded-full font-headline font-extrabold text-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Mendaftarkan...
                      </>
                    ) : (
                      'Daftar Sekarang'
                    )}
                  </button>

                  <div className="relative flex items-center justify-center py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-outline-variant/30" />
                    </div>
                    <span className="relative bg-surface-container-lowest px-4 text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                      Atau daftar melalui
                    </span>
                  </div>

                  <button
                    className="w-full bg-surface-container-high text-on-surface py-4 rounded-full font-headline font-bold flex items-center justify-center gap-3 hover:bg-surface-variant transition-all active:scale-95 border border-outline-variant/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    Daftar dengan Google
                  </button>
                </div>
              </form>

              <div className="text-center pt-4">
                <p className="text-on-surface-variant font-medium text-sm">
                  Sudah memiliki akun?{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                    Login di sini
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/10 mt-auto bg-surface-container-low/30">
        <div className="text-lg font-bold text-primary font-headline tracking-tighter">
          Karang Taruna
        </div>
        <p className="text-on-surface-variant text-sm font-medium">
          © 2024 Karang Taruna. Built for the modern steward.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-on-surface-variant text-xs font-semibold hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-on-surface-variant text-xs font-semibold hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </footer>

      {/* Decorative background */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/3 bg-gradient-to-tr from-secondary-container/20 to-transparent blur-3xl rounded-full" />
    </div>
  );
}