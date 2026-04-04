<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;
    protected $fillable = ['pretplata_id', 'iznos', 'status'];

    public function subscription()
    {

        return $this->belongsTo(Subscription::class, 'pretplata_id');
    }
}
