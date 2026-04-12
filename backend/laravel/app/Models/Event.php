<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'location',
        'event_date',
        'registration_deadline',
        'status',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'registration_deadline' => 'datetime',
        ];
    }

    // ─── Boot ─────────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        // Auto-generate slug dari title saat creating
        static::creating(function (Event $event): void {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });
    }

    // ─── Relationships ────────────────────────────────────────────────

    /**
     * Admin/pengurus yang membuat event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Panitia event (many-to-many dengan pivot position).
     */
    public function panitias(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_user')
            ->withPivot('position')
            ->withTimestamps();
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    /**
     * Scope: hanya event mendatang.
     */
    public function scopeMendatang(Builder $query): Builder
    {
        return $query->where('status', 'mendatang');
    }

    /**
     * Scope: hanya event berlangsung.
     */
    public function scopeBerlangsung(Builder $query): Builder
    {
        return $query->where('status', 'berlangsung');
    }

    /**
     * Scope: hanya event selesai.
     */
    public function scopeSelesai(Builder $query): Builder
    {
        return $query->where('status', 'selesai');
    }

    /**
     * Scope: masih bisa daftar jadi panitia.
     */
    public function scopeRegistrationOpen(Builder $query): Builder
    {
        return $query->where('registration_deadline', '>', now())
            ->where('status', 'mendatang');
    }
}
