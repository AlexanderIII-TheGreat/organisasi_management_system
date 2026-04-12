<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TalentResultResource;
use App\Http\Resources\TalentTestResource;
use App\Models\TalentOption;
use App\Models\TalentQuestion;
use App\Models\TalentResult;
use App\Models\TalentTest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TalentTestController extends Controller
{
    /**
     * List semua talent test (aktif saja untuk user biasa).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = TalentTest::with('creator')->withCount('questions');

        // User biasa hanya lihat test aktif
        if (! $request->user()->isAdmin() && ! $request->user()->isPengurus()) {
            $query->aktif();
        }

        $tests = $query->latest()->paginate($request->input('per_page', 15));

        return TalentTestResource::collection($tests);
    }

    /**
     * Detail test + pertanyaan + opsi jawaban.
     */
    public function show(TalentTest $talentTest): JsonResponse
    {
        $talentTest->load(['creator', 'questions.options']);
        $talentTest->loadCount('questions');

        return response()->json([
            'success' => true,
            'data' => new TalentTestResource($talentTest),
        ]);
    }

    /**
     * Admin: buat talent test baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:draft,aktif,nonaktif'],
        ]);

        $test = TalentTest::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Talent test berhasil dibuat.',
            'data' => new TalentTestResource($test),
        ], 201);
    }

    /**
     * Admin: update talent test.
     */
    public function update(Request $request, TalentTest $talentTest): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:draft,aktif,nonaktif'],
        ]);

        $talentTest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Talent test berhasil diperbarui.',
            'data' => new TalentTestResource($talentTest->fresh()),
        ]);
    }

    /**
     * Admin: hapus talent test.
     */
    public function destroy(TalentTest $talentTest): JsonResponse
    {
        $talentTest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Talent test berhasil dihapus.',
        ]);
    }

    /**
     * Admin: tambah pertanyaan ke test.
     */
    public function storeQuestion(Request $request, TalentTest $talentTest): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string'],
            'order' => ['nullable', 'integer'],
            'weight' => ['nullable', 'integer', 'min:1'],
            'options' => ['required', 'array', 'min:2'],
            'options.*.option_text' => ['required', 'string'],
            'options.*.score' => ['required', 'integer'],
            'options.*.recommended_division' => ['nullable', 'string', 'max:255'],
            'options.*.order' => ['nullable', 'integer'],
        ]);

        $question = $talentTest->questions()->create([
            'question' => $validated['question'],
            'order' => $validated['order'] ?? 0,
            'weight' => $validated['weight'] ?? 1,
        ]);

        foreach ($validated['options'] as $option) {
            $question->options()->create($option);
        }

        $question->load('options');

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil ditambahkan.',
            'data' => $question,
        ], 201);
    }

    /**
     * Admin: hapus pertanyaan.
     */
    public function destroyQuestion(TalentQuestion $talentQuestion): JsonResponse
    {
        $talentQuestion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil dihapus.',
        ]);
    }

    /**
     * User: submit jawaban test minat bakat.
     * Menghitung total score dan menentukan divisi yang direkomendasikan.
     */
    public function submit(Request $request, TalentTest $talentTest): JsonResponse
    {
        // Pastikan test aktif
        if ($talentTest->status !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Test ini tidak tersedia.',
            ], 422);
        }

        // Cek apakah sudah pernah submit
        $existing = TalentResult::where('user_id', $request->user()->id)
            ->where('talent_test_id', $talentTest->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah pernah mengerjakan test ini.',
                'data' => new TalentResultResource($existing->load('talentTest')),
            ], 422);
        }

        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'exists:talent_questions,id'],
            'answers.*.option_id' => ['required', 'exists:talent_options,id'],
            'started_at' => ['nullable', 'date'],
        ]);

        // Hitung total score
        $totalScore = 0;
        $divisionScores = []; // track score per divisi

        foreach ($validated['answers'] as $answer) {
            $option = TalentOption::find($answer['option_id']);
            $question = TalentQuestion::find($answer['question_id']);

            if ($option && $question) {
                $score = $option->score * $question->weight;
                $totalScore += $score;

                // Track score per divisi rekomendasi
                if ($option->recommended_division) {
                    $division = $option->recommended_division;
                    $divisionScores[$division] = ($divisionScores[$division] ?? 0) + $score;
                }
            }
        }

        // Tentukan divisi yang paling direkomendasikan
        $recommendedDivision = null;
        if (! empty($divisionScores)) {
            $recommendedDivision = array_key_first(
                array_reverse(
                    \Illuminate\Support\Arr::sort($divisionScores)
                )
            );
        }

        // Buat analisis sederhana
        $analysis = "Total skor: {$totalScore}. ";
        if ($recommendedDivision) {
            $analysis .= "Divisi yang direkomendasikan: {$recommendedDivision}. ";
            $analysis .= 'Detail skor per divisi: ' . json_encode($divisionScores, JSON_UNESCAPED_UNICODE);
        }

        $result = TalentResult::create([
            'user_id' => $request->user()->id,
            'talent_test_id' => $talentTest->id,
            'total_score' => $totalScore,
            'recommended_division' => $recommendedDivision,
            'analysis' => $analysis,
            'answers' => $validated['answers'],
            'started_at' => $validated['started_at'] ?? null,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Test berhasil diselesaikan!',
            'data' => new TalentResultResource($result->load('talentTest')),
        ], 201);
    }

    /**
     * User: lihat hasil test sendiri.
     */
    public function myResults(Request $request): AnonymousResourceCollection
    {
        $results = TalentResult::where('user_id', $request->user()->id)
            ->with('talentTest')
            ->latest()
            ->paginate(15);

        return TalentResultResource::collection($results);
    }

    /**
     * Admin: lihat semua hasil test.
     */
    public function allResults(Request $request): AnonymousResourceCollection
    {
        $query = TalentResult::with(['user', 'talentTest']);

        if ($request->has('talent_test_id')) {
            $query->where('talent_test_id', $request->input('talent_test_id'));
        }

        $results = $query->latest()->paginate($request->input('per_page', 15));

        return TalentResultResource::collection($results);
    }
}
