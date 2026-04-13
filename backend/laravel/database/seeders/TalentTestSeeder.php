<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TalentTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Temukan admin pertama atau buat id creator dummy jika perlu
        $admin = \App\Models\User::where('role', 'admin')->first();
        $adminId = $admin ? $admin->id : 1;

        $test = \App\Models\TalentTest::create([
            'title' => 'Tes Minat dan Bakat Kepengurusan Karang Taruna',
            'description' => 'Tes ini dirancang untuk mengetahui minat dan bakat Anda agar dapat ditempatkan di divisi yang paling sesuai (Humas, Danus, Acara, Publikasi, dll).',
            'category' => 'Kepengurusan',
            'duration_minutes' => 15,
            'status' => 'aktif', // Dibuat aktif langsung (diminta user)
            'created_by' => $adminId,
        ]);

        $questions_data = [
            [
                'question' => 'Ketika ada acara besar di organisasi, peran apa yang paling Anda sukai?',
                'options' => [
                    ['option_text' => 'Merancang konsep dan susunan acara', 'score' => 10, 'recommended_division' => 'Divisi Acara'],
                    ['option_text' => 'Mencari dana, donasi, dan pihak sponsor', 'score' => 10, 'recommended_division' => 'Divisi Danus'],
                    ['option_text' => 'Mengurus perizinan dan menyebarkan informasi', 'score' => 10, 'recommended_division' => 'Divisi Humas'],
                    ['option_text' => 'Menyiapkan alat teknis dan dokumentasi gambar', 'score' => 10, 'recommended_division' => 'Divisi IT dan Publikasi'],
                ]
            ],
            [
                'question' => 'Jika dihadapkan pada suatu masalah mendadak dalam tim, apa yang biasanya Anda lakukan?',
                'options' => [
                    ['option_text' => 'Mencatat masalah dan mencari solusi sesuai prosedur', 'score' => 10, 'recommended_division' => 'Divisi Kesekretariatan'],
                    ['option_text' => 'Berdiskusi, merangkul, dan menenangkan anggota tim', 'score' => 10, 'recommended_division' => 'Divisi SDM/Keanggotaan'],
                    ['option_text' => 'Terjun langsung secara fisik membereskan hal yang kurang', 'score' => 10, 'recommended_division' => 'Koordinator Lapangan'],
                    ['option_text' => 'Mencari dan menghubungi pihak luar yang bisa meredakan masalah', 'score' => 10, 'recommended_division' => 'Divisi Humas'],
                ]
            ],
            [
                'question' => 'Bagaimana gaya komunikasi Anda sehari-hari secara umum?',
                'options' => [
                    ['option_text' => 'Singkat, padat, cepat, dan langsung menembak ke tujuan', 'score' => 10, 'recommended_division' => 'Divisi Acara'],
                    ['option_text' => 'Sangat ramah, asik, banyak bicara santai, dan humble', 'score' => 10, 'recommended_division' => 'Divisi Humas'],
                    ['option_text' => 'Terstruktur, membawa data, dan teliti membahas rincian', 'score' => 10, 'recommended_division' => 'Divisi Kesekretariatan'],
                    ['option_text' => 'Pasif berbicara namun aktif membuat hasil karya atau tulisan', 'score' => 10, 'recommended_division' => 'Divisi IT dan Publikasi'],
                ]
            ],
            [
                'question' => 'Aktivitas apa yang menurut Anda paling menantang sekaligus menyenangkan?',
                'options' => [
                    ['option_text' => 'Membuat surat, menginput data, dan mengecek laporan keuangan', 'score' => 10, 'recommended_division' => 'Divisi Kesekretariatan dan Keuangan'],
                    ['option_text' => 'Mengoperasikan kamera, mengedit video, dan ngoding', 'score' => 10, 'recommended_division' => 'Divisi IT dan Publikasi'],
                    ['option_text' => 'Berjualan barang, menawarkan proposal kegiatan, dan mencari laba', 'score' => 10, 'recommended_division' => 'Divisi Danus'],
                    ['option_text' => 'Bertemu dengan tokoh masyarakat baru dan memperluas relasi geng', 'score' => 10, 'recommended_division' => 'Divisi Humas'],
                ]
            ],
            [
                'question' => 'Apa kontribusi atau manfaat terbesar yang paling ingin Anda tinggalkan untuk organisasi ini?',
                'options' => [
                    ['option_text' => 'Sistem administrasi, database, dan pengelolaan keuangan yang mantap terbaca', 'score' => 10, 'recommended_division' => 'Divisi Kesekretariatan'],
                    ['option_text' => 'Program kerja yang kreatif, unik, ramai pengunjung, dan tak terlupakan', 'score' => 10, 'recommended_division' => 'Divisi Acara'],
                    ['option_text' => 'Citra organisasi yang luar biasa dan kerjasama luas yang berkelanjutan', 'score' => 10, 'recommended_division' => 'Divisi Humas'],
                    ['option_text' => 'Rasa persaudaraan, solidaritas, kekompakan sesama anggota yang rekat', 'score' => 10, 'recommended_division' => 'Divisi SDM/Keanggotaan'],
                ]
            ],
        ];

        $qOrder = 1;
        foreach ($questions_data as $qData) {
            $question = $test->questions()->create([
                'question' => $qData['question'],
                'order' => $qOrder++,
                'weight' => 1,
            ]);

            $oOrder = 1;
            foreach ($qData['options'] as $optData) {
                $question->options()->create([
                    'option_text' => $optData['option_text'],
                    'score' => $optData['score'],
                    'recommended_division' => $optData['recommended_division'],
                    'order' => $oOrder++,
                ]);
            }
        }
    }
}
