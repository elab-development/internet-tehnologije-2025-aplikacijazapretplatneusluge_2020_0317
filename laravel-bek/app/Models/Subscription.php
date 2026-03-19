<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;
    protected $fillable = ['patron_id', 'kreator_id', 'nivo_id', 'status'];

    protected $casts = [
        'datum_pocetka' => 'datetime',
    ];

    public function subscriber()
    {
        return $this->belongsTo(User::class, 'patron_id');
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function subLevel()
    {
        return $this->belongsTo(SubLevel::class, 'nivo_id');
    }

    public function transaction()
    {
        return $this->hasMany(Transaction::class);
    }
}
