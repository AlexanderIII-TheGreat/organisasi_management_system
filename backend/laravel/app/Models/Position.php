<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Position extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Get the users assigned to this position.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
