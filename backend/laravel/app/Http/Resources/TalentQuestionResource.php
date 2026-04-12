<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TalentQuestionResource extends JsonResource
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
            'talent_test_id' => $this->talent_test_id,
            'question' => $this->question,
            'order' => $this->order,
            'weight' => $this->weight,
            'options' => TalentOptionResource::collection($this->whenLoaded('options')),
        ];
    }
}
