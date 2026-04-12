<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AspirationResource extends JsonResource
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
            'category' => $this->category,
            'message' => $this->message,
            'is_anonymous' => $this->is_anonymous,
            'status' => $this->status,
            'admin_response' => $this->admin_response,
            'handled_by' => $this->handled_by,
            // Jika anonymous, sembunyikan data user
            'user' => $this->when(
                ! $this->is_anonymous || $request->user()?->isAdmin(),
                fn () => new UserResource($this->whenLoaded('user'))
            ),
            'handler' => new UserResource($this->whenLoaded('handler')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
