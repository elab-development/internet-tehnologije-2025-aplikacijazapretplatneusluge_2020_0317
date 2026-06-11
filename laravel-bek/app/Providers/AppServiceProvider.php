<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Post;
use App\Models\SubLevel;
use App\Models\Subscription;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
    Subscription::class => SubscriptionPolicy::class,
    Post::class => PostPolicy::class,
    SubLevel::class => SubLevelPolicy::class,
    ];
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
