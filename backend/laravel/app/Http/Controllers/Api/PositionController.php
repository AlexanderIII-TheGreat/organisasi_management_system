<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\JsonResponse;

class PositionController extends Controller
{
    /**
     * List all available positions.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Position::orderBy('id')->get()
        ]);
    }
}
