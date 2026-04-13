<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image ? url('storage/' . $this->image) : null,
            'location' => $this->location,
            'event_date' => $this->event_date?->toISOString(),
            'registration_deadline' => $this->registration_deadline?->toISOString(),
            'status' => $this->status,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'panitias' => UserResource::collection($this->whenLoaded('panitias')),
            'panitias_count' => $this->whenCounted('panitias'),
            'my_position' => $this->when($this->pivot, function() {
                return $this->pivot->position;
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
