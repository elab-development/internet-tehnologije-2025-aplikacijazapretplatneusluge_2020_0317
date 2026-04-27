<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "SubscriptionResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 5),
        new OA\Property(
            property: "creator",
            properties: [
                new OA\Property(property: "id", type: "integer", example: 2),
                new OA\Property(property: "naziv_stranice", type: "string", example: "Muzički kanal"),
                new OA\Property(
                    property: "user",
                    properties: [
                        new OA\Property(property: "name", type: "string", example: "Marko Marković")
                    ],
                    type: "object"
                )
            ],
            type: "object"
        ),
        new OA\Property(
            property: "tier",
            nullable: true,
            properties: [
                new OA\Property(property: "id", type: "integer", example: 3),
                new OA\Property(property: "naziv", type: "string", example: "Gold"),
                new OA\Property(property: "cena_mesecno", type: "number", format: "float", example: 9.99)
            ],
            type: "object"
        ),
        new OA\Property(property: "status", type: "string", enum: ["aktivna", "otkazana", "istekla"], example: "aktivna"),
        new OA\Property(property: "datum_pocetka", type: "string", format: "date-time"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class SubscriptionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'creator' => [
                'id' => $this->creator->id,
                'naziv_stranice' => $this->creator->naziv_stranice,
                'user' => [
                    'name' => $this->creator->user->name,
                ],
            ],
            'tier' => $this->subLevel ? [
                'id' => $this->subLevel->id,
                'naziv' => $this->subLevel->naziv,
                'cena_mesecno' => $this->subLevel->cena_mesecno,
            ] : null,
            'status' => $this->status,
            'datum_pocetka' => $this->datum_pocetka,
            'created_at' => $this->created_at,
        ];
    }
}
