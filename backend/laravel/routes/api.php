<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AspirationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TalentTestController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - OMS Karang Taruna
|--------------------------------------------------------------------------
|
| Headless API Server untuk Next.js Frontend.
| Semua response dalam format JSON.
|
*/

// ─── Public Auth Routes ───────────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Google OAuth
    Route::get('/google', [AuthController::class, 'googleRedirect']);
    Route::get('/google/callback', [AuthController::class, 'googleCallback']);
});

// ─── Public Routes ────────────────────────────────────────────────────────────

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'show']);

// ─── Protected Routes (Auth + Akun Aktif) ─────────────────────────────────────

Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureAccountIsActive::class])->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::put('/profile', [UserController::class, 'update']);
    Route::post('/profile', [UserController::class, 'update']); // alias untuk FormData upload
    Route::put('/profile/password', [UserController::class, 'updatePassword']);
    Route::get('/me/kta-pdf', [UserController::class, 'generateKta']);

    // Users (anggota bisa lihat list user aktif)
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/provinces', [UserController::class, 'provinces']);

    // Aspirasi
    Route::get('/aspirasi', [AspirationController::class, 'index']);
    Route::post('/aspirasi', [AspirationController::class, 'store']);
    Route::get('/aspirasi/{aspiration}', [AspirationController::class, 'show']);
    Route::delete('/aspirasi/{aspiration}', [AspirationController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);

    // Talent Test (user endpoints)
    Route::get('/talent-tests', [TalentTestController::class, 'index']);
    Route::get('/talent-tests/{talentTest}', [TalentTestController::class, 'show']);
    Route::post('/talent-tests/{talentTest}/submit', [TalentTestController::class, 'submit']);
    Route::get('/talent-test/results', [TalentTestController::class, 'myResults']);

    // ─── Admin / Pengurus Routes ──────────────────────────────────────────────

    Route::middleware(\App\Http\Middleware\EnsureUserIsAdmin::class)->group(function () {
        // Dashboard Stats
        Route::get('/dashboard-stats', [\App\Http\Controllers\Api\AdminDashboardController::class, 'index']);

        // User management
        Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::patch('/users/{user}/position', [UserController::class, 'updatePosition']);
        Route::get('/positions', [\App\Http\Controllers\Api\PositionController::class, 'index']);
        Route::post('/users/{user}/send-activation-email', [UserController::class, 'sendActivationEmail']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        // Event management
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);

        // Panitia management
        Route::post('/events/{event}/panitia', [EventController::class, 'assignPanitia']);
        Route::delete('/events/{event}/panitia/{userId}', [EventController::class, 'removePanitia']);

        // Aspirasi management
        Route::patch('/aspirasi/{aspiration}/status', [AspirationController::class, 'updateStatus']);

        // Talent Test management
        Route::post('/talent-tests', [TalentTestController::class, 'store']);
        Route::put('/talent-tests/{talentTest}', [TalentTestController::class, 'update']);
        Route::delete('/talent-tests/{talentTest}', [TalentTestController::class, 'destroy']);
        Route::post('/talent-tests/{talentTest}/questions', [TalentTestController::class, 'storeQuestion']);
        Route::delete('/talent-questions/{talentQuestion}', [TalentTestController::class, 'destroyQuestion']);
        Route::get('/talent-test/all-results', [TalentTestController::class, 'allResults']);
    });
});
