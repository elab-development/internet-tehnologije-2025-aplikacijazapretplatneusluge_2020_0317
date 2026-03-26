<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubLevel extends Model
{
    protected $table = 'sub_levels';
    use HasFactory;
    protected $fillable = ['kreator_id', 'naziv', 'cena_mesecno', 'opis'];

    public function creator()
    {
        return $this->belongsTo(Creator::class, 'kreator_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'nivo_id');
    }

    public function posts()
    {
        return $this->hasMany(Post::class, 'nivo_pristupa_id');
    }
}
