<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TalentResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'talent_test_id' => $this->talent_test_id,
            'total_score' => $this->total_score,
            'recommended_division' => $this->recommended_division,
            'analysis' => $this->analysis,
            'answers' => $this->answers,
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'talent_test' => new TalentTestResource($this->whenLoaded('talentTest')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
