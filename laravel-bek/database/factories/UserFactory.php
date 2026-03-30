<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'password' => Hash::make('password'),  // svi dobijaju istu lozinku radi testiranja
            'tip' => $this->faker->randomElement(['patron', 'kreator', 'oba','admin']),
            'remember_token' => Str::random(10),
        ];
    }

    // Stanje: korisnik je samo kreator
    public function kreator()
    {
        return $this->state(fn (array $attributes) => [
            'tip' => 'kreator',
        ]);
    }

    // Stanje: korisnik je samo patron
    public function patron()
    {
        return $this->state(fn (array $attributes) => [
            'tip' => 'patron',
        ]);
    }

    // Stanje: korisnik je i kreator i patron
    public function oba()
    {
        return $this->state(fn (array $attributes) => [
            'tip' => 'oba',
        ]);
    }

    //Stanje: korisnik je admin
    public function admin()
    {
        return $this->state(fn (array $attributes) => [
            'tip' => 'admin',
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
