<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Aspiration;
use App\Models\TalentTest;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    /**
     * Get aggregate statistics for the admin dashboard.
     */
    public function index(): JsonResponse
    {
        $totalMembers = User::count();
        $pendingActivations = User::where('status', 'nonaktif')->count();
        $activeEvents = Event::where('status', '!=', 'selesai')->count();
        $pendingAspirations = Aspiration::count();

        // Optional additional stats
        $totalAspirations = Aspiration::count();
        $upcomingEvents = Event::where('status', 'mendatang')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_members' => $totalMembers,
                'pending_activations' => $pendingActivations,
                'active_events' => $activeEvents,
                'pending_aspirations' => $pendingAspirations,
                'total_aspirations' => $totalAspirations,
                'upcoming_events' => $upcomingEvents,
            ]
        ]);
    }
}
