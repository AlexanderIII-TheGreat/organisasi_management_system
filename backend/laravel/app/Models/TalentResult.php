<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TalentResult extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'talent_test_id',
        'total_score',
        'recommended_division',
        'analysis',
        'answers',
        'started_at',
        'completed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_score' => 'integer',
            'answers' => 'array', // JSON decode otomatis
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    /**
     * User pemilik hasil test.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Test yang dikerjakan.
     */
    public function talentTest(): BelongsTo
    {
        return $this->belongsTo(TalentTest::class);
    }
}
