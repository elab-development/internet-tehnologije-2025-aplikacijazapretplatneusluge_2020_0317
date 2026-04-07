<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
