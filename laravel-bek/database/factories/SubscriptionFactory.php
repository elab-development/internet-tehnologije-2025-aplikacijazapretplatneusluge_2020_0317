<?php

namespace Database\Factories;

use App\Models\Subscription;
use App\Models\User;
use App\Models\Creator;
use App\Models\SubLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patron_id' => User::factory()->patron(),
            'kreator_id' => Creator::factory(),
            'nivo_id' => $this->faker->optional(0.7)->passthrough(SubLevel::factory()), // 70% šanse da ima nivo
            'datum_pocetka' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'status' => $this->faker->randomElement(['aktivna', 'otkazana', 'istekla']),
        ];
    }

    // Aktivna pretplata
    public function aktivna()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'aktivna',
        ]);
    }
}
