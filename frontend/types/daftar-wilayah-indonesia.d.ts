// Type declarations for daftar-wilayah-indonesia
// Package: https://www.npmjs.com/package/daftar-wilayah-indonesia
// Data source: BPS (Badan Pusat Statistik) kode wilayah Indonesia

declare module 'daftar-wilayah-indonesia' {
  export interface Provinsi {
    kode: string;
    nama: string;
  }

  export interface Kabupaten {
    kode: string;
    kode_provinsi: string;
    nama: string;
  }

  export interface Kecamatan {
    kode: string;
    kode_kabupaten: string;
    nama: string;
  }

  export interface Desa {
    kode: string;
    kode_kecamatan: string;
    nama: string;
  }

  /** Mengembalikan semua provinsi di Indonesia. */
  export function provinsi(): Provinsi[];

  /**
   * Mengembalikan kabupaten/kota berdasarkan kode provinsi.
   * Jika kode tidak diberikan, mengembalikan semua kabupaten.
   */
  export function kabupaten(kodeProvinsi?: string): Kabupaten[];

  /**
   * Mengembalikan kecamatan berdasarkan kode kabupaten.
   * Jika kode tidak diberikan, mengembalikan semua kecamatan.
   */
  export function kecamatan(kodeKabupaten?: string): Kecamatan[];

  /**
   * Mengembalikan desa berdasarkan kode kecamatan.
   * Jika kode tidak diberikan, mengembalikan semua desa.
   */
  export function desa(kodeKecamatan?: string): Desa[];
}
