<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Creator extends Model
{
    use HasFactory;
    protected $fillable = ['korisnik_id', 'naziv_stranice', 'opis'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subLevels()
    {
        return $this->hasMany(SubLevel::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function subscribers()
    {
        return $this->hasMany(Subscription::class);
    }
}
