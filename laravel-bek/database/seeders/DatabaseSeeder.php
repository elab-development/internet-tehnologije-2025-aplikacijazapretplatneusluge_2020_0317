<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            UserSeeder::class,
            CreatorSeeder::class,   // kreira kreatore, njihove nivoe i objave
            SubscriptionSeeder::class, // kreira pretplate i transakcije
        ]);
    }
}
