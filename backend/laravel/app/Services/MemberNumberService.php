<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class MemberNumberService
{
    // ─── Kode Wilayah (BPS) ───────────────────────────────────────────────────
    //
    // Kode provinsi dan kota mengacu pada kode BPS (Badan Pusat Statistik)
    // yang digunakan sebagai standar kode wilayah resmi Indonesia.
    //
    // Format Nomor Anggota: [2-digit provinsi][2-digit kota][4-digit urut]
    // Contoh Semarang: 33 (Jawa Tengah) + 74 (Kota Semarang) + 0001 = "33740001"
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mapping nama provinsi (lowercase) ke kode BPS 2-digit.
     *
     * @var array<string, string>
     */
    private const PROVINCE_CODES = [
        'aceh'                   => '11',
        'sumatera utara'         => '12',
        'sumatera barat'         => '13',
        'riau'                   => '14',
        'jambi'                  => '15',
        'sumatera selatan'       => '16',
        'bengkulu'               => '17',
        'lampung'                => '18',
        'kepulauan bangka belitung' => '19',
        'kepulauan riau'         => '21',
        'dki jakarta'            => '31',
        'jawa barat'             => '32',
        'jawa tengah'            => '33',
        'di yogyakarta'          => '34',
        'jawa timur'             => '35',
        'banten'                 => '36',
        'bali'                   => '51',
        'nusa tenggara barat'    => '52',
        'nusa tenggara timur'    => '53',
        'kalimantan barat'       => '61',
        'kalimantan tengah'      => '62',
        'kalimantan selatan'     => '63',
        'kalimantan timur'       => '64',
        'kalimantan utara'       => '65',
        'sulawesi utara'         => '71',
        'sulawesi tengah'        => '72',
        'sulawesi selatan'       => '73',
        'sulawesi tenggara'      => '74',
        'gorontalo'              => '75',
        'sulawesi barat'         => '76',
        'maluku'                 => '81',
        'maluku utara'           => '82',
        'papua barat'            => '91',
        'papua'                  => '94',
    ];

    /**
     * Mapping nama kota/kabupaten (lowercase) ke kode BPS 2-digit (2 digit terakhir dari kode lengkap).
     * Kode lengkap kota = kode_provinsi + kode_kota (misal 3374 = Jawa Tengah + Kota Semarang).
     *
     * Saat ini difokuskan ke wilayah Jawa Tengah (kode provinsi 33).
     *
     * @var array<string, string>
     */
    private const CITY_CODES = [
        // ── Jawa Tengah ──────────────────────────────────────────────────────
        'kabupaten cilacap'        => '01',
        'kabupaten banyumas'       => '02',
        'kabupaten purbalingga'    => '03',
        'kabupaten banjarnegara'   => '04',
        'kabupaten kebumen'        => '05',
        'kabupaten purworejo'      => '06',
        'kabupaten wonosobo'       => '07',
        'kabupaten magelang'       => '08',
        'kabupaten boyolali'       => '09',
        'kabupaten klaten'         => '10',
        'kabupaten sukoharjo'      => '11',
        'kabupaten wonogiri'       => '12',
        'kabupaten karanganyar'    => '13',
        'kabupaten sragen'         => '14',
        'kabupaten grobogan'       => '15',
        'kabupaten blora'          => '16',
        'kabupaten rembang'        => '17',
        'kabupaten pati'           => '18',
        'kabupaten kudus'          => '19',
        'kabupaten jepara'         => '20',
        'kabupaten demak'          => '21',
        'kabupaten semarang'       => '22',
        'kabupaten temanggung'     => '23',
        'kabupaten kendal'         => '24',
        'kabupaten batang'         => '25',
        'kabupaten pekalongan'     => '26',
        'kabupaten pemalang'       => '27',
        'kabupaten tegal'          => '28',
        'kabupaten brebes'         => '29',
        'kota magelang'            => '71',
        'kota surakarta'           => '72',
        'kota salatiga'            => '73',
        'kota semarang'            => '74',   // ← Fokus utama
        'kota pekalongan'          => '75',
        'kota tegal'               => '76',
    ];

    /**
     * Fallback kode jika nama tidak ditemukan di mapping.
     */
    private const FALLBACK_PROVINCE_CODE = '00';
    private const FALLBACK_CITY_CODE     = '00';

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Generate nomor anggota berdasarkan provinsi dan kota pendaftar.
     *
     * Proses ini dijalankan dalam database transaction untuk menghindari
     * race condition pada nomor urut (dua user daftar bersamaan).
     *
     * @param  string $provinceName  Nama provinsi (bebas case, misal "Jawa Tengah")
     * @param  string $cityName      Nama kota/kabupaten (misal "Kota Semarang")
     * @return string                Nomor anggota 8-digit, contoh: "33740001"
     */
    public function generate(string $provinceName, string $cityName): string
    {
        return DB::transaction(function () use ($provinceName, $cityName) {
            $provinceCode = $this->resolveProvinceCode($provinceName);
            $cityCode     = $this->resolveCityCode($cityName);

            // Prefix 4-digit yang menjadi "namespace" penomoran
            $prefix = $provinceCode . $cityCode;

            // Cari nomor urut tertinggi yang sudah ada untuk prefix ini
            $lastSequence = User::where('member_number', 'LIKE', $prefix . '%')
                ->whereNotNull('member_number')
                ->lockForUpdate() // kunci baris untuk hindari race condition
                ->max(DB::raw('CAST(SUBSTRING(member_number, 5, 4) AS UNSIGNED)'));

            $nextSequence = ($lastSequence ?? 0) + 1;

            // Validasi batas maksimum (9999 anggota per wilayah)
            if ($nextSequence > 9999) {
                throw new \OverflowException(
                    "Nomor urut anggota untuk wilayah {$prefix} sudah mencapai batas maksimum (9999)."
                );
            }

            return $prefix . str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Validasi apakah nomor anggota sudah tersedia (belum dipakai).
     */
    public function isAvailable(string $memberNumber): bool
    {
        return ! User::where('member_number', $memberNumber)->exists();
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Resolusi kode BPS provinsi dari nama provinsi yang diberikan.
     * Menggunakan pencocokan lowercase agar case-insensitive.
     */
    private function resolveProvinceCode(string $provinceName): string
    {
        $key = strtolower(trim($provinceName));

        return self::PROVINCE_CODES[$key] ?? self::FALLBACK_PROVINCE_CODE;
    }

    /**
     * Resolusi kode BPS kota dari nama kota yang diberikan.
     * Mendukung pencocokan partial (misal "Semarang" → "Kota Semarang").
     */
    private function resolveCityCode(string $cityName): string
    {
        $key = strtolower(trim($cityName));

        // Exact match terlebih dahulu
        if (isset(self::CITY_CODES[$key])) {
            return self::CITY_CODES[$key];
        }

        // Partial match: cari kunci yang mengandung nama kota
        foreach (self::CITY_CODES as $mappedName => $code) {
            if (str_contains($mappedName, $key) || str_contains($key, $mappedName)) {
                return $code;
            }
        }

        return self::FALLBACK_CITY_CODE;
    }
}
