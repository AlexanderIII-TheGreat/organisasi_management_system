<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     * Memblokir user dengan status 'nonaktif' dari mengakses API.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->status === 'nonaktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda belum diaktifkan. Silakan hubungi admin untuk mengaktifkan akun.',
            ], 403);
        }

        return $next($request);
    }
}
