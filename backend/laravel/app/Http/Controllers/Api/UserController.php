<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\MemberNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Barryvdh\DomPDF\Facade\Pdf;

class UserController extends Controller
{
    /**
     * List semua anggota.
     * Admin/pengurus: lihat semua user.
     * Anggota: lihat user aktif saja.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::with('position');

        // Filter berdasarkan role
        if ($request->has('role')) {
            $query->role($request->input('role'));
        }

        // Filter berdasarkan status (admin only)
        if ($request->has('status') && $request->user()->isAdmin()) {
            $query->where('status', $request->input('status'));
        } elseif (! $request->user()->isAdmin()) {
            $query->aktif(); // anggota biasa hanya lihat user aktif
        }

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($request->input('per_page', 15));

        return UserResource::collection($users);
    }

    /**
     * Detail user.
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['events', 'aspirations']);
        $user->loadCount(['aspirations', 'talentResults']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update profil user sendiri.
     */
    public function update(Request $request, MemberNumberService $memberNumberService): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'address'  => ['nullable', 'string'],
            'province' => ['nullable', 'string', 'max:255'],
            'city'     => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'photo'    => ['nullable', 'image', 'max:2048'], // max 2MB
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $validated['photo'] = $path;
        }

        $user->update($validated);

        // Jika user belum punya nomor anggota (misal akun Google yang baru melengkapi profil)
        // dan sekarang sudah mengisi province + city, generate otomatis.
        if (! $user->member_number) {
            $province = $validated['province'] ?? $user->province;
            $city     = $validated['city']     ?? $user->city;

            if ($province && $city) {
                $memberNumber = $memberNumberService->generate($province, $city);
                $user->update(['member_number' => $memberNumber]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data'    => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Update password user sendiri.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui.',
        ]);
    }

    /**
     * Admin: aktivasi / deaktivasi user.
     */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'aktif') {
            $updateData['activated_at'] = now();
            $updateData['expires_at'] = now()->addMonth();
        } else {
            // Jika dinonaktifkan, opsional: apakah masa berlaku tetap atau dihapus?
            // Untuk saat ini kita biarkan saja atau set null jika ingin reset period.
            $updateData['activated_at'] = null;
            $updateData['expires_at'] = null;
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Status user berhasil diubah menjadi {$validated['status']}.",
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Admin: ubah role user.
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'in:admin,pengurus,anggota'],
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'success' => true,
            'message' => "Role user berhasil diubah menjadi {$validated['role']}.",
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Admin: ubah jabatan user.
     */
    public function updatePosition(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'position_id' => ['required', 'exists:positions,id'],
        ]);

        $user->update(['position_id' => $validated['position_id']]);

        return response()->json([
            'success' => true,
            'message' => 'Jabatan user berhasil diperbarui.',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Kirim email aktivasi menggunakan email SMTP default Laravel (mengabaikan API dan IP restrictions Brevo).
     */
    public function sendActivationEmail(User $user): JsonResponse
    {
        if ($user->status !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'User belum diaktifkan. Harap ubah status menjadi aktif terlebih dahulu.'
            ], 400);
        }

        try {
            \Illuminate\Support\Facades\Mail::html("
                <div style='font-family: Arial, sans-serif; color: #333;'>
                    <h2>Halo {$user->name}!</h2>
                    <p>Selamat, permohonan pendaftaran Anda telah disetujui (diverifikasi) oleh Admin Karang Taruna.</p>
                    <p>Nomor Anggota (NIA) Anda adalah: <strong>{$user->member_number}</strong></p>
                    <p>Anda sudah bisa masuk ke dalam portal anggota untuk mengakses informasi acara, tes bakat, serta pengelolaan aspirasi. Silakan <strong>login</strong> menggunakan email dan sandi yang telah didaftarkan.</p>
                    <br/>
                    <p>Salam Hangat,<br/>Pengurus Organisasi</p>
                </div>
            ", function ($message) use ($user) {
                $message->to($user->email, $user->name)
                        ->subject('Selamat, Akun Anda Telah Aktif!');
            });

            return response()->json([
                'success' => true,
                'message' => "Email aktivasi berhasil dikirim ke {$user->email}."
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('SMTP Email Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Kirim pengingat perpanjangan manual via WhatsApp (Fonnte).
     */
    public function sendManualReminder(User $user, \App\Services\FonnteService $fonnteService): JsonResponse
    {
        if ($user->status !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'User tidak aktif.'
            ], 400);
        }

        if (!$user->phone) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak memiliki nomor telepon.'
            ], 400);
        }

        $remainingDays = $user->expires_at ? (int) now()->diffInDays($user->expires_at, false) : 0;
        $dateStr = $user->expires_at ? $user->expires_at->format('d/m/Y') : '-';

        $message = "Halo *{$user->name}*,\n\nIni adalah pengingat manual dari Admin Karang Taruna. Masa aktif keanggotaan Anda akan berakhir dalam {$remainingDays} hari lagi (tanggal {$dateStr}).\n\nSilakan lakukan perpanjangan keanggotaan Anda. Terima kasih!";

        $response = $fonnteService->sendMessage($user->phone, $message);

        if (isset($response['status']) && $response['status'] == true) {
            return response()->json([
                'success' => true,
                'message' => "Pengingat manual berhasil dikirim ke WhatsApp {$user->name}."
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengirim WhatsApp: ' . ($response['reason'] ?? 'Unknown error')
        ], 500);
    }

    /**
     * Anggota: Minta perpanjangan masa aktif.
     */
    public function requestRenewal(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Opsional: Batasi hanya jika sudah hampir habis (misal H-7)
        $remainingDays = $user->expires_at ? now()->diffInDays($user->expires_at, false) : 0;
        
        if ($remainingDays > 7 && $user->expires_at > now()) {
             return response()->json([
                'success' => false,
                'message' => "Anda hanya dapat meminta perpanjangan ketika masa aktif tersisa 7 hari atau kurang."
            ], 400);
        }

        $user->update(['renewal_requested_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan perpanjangan berhasil dikirim ke Admin.'
        ]);
    }

    /**
     * Admin: Setujui dan perpanjang membership (+1 bulan).
     */
    public function renewMembership(User $user, \App\Services\FonnteService $fonnteService): JsonResponse
    {
        if (!$user->renewal_requested_at) {
            return response()->json([
                'success' => false,
                'message' => 'User ini belum meminta perpanjangan.'
            ], 400);
        }

        // Hitung expires_at baru (jika sudah kedaluwarsa, mulai dari sekarang. jika belum, tambahkan dari yang ada)
        $currentExpiry = $user->expires_at && $user->expires_at > now() ? $user->expires_at : now();
        $newExpiry = $currentExpiry->addMonth();

        $user->update([
            'expires_at' => $newExpiry,
            'renewal_requested_at' => null // Reset request
        ]);

        // Kirim WhatsApp Selamat
        if ($user->phone) {
            $dateStr = $newExpiry->format('d/m/Y');
            $message = "Selamat! *{$user->name}*,\n\nPermintaan perpanjangan keanggotaan Anda telah *DISETUJUI* oleh Admin. Masa aktif Anda kini berlaku hingga *{$dateStr}*.\n\nTerima kasih telah menjadi bagian dari Karang Taruna!";
            $fonnteService->sendMessage($user->phone, $message);
        }

        return response()->json([
            'success' => true,
            'message' => 'Masa aktif anggota berhasil diperpanjang 1 bulan.',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Admin: Update tanggal kedaluwarsa secara manual.
     */
    public function updateExpiryDate(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'expires_at' => ['required', 'date', 'after:now'],
        ]);

        $user->update([
            'expires_at' => $validated['expires_at'],
            'renewal_requested_at' => null // Reset request jika ada
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tanggal kedaluwarsa anggota berhasil diperbarui.',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Admin: hapus user.
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus.',
        ]);
    }

    /**
     * Get daftar provinsi unik dari database users.
     */
    public function provinces(): JsonResponse
    {
        $provinces = User::aktif()
            ->whereNotNull('province')
            ->distinct()
            ->pluck('province');

        return response()->json([
            'success' => true,
            'data' => $provinces,
        ]);
    }
    /**
     * Generate KTA PDF.
     */
    public function generateKta(Request $request)
    {
        $user = $request->user();
        
        $pdf = Pdf::loadView('pdf.kta', compact('user'));
        
        // Set paper size to ID card (85.6mm x 53.98mm in points)
        // 1mm = 2.83465 points
        $pdf->setPaper([0, 0, 242.65, 153.01], 'portrait');

        return $pdf->download("KTA_{$user->name}.pdf");
    }
}
