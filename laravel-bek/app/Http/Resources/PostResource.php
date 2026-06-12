<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "PostResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 10),
        new OA\Property(property: "naslov", type: "string", example: "Nova objava"),
        new OA\Property(property: "sadrzaj", type: "string", example: "Sadržaj objave..."),
        new OA\Property(property: "datum_objave", type: "string", format: "date-time"),
        new OA\Property(property: "pristup", type: "string", enum: ["javno", "pretplatnici", "nivo"], example: "javno"),
        new OA\Property(property: "nivo_pristupa_id", type: "integer", nullable: true, example: null),
        new OA\Property(
            property: "creator",
            properties: [
                new OA\Property(property: "id", type: "integer", example: 3),
                new OA\Property(property: "naziv_stranice", type: "string", example: "Petrov kanal"),
                new OA\Property(
                    property: "user",
                    properties: [
                        new OA\Property(property: "name", type: "string", example: "Petar Petrović")
                    ],
                    type: "object"
                )
            ],
            type: "object"
        ),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        // new OA\Property(property: "images", type: "array", items: new OA\Items(ref: "#/components/schemas/PostImageResource")),
    ]
)]
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
