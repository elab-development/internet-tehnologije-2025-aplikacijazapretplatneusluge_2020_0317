<?php

namespace Database\Factories;

use App\Models\Creator;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Creator>
 */
class CreatorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'korisnik_id' => User::factory()->kreator(), // kreira ili koristi postojećeg kreatora
            'naziv_stranice' => $this->faker->company(),
            'opis' => $this->faker->paragraph(),
        ];
    }
}
