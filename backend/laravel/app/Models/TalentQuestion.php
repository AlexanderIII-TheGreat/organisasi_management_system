<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TalentQuestion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'talent_test_id',
        'question',
        'order',
        'weight',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'weight' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    /**
     * Test yang memiliki pertanyaan ini.
     */
    public function talentTest(): BelongsTo
    {
        return $this->belongsTo(TalentTest::class);
    }

    /**
     * Opsi jawaban untuk pertanyaan ini.
     */
    public function options(): HasMany
    {
        return $this->hasMany(TalentOption::class)->orderBy('order');
    }
}
