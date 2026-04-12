<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TalentOption extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'talent_question_id',
        'option_text',
        'score',
        'recommended_division',
        'order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'order' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    /**
     * Pertanyaan pemilik opsi ini.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(TalentQuestion::class, 'talent_question_id');
    }
}
