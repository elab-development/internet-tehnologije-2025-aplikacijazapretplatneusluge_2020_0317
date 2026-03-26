<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostImage extends Model
{
    use HasFactory;
    protected $fillable = ['objava_id', 'putanja', 'redosled'];

    public function post()
    {
        return $this->belongsTo(Post::class, 'objava_id');
    }
}
