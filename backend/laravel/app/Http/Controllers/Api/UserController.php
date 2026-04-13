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

        $user->update(['status' => $validated['status']]);

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
