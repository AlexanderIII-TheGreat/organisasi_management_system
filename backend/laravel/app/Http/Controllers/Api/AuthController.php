<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\MemberNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Register user baru.
     * Status default: nonaktif (harus diaktifkan admin).
     */
    public function register(Request $request, MemberNumberService $memberNumberService): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'address'  => ['required', 'string'],
            'province' => ['required', 'string', 'max:255'],
            'city'     => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'phone'    => ['required', 'string', 'max:20'],
            'photo'    => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'], // max 2MB
        ]);

        // Generate nomor anggota otomatis berdasarkan provinsi & kota
        // Contoh: Jawa Tengah + Kota Semarang → "33740001"
        $memberNumber = null;
        if (! empty($validated['province']) && ! empty($validated['city'])) {
            $memberNumber = $memberNumberService->generate(
                $validated['province'],
                $validated['city']
            );
        }

        // Simpan foto profil jika ada
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos', 'public');
        }

        $user = User::create([
            ...$validated,
            'password'      => Hash::make($validated['password']),
            'status'        => 'nonaktif', // default nonaktif, diaktifkan admin
            'role'          => 'anggota',
            'member_number' => $memberNumber,
            'photo'         => $photoPath,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil! Akun Anda sedang menunggu persetujuan admin.',
            'data'    => new UserResource($user),
        ], 201);
    }


    /**
     * Login user.
     * Cek apakah akun sudah aktif sebelum memberikan token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        if ($user->status === 'nonaktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda belum diaktifkan. Silakan hubungi admin.',
            ], 403);
        }

        // Revoke semua token lama
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Logout user & revoke token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Get profil user saat ini.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadCount('aspirations');
        $user->load(['events', 'talentResults.talentTest', 'position']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Redirect ke Google OAuth.
     */
    public function googleRedirect(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'data' => ['url' => $url],
        ]);
    }

    /**
     * Handle callback dari Google OAuth.
     */
    public function googleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Update Google ID jika belum ada (existing user link Google)
                if (! $user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                }
            } else {
                // Buat user baru dari Google
                // Catatan: user Google belum memiliki data wilayah, member_number
                // akan di-generate saat user melengkapi profil (province & city).
                $user = User::create([
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'google_id'         => $googleUser->getId(),
                    'avatar'            => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'status'            => 'nonaktif', // tetap nonaktif sampai admin approve
                    'role'              => 'anggota',
                    'member_number'     => null, // diisi saat user lengkapi profil
                ]);
            }

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

            if ($user->status === 'nonaktif') {
                return redirect($frontendUrl . '/login?error=inactive');
            }

            $user->tokens()->delete();
            $token = $user->createToken('google-auth-token')->plainTextToken;

            return redirect($frontendUrl . '/google-callback?token=' . $token);

        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?error=google_failed');
        }
    }
}
