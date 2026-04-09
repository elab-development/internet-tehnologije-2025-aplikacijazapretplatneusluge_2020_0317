<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "UserResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Petar Petrović"),
        new OA\Property(property: "email", type: "string", format: "email", example: "petar@example.com"),
        new OA\Property(property: "tip", type: "string", enum: ["patron", "kreator", "oba"], example: "patron"),
        new OA\Property(property: "role", type: "string", enum: ["user", "admin"], example: "user"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time")
    ]
)]
class UserResource extends JsonResource
{
    
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'tip' => $this->tip,
            'role' => $this->role,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_creator' => in_array($this->tip, ['kreator', 'oba']),
        ];
    }
}
