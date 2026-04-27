<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "CreatorResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user", ref: "#/components/schemas/UserResource"),
        new OA\Property(property: "naziv_stranice", type: "string", example: "Petrov kanal"),
        new OA\Property(property: "opis", type: "string", nullable: true, example: "Opis mog kanala"),
        new OA\Property(property: "sub_levels", type: "array", items: new OA\Items(ref: "#/components/schemas/TierResource")),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
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
