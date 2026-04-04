<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreatorResource extends JsonResource
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
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email, // mozda treba sakriti
            ],
            'naziv_stranice' => $this->naziv_stranice,
            'opis' => $this->opis,
            'sub_levels' => TierResource::collection($this->whenLoaded('subLevels')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
