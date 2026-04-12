<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TalentOptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Sembunyikan score dan recommended_division dari user biasa (anti-cheat)
        $isAdmin = $request->user()?->isAdmin() || $request->user()?->isPengurus();

        return [
            'id' => $this->id,
            'talent_question_id' => $this->talent_question_id,
            'option_text' => $this->option_text,
            'order' => $this->order,
            // Hanya tampilkan score/division ke admin untuk mencegah kecurangan
            'score' => $this->when($isAdmin, $this->score),
            'recommended_division' => $this->when($isAdmin, $this->recommended_division),
        ];
    }
}
