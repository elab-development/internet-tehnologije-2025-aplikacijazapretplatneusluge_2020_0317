<?php

namespace Database\Factories;

use App\Models\SubLevel;
use App\Models\Creator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubLevel>
 */
class SubLevelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = SubLevel::class;

    public function definition(): array
    {
        return [
            'kreator_id' => Creator::factory(),
            'naziv' => $this->faker->word() . ' Tier',
            'cena_mesecno' => $this->faker->randomFloat(2, 1, 20),
            'opis' => $this->faker->sentence(),
        ];
    }
}
