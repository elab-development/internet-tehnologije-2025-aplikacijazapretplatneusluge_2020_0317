<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Uzmi iznos iz nivoa pretplate ako postoji, inače nasumičan
        $iznos = function (array $attributes) {
            if ($pretplata = Subscription::find($attributes['pretplata_id'])) {
                return $pretplata->nivo ? $pretplata->nivo->cena_mesecno : $this->faker->randomFloat(2, 1, 20);
            }
            return $this->faker->randomFloat(2, 1, 20);
        };

        return [
            'pretplata_id' => Subscription::factory(),
            'iznos' => $iznos,
            'datum' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'status' => function () {
                $rand = fake()->numberBetween(1, 100);
                if ($rand <= 80) return 'uspešna';
                return 'neuspešna';
            },
        ];
    }

    public function uspesna()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'uspešna',
        ]);
    }
}
