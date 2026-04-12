<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aspiration extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'category',
        'message',
        'is_anonymous',
        'status',
        'admin_response',
        'handled_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    /**
     * User yang mengirim aspirasi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Admin/pengurus yang menangani aspirasi.
     */
    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    public function scopeBelumDitinjau(Builder $query): Builder
    {
        return $query->where('status', 'belum ditinjau');
    }

    public function scopeSedangDitinjau(Builder $query): Builder
    {
        return $query->where('status', 'sedang ditinjau');
    }

    public function scopeAkanDibahas(Builder $query): Builder
    {
        return $query->where('status', 'akan dibahas');
    }

    public function scopeSedangDitangani(Builder $query): Builder
    {
        return $query->where('status', 'sedang ditangani');
    }

    public function scopeSelesai(Builder $query): Builder
    {
        return $query->where('status', 'selesai');
    }
}
