<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ─── 0. Seed Positions ──────────────────────────────────────────
        $positionNames = ['Ketua', 'Sekretaris', 'Bendahara', 'Humas', 'Anggota'];
        $posModels = [];
        foreach ($positionNames as $pName) {
            $posModels[$pName] = Position::firstOrCreate(['name' => $pName]);
        }

        // ─── 1. Seed 5 Members ──────────────────────────────────────────
        $names = ['Andini Putri', 'Budi Santoso', 'Citra Lestari', 'Dicky Pratama', 'Eka Wahyuni'];
        $photos = [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
        ];

        foreach ($names as $i => $name) {
            User::updateOrCreate(
                ['email' => Str::slug($name) . '@example.com'],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => $i === 0 ? 'admin' : ($i < 4 ? 'pengurus' : 'anggota'),
                    'position_id' => $posModels[$positionNames[$i]]->id,
                    'status' => 'aktif',
                    'photo' => $photos[$i],
                    'member_number' => '3374' . str_pad((string)($i + 2), 4, '0', STR_PAD_LEFT),
                    'province' => 'JAWA TENGAH',
                    'city' => 'KOTA SEMARANG',
                    'district' => 'Banyumanik',
                    'email_verified_at' => now(),
                ]
            );
        }

        // ─── 2. Seed 5 Events ───────────────────────────────────────────
        $admin = User::where('role', 'admin')->first();
        $allUsers = User::all();
        
        $events = [
            [
                'title' => 'Workshop Digital Marketing UMKM',
                'description' => 'Pelatihan intensif strategi pemasaran digital untuk pelaku usaha mikro di lingkungan RW 08.',
                'location' => 'Balai Warga RW 08',
                'event_date' => now()->subDay(),
                'status' => 'berlangsung',
                'image' => 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
            ],
            [
                'title' => 'Gerakan Penghijauan Lingkungan 2024',
                'description' => 'Menanam 1000 bibit pohon untuk masa depan yang lebih hijau.',
                'location' => 'Area Taman Terbuka',
                'event_date' => now()->addDays(20),
                'status' => 'mendatang',
                'image' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
            ],
            [
                'title' => 'Malam Keakraban Pemuda (Makrab)',
                'description' => 'Mempererat tali silaturahmi antar anggota Karang Taruna melalui api unggun dan diskusi santai.',
                'location' => 'Aula Sekretariat',
                'event_date' => now()->addDays(30),
                'status' => 'mendatang',
                'image' => 'https://images.unsplash.com/photo-1511632765486-a01c80cb8704?w=800',
            ],
            [
                'title' => 'Musyawarah Besar Tahunan (MUBES)',
                'description' => 'Evaluasi program kerja tahunan dan pemilihan pengurus baru untuk periode mendatang.',
                'location' => 'Auditorium Kec. Serpong',
                'event_date' => now()->addDays(45),
                'status' => 'mendatang',
                'image' => 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800',
            ],
            [
                'title' => 'Bakti Sosial Ramadhan 2024',
                'description' => 'Pembagian paket sembako untuk warga prasejahtera di lingkungan sekitar.',
                'location' => 'Masjid Nurul Iman',
                'event_date' => now()->subMonths(1),
                'status' => 'selesai',
                'image' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
            ],
        ];

        foreach ($events as $eventData) {
            $event = Event::updateOrCreate(
                ['slug' => Str::slug($eventData['title'])],
                array_merge($eventData, [
                    'created_by' => $admin->id,
                    'registration_deadline' => $eventData['event_date']->copy()->subDays(3),
                ])
            );

            // Assign Panitias (Real relations from users)
            $panitias = $allUsers->shuffle()->take(rand(2, 3));
            foreach ($panitias as $panitia) {
                if (!$event->panitias()->where('user_id', $panitia->id)->exists()) {
                    $event->panitias()->attach($panitia->id, [
                        'position' => 'Panitia Pelaksana',
                    ]);
                }
            }
        }

        // ─── 3. Seed Notifications (Personalized & 10-Day Rule) ──────────
        foreach ($allUsers as $user) {
            // Notifikasi Aktivasi (Berbeda untuk setiap user)
            \DB::table('notifications')->insert([
                'id' => Str::uuid(),
                'type' => 'App\Notifications\AccountActivated',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode([
                    'message' => "Selamat {$user->name}, akun anggota Anda telah diaktifkan oleh admin.",
                    'title' => 'Akun Aktif',
                ]),
                'created_at' => now()->subHours(rand(1, 24)),
                'updated_at' => now(),
            ]);

            // Notifikasi Event (Hanya jika login)
            \DB::table('notifications')->insert([
                'id' => Str::uuid(),
                'type' => 'App\Notifications\EventReminder',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode([
                    'message' => "Jangan lewatkan event mendatang di lingkungan kita minggu ini!",
                    'title' => 'Pengingat Event',
                ]),
                'created_at' => now()->subDays(rand(1, 5)),
                'updated_at' => now(),
            ]);
        }

        // ─── 4. Seed Talent Test (Minat & Bakat) ────────────────────────
        $talentTest = \App\Models\TalentTest::updateOrCreate(
            ['title' => 'Minat & Bakat Karang Taruna'],
            [
                'description' => 'Temukan divisi yang paling sesuai dengan kepribadian dan keahlianmu.',
                'category' => 'Interest',
                'duration_minutes' => 10,
                'status' => 'aktif',
                'created_by' => $admin->id,
            ]
        );

        $questions = [
            [
                'question' => 'Dalam sebuah kegiatan desa, peran apa yang paling membuatmu merasa nyaman?',
                'options' => [
                    ['option_text' => 'Mengatur alur acara dan berinteraksi sebagai MC/Humas.', 'score' => 10, 'recommended_division' => 'Humas & Media'],
                    ['option_text' => 'Merancang konsep kreatif dan strategi kegiatan di balik layar.', 'score' => 10, 'recommended_division' => 'Kreatif & Konsep'],
                    ['option_text' => 'Mengelola logistik, peralatan, dan memastikan kebutuhan teknis terpenuhi.', 'score' => 10, 'recommended_division' => 'Logistik & Dana'],
                    ['option_text' => 'Mengorganisir pertandingan olahraga atau kegiatan fisik luar ruangan.', 'score' => 10, 'recommended_division' => 'Olahraga'],
                ]
            ],
            [
                'question' => 'Apa kelebihan utamamu yang paling sering diakui orang lain?',
                'options' => [
                    ['option_text' => 'Pandai berbicara dan mudah bergaul dengan siapa saja.', 'score' => 10, 'recommended_division' => 'Humas & Media'],
                    ['option_text' => 'Memiliki imajinasi tinggi dan sering memberikan ide out-of-the-box.', 'score' => 10, 'recommended_division' => 'Kreatif & Konsep'],
                    ['option_text' => 'Sangat disiplin, teliti, dan jago dalam manajemen barang/uang.', 'score' => 10, 'recommended_division' => 'Logistik & Dana'],
                    ['option_text' => 'Memiliki empati tinggi dan senang membantu urusan sosial/kerohanian.', 'score' => 10, 'recommended_division' => 'Kerohanian'],
                ]
            ],
            [
                'question' => 'Jika ada waktu luang di akhir pekan, kamu lebih suka...',
                'options' => [
                    ['option_text' => 'Berolahraga atau melakukan aktivitas fisik bersama teman.', 'score' => 10, 'recommended_division' => 'Olahraga'],
                    ['option_text' => 'Menonton konten kreatif, desain, atau membaca buku inovasi.', 'score' => 10, 'recommended_division' => 'Kreatif & Konsep'],
                    ['option_text' => 'Mengikuti kegiatan pengajian atau baksos di lingkungan.', 'score' => 10, 'recommended_division' => 'Kerohanian'],
                    ['option_text' => 'Bersantai sambil memperluas jaringan pertemanan di media sosial.', 'score' => 10, 'recommended_division' => 'Humas & Media'],
                ]
            ],
            [
                'question' => 'Bagaimana caramu menyelesaikan sebuah masalah dalam tim?',
                'options' => [
                    ['option_text' => 'Mendiskusikannya secara terbuka agar komunikasi tetap terjaga.', 'score' => 10, 'recommended_division' => 'Humas & Media'],
                    ['option_text' => 'Mencari solusi praktis dan langsung mengeksekusi kebutuhan teknis.', 'score' => 10, 'recommended_division' => 'Logistik & Dana'],
                    ['option_text' => 'Menganalisis akar masalah dan membuat rencana strategis baru.', 'score' => 10, 'recommended_division' => 'Kreatif & Konsep'],
                    ['option_text' => 'Menyikapinya dengan sabar dan mencari pendekatan personal/spiritual.', 'score' => 10, 'recommended_division' => 'Kerohanian'],
                ]
            ],
            [
                'question' => 'Apa hasil akhir yang paling ingin kamu kontribusikan untuk warga?',
                'options' => [
                    ['option_text' => 'Masyarakat yang sehat, aktif, dan gemar berolahraga.', 'score' => 10, 'recommended_division' => 'Olahraga'],
                    ['option_text' => 'Organisasi yang modern dengan branding dan media yang kuat.', 'score' => 10, 'recommended_division' => 'Humas & Media'],
                    ['option_text' => 'Terlaksananya kegiatan besar dengan pendanaan dan logistik yang lancar.', 'score' => 10, 'recommended_division' => 'Logistik & Dana'],
                    ['option_text' => 'Lingkungan yang harmonis, toleran, dan religius.', 'score' => 10, 'recommended_division' => 'Kerohanian'],
                ]
            ],
        ];

        foreach ($questions as $i => $qData) {
            $question = $talentTest->questions()->updateOrCreate(
                ['question' => $qData['question']],
                ['order' => $i + 1, 'weight' => 1]
            );

            foreach ($qData['options'] as $j => $oData) {
                $question->options()->updateOrCreate(
                    ['option_text' => $oData['option_text']],
                    ['score' => $oData['score'], 'recommended_division' => $oData['recommended_division'], 'order' => $j + 1]
                );
            }
        }
    }
}
