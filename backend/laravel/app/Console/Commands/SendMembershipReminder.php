<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FonnteService;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:send-membership-reminder')]
#[Description('Kirim pengingat perpanjangan keanggotaan H-3 sebelum masa berlaku habis via WhatsApp.')]
class SendMembershipReminder extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(FonnteService $fonnteService)
    {
        $todayStr = now()->toDateString();
        $threeDaysFromNow = now()->addDays(3)->toDateString();
        
        $this->info("Memulai pengecekan reminder (Mendatang & Kedaluwarsa) per {$todayStr}...");

        // Cari user yang expires_at dalam rentang <= 3 hari dari sekarang (termasuk yang sudah lewat)
        // Dan belum menerima reminder hari ini
        $users = User::aktif()
            ->whereDate('expires_at', '<=', $threeDaysFromNow)
            ->where(function($q) use ($todayStr) {
                $q->whereNull('last_reminder_sent_at')
                  ->orWhere('last_reminder_sent_at', '<', $todayStr);
            })
            ->get();

        if ($users->isEmpty()) {
            $this->info('Tidak ada anggota yang perlu diingatkan hari ini.');
            return;
        }

        $this->info('Mengirim reminder ke ' . $users->count() . ' anggota...');

        foreach ($users as $user) {
            if (!$user->phone) {
                $this->warn("User {$user->name} tidak memiliki nomor telepon.");
                continue;
            }

            // Normalisasi Nomor: 08xx -> 628xx
            $phone = $this->normalizePhoneNumber($user->phone);

            // Hitung sisa hari (negatif berarti sudah lewat)
            $remainingDays = (int) now()->startOfDay()->diffInDays($user->expires_at->startOfDay(), false);
            $dateStr = $user->expires_at->format('d/m/Y');
            
            if ($remainingDays < 0) {
                // Skenario: Akun sudah Kedaluwarsa
                $daysOver = abs($remainingDays);
                $timeText = $daysOver == 0 ? "hari ini" : "sejak {$daysOver} hari yang lalu";
                $message = "Halo *{$user->name}*,\n\nMohon maaf, masa aktif keanggotaan Anda di Karang Taruna telah *BERAKHIR* {$timeText} (tanggal {$dateStr}).\n\nAkses Anda ke fitur portal anggota kini terbatas. Segera lakukan perpanjangan masa aktif keanggotaan Anda. Terima kasih!";
            } else {
                // Skenario: Akun Segera Kedaluwarsa (H-3 s/d H-0)
                $dayText = $remainingDays == 0 ? "hari ini" : "dalam {$remainingDays} hari lagi";
                $message = "Halo *{$user->name}*,\n\nMasa aktif keanggotaan Anda di Karang Taruna akan berakhir {$dayText} (tanggal {$dateStr}).\n\nSilakan lakukan perpanjangan tepat waktu agar tetap dapat mengakses portal anggota tanpa gangguan. Terima kasih!";
            }

            $typeLabel = $remainingDays < 0 ? "[OVERDUE]" : "[UPCOMING]";
            $this->info("{$typeLabel} Mengirim WA ke [{$user->name}] ({$phone})...");
            
            $response = $fonnteService->sendMessage($phone, $message);

            if (isset($response['status']) && $response['status'] == true) {
                $user->update(['last_reminder_sent_at' => now()]);
                $this->info("OK: Reminder berhasil terkirim.");
            } else {
                $this->error("FAIL: Gagal mengirim ke {$user->name}: " . ($response['reason'] ?? 'Unknown error'));
            }
        }

        $this->info('Proses pengiriman reminder selesai.');
    }

    /**
     * Normalisasi nomor telepon ke format internasional (62)
     */
    private function normalizePhoneNumber(string $phone): string
    {
        // Hapus karakter non-digit
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Jika diawali 0, ganti dengan 62
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        // Jika tidak diawali 62 atau 0, asumsikan butuh prefix 62 (opsional, tergantung data)
        if (!str_starts_with($phone, '62') && !empty($phone)) {
            $phone = '62' . $phone;
        }

        return $phone;
    }
}
