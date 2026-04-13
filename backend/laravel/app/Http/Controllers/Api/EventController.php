<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EventController extends Controller
{
    /**
     * List semua event (public).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Event::with(['creator', 'panitias'])->withCount('panitias');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $events = $query->latest('event_date')
            ->paginate($request->input('per_page', 15));

        return EventResource::collection($events);
    }

    /**
     * Detail event by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->with(['creator', 'panitias'])
            ->withCount('panitias')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new EventResource($event),
        ]);
    }

    /**
     * Admin: buat event baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:events'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'max:5120'], // max 5MB
            'location' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date', 'after:now'],
            'registration_deadline' => ['nullable', 'date', 'before:event_date'],
            'status' => ['nullable', 'in:mendatang,berlangsung,selesai'],
            'panitias' => ['nullable', 'array'],
            'panitias.*' => ['exists:users,id'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $validated['created_by'] = $request->user()->id;

        $event = Event::create($validated);

        if ($request->has('panitias') && is_array($request->input('panitias'))) {
            $event->panitias()->sync($request->input('panitias'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dibuat.',
            'data' => new EventResource($event->load('creator')),
        ], 201);
    }

    /**
     * Admin: update event.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:events,slug,' . $event->id],
            'description' => ['sometimes', 'string'],
            'image' => ['nullable', 'image', 'max:5120'],
            'location' => ['nullable', 'string', 'max:255'],
            'event_date' => ['sometimes', 'date'],
            'registration_deadline' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:mendatang,berlangsung,selesai'],
            'panitias' => ['nullable', 'array'],
            'panitias.*' => ['exists:users,id'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        if ($request->has('panitias') && is_array($request->input('panitias'))) {
            $event->panitias()->sync($request->input('panitias'));
        }

        $event->loadMissing(['creator', 'panitias']);

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil diperbarui.',
            'data' => new EventResource($event),
        ]);
    }

    /**
     * Admin: hapus event.
     */
    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dihapus.',
        ]);
    }

    /**
     * Admin: assign user sebagai panitia.
     */
    public function assignPanitia(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'position' => ['nullable', 'string', 'max:255'],
        ]);

        // Cek apakah sudah jadi panitia
        if ($event->panitias()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'User sudah terdaftar sebagai panitia di event ini.',
            ], 422);
        }

        $event->panitias()->attach($validated['user_id'], [
            'position' => $validated['position'] ?? null,
        ]);
        $event->loadMissing('panitias');

        return response()->json([
            'success' => true,
            'message' => 'Panitia berhasil ditambahkan.',
            'data' => new EventResource($event),
        ]);
    }

    /**
     * Admin: hapus panitia dari event.
     */
    public function removePanitia(Event $event, int $userId): JsonResponse
    {
        $event->panitias()->detach($userId);
        $event->loadMissing('panitias');
 
        return response()->json([
            'success' => true,
            'message' => 'Panitia berhasil dihapus dari event.',
            'data' => new EventResource($event),
        ]);
    }
}
