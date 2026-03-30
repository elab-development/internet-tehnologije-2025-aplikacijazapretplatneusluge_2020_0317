<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 10 patrona
        User::factory()->count(10)->patron()->create();
        // 5 kreatora
        User::factory()->count(5)->kreator()->create();
        // 5 oba (i patron i kreator)
        User::factory()->count(5)->oba()->create();
        // Admin
        User::factory()->create([
            'email' => 'admin@example.com',
            'name' => 'Admin User',
            'password' => 'admin123',
            'tip' => 'admin',
        ]);
    }
}
