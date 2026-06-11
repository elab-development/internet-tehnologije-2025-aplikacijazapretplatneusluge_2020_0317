<?php

namespace App\Policies;

use App\Models\SubLevel;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SubLevelPolicy
{
    public function update(User $user, SubLevel $subLevel)
    {
        return $user->creator && $user->creator->id === $subLevel->kreator_id;
    }

    public function delete(User $user, SubLevel $subLevel)
    {
        return $user->creator && $user->creator->id === $subLevel->kreator_id;
    }
}
