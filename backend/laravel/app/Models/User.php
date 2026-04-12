<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'address',
        'province',
        'city',
        'district',
        'phone',
        'photo',
        'points',
        'level',
        'role',
        'status',
        'position_id', // relasi ke tabel positions
        'member_number', // nomor kartu anggota (auto-generated saat register)
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'points' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    /**
     * Events yang diikuti user sebagai panitia (many-to-many).
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_user')
            ->withPivot('position')
            ->withTimestamps();
    }

    /**
     * Events yang dibuat oleh user (admin).
     */
    public function createdEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    /**
     * Aspirasi yang dikirim user.
     */
    public function aspirations(): HasMany
    {
        return $this->hasMany(Aspiration::class);
    }

    /**
     * Aspirasi yang ditangani user (sebagai admin/pengurus).
     */
    public function handledAspirations(): HasMany
    {
        return $this->hasMany(Aspiration::class, 'handled_by');
    }

    /**
     * Hasil test minat bakat user.
     */
    public function talentResults(): HasMany
    {
        return $this->hasMany(TalentResult::class);
    }

    /**
     * Talent tests yang dibuat user (admin).
     */
    public function createdTalentTests(): HasMany
    {
        return $this->hasMany(TalentTest::class, 'created_by');
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    /**
     * Scope: hanya user aktif.
     */
    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope: hanya user nonaktif.
     */
    public function scopeNonaktif(Builder $query): Builder
    {
        return $query->where('status', 'nonaktif');
    }

    /**
     * Scope: filter berdasarkan role.
     */
    public function scopeRole(Builder $query, string $role): Builder
    {
        return $query->where('role', $role);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Cek apakah user adalah admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Cek apakah user adalah pengurus.
     */
    public function isPengurus(): bool
    {
        return $this->role === 'pengurus';
    }

    /**
     * Cek apakah user aktif.
     */
    public function isAktif(): bool
    {
        return $this->status === 'aktif';
    }

    /**
     * Get the position assigned to this user.
     */
    public function position(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Position::class);
    }
}
