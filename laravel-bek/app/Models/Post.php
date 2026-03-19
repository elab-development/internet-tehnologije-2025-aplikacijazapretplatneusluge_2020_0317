<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory;
    protected $fillable = ['kreator_id', 'naslov', 'sadrzaj', 'pristup', 'nivo_pristupa_id'];

    protected $casts = [
        'datum_objave' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function subLevelReq()
    {
        return $this->belongsTo(SubLevel::class, 'nivo_pristupa_id');
    }

    public function images()
{
    return $this->hasMany(PostImages::class)->orderBy('redosled');
}
}
