<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
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
            'naslov' => $this->naslov,
            'sadrzaj' => $this->sadrzaj,
            'datum_objave' => $this->datum_objave,
            'pristup' => $this->pristup, // 'javno' za public routes
            'nivo_pristupa_id' => $this->nivo_pristupa_id,
            'creator' => [
                'id' => $this->creator->id,
                'naziv_stranice' => $this->creator->naziv_stranice,
                'user' => [
                    'name' => $this->creator->user->name,
                ],
            ],
            //'images' => PostImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at,
        ];
    }
}
