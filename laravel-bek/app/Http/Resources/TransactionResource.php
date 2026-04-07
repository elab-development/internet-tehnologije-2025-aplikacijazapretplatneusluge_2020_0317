<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
