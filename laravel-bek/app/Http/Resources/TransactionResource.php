<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "TransactionResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 42),
        new OA\Property(property: "amount", type: "number", format: "float", example: 9.99),
        new OA\Property(property: "date", type: "string", format: "date-time"),
        new OA\Property(property: "status", type: "string", enum: ["uspešna", "neuspešna"], example: "uspešna"),
        new OA\Property(
            property: "subscription",
            properties: [
                new OA\Property(property: "id", type: "integer", example: 5),
                new OA\Property(
                    property: "creator",
                    properties: [
                        new OA\Property(property: "name", type: "string", example: "Petar Petrović"),
                        new OA\Property(property: "page_name", type: "string", example: "Petrov kanal")
                    ],
                    type: "object"
                )
            ],
            type: "object"
        )
    ]
)]
class TransactionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'amount' => $this->iznos,
            'date' => $this->datum,
            'status' => $this->status,
            'subscription' => [
                'id' => $this->subscription->id,
                'creator' => [
                    'name' => $this->subscription->creator->user->name,
                    'page_name' => $this->subscription->creator->naziv_stranice,
                ],
            ],
        ];
    }
}
