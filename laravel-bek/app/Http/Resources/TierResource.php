<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "TierResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 3),
        new OA\Property(property: "naziv", type: "string", example: "Bronzani nivo"),
        new OA\Property(property: "cena_mesecno", type: "number", format: "float", example: 4.99),
        new OA\Property(property: "opis", type: "string", nullable: true, example: "Osnovne pogodnosti"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class TierResource extends JsonResource
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
            'naziv' => $this->naziv,
            'cena_mesecno' => $this->cena_mesecno,
            'opis' => $this->opis,
            'created_at' => $this->created_at,
        ];
    }
}
