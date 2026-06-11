<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostPolicy
{
    public function view(User $user, Post $post)
    {
        // Dozvoli ako je korisnik vlasnik kreatora koji je napravio objavu
        return $user->creator && $user->creator->id === $post->kreator_id;
    }

    public function update(User $user, Post $post)
    {
        return $user->creator && $user->creator->id === $post->kreator_id;
    }

    public function delete(User $user, Post $post)
    {
        return $user->creator && $user->creator->id === $post->kreator_id;
    }
}
