<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NotificationController extends Controller
{
    /**
     * Get daftar notifikasi user yang berumur maksimal 10 hari.
     */
    public function index(Request $request): JsonResponse
    {
        $tenDaysAgo = Carbon::now()->subDays(10);

        // Ambil notifikasi 10 hari terakhir
        $notifications = $request->user()->notifications()
            ->where('created_at', '>=', $tenDaysAgo)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->toISOString(),
                    'time_ago' => $notification->created_at->diffForHumans(),
                ];
            }),
            'unread_count' => $request->user()->unreadNotifications()
                ->where('created_at', '>=', $tenDaysAgo)
                ->count(),
        ]);
    }

    /**
     * Tandai notifikasi sebagai telah dibaca.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai sebagai dibaca.',
        ]);
    }

    /**
     * Tandai semua notifikasi sebagai telah dibaca.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()
            ->where('created_at', '>=', Carbon::now()->subDays(10))
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai sebagai dibaca.',
        ]);
    }
}
