<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'member_number' => $this->member_number, // nomor kartu anggota
            'avatar'        => $this->avatar,
            'address'       => $this->address,
            'province'      => $this->province,
            'city'          => $this->city,
            'district'      => $this->district,
            'phone'         => $this->phone,
            'photo'         => $this->photo ? url('storage/' . $this->photo) : null,
            'points'        => $this->points,
            'level'         => $this->level,
            'role'          => $this->role,
            'status'        => $this->status,
            'position_id'   => $this->position_id,
            'position'      => $this->position?->name,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at'    => $this->created_at?->toISOString(),
            'updated_at'    => $this->updated_at?->toISOString(),

            // Conditional relationships
            'events' => EventResource::collection($this->whenLoaded('events')),
            'aspirations_count' => $this->whenCounted('aspirations'),
            'talent_results' => TalentResultResource::collection($this->whenLoaded('talentResults')),
        ];
    }
}
