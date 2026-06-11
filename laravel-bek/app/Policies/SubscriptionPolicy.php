<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SubscriptionPolicy
{
    public function view(User $user, Subscription $subscription)
    {
        return $user->id === $subscription->patron_id;
    }

    public function update(User $user, Subscription $subscription)
    {
        return $user->id === $subscription->patron_id;
    }

    public function delete(User $user, Subscription $subscription)
    {
        return $user->id === $subscription->patron_id;
    }
}
