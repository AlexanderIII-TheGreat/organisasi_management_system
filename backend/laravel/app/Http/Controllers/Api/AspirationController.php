<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AspirationResource;
use App\Models\Aspiration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AspirationController extends Controller
{
    /**
     * List aspirasi.
     * Admin: semua aspirasi.
     * Anggota: hanya miliknya sendiri.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Aspiration::with(['user', 'handler']);

        // Anggota biasa hanya bisa lihat aspirasinya sendiri
        if (! $request->user()->isAdmin() && ! $request->user()->isPengurus()) {
            $query->where('user_id', $request->user()->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        $aspirations = $query->latest()
            ->paginate($request->input('per_page', 15));

        return AspirationResource::collection($aspirations);
    }

    /**
     * Kirim aspirasi baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10'],
            'is_anonymous' => ['nullable', 'boolean'],
        ]);

        $aspiration = Aspiration::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'belum ditinjau',
            'is_anonymous' => $validated['is_anonymous'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aspirasi berhasil dikirim.',
            'data' => new AspirationResource($aspiration->load('user')),
        ], 201);
    }

    /**
     * Detail aspirasi.
     */
    public function show(Request $request, Aspiration $aspiration): JsonResponse
    {
        // Anggota biasa hanya bisa lihat miliknya
        if (! $request->user()->isAdmin()
            && ! $request->user()->isPengurus()
            && $aspiration->user_id !== $request->user()->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke aspirasi ini.',
            ], 403);
        }

        $aspiration->load(['user', 'handler']);

        return response()->json([
            'success' => true,
            'data' => new AspirationResource($aspiration),
        ]);
    }

    /**
     * Admin: update status aspirasi.
     */
    public function updateStatus(Request $request, Aspiration $aspiration): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:belum ditinjau,sedang ditinjau,akan dibahas,sedang ditangani,selesai'],
            'admin_response' => ['nullable', 'string'],
        ]);

        $aspiration->update([
            ...$validated,
            'handled_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status aspirasi berhasil diubah menjadi '{$validated['status']}'.",
            'data' => new AspirationResource($aspiration->fresh()->load(['user', 'handler'])),
        ]);
    }

    /**
     * Hapus aspirasi (pemilik atau admin).
     */
    public function destroy(Request $request, Aspiration $aspiration): JsonResponse
    {
        if (! $request->user()->isAdmin() && $aspiration->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus aspirasi ini.',
            ], 403);
        }

        $aspiration->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aspirasi berhasil dihapus.',
        ]);
    }
}
