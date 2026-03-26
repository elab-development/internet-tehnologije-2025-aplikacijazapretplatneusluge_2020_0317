<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\Creator;
use App\Models\SubLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pristup = $this->faker->randomElement(['javno', 'pretplatnici', 'nivo']);
        return [
            'kreator_id' => Creator::factory(),
            'naslov' => $this->faker->sentence(),
            'sadrzaj' => $this->faker->paragraphs(3, true),
            'datum_objave' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'pristup' => $pristup,
            //'nivo_pristupa_id' => $pristup === 'nivo' ? SubLevel::factory() : null,
        ];
    }

    public function javna()
    {
        return $this->state(fn (array $attributes) => [
            'pristup' => 'javno',
            'nivo_pristupa_id' => null,
        ]);
    }

    public function zaPretplatnike()
    {
        return $this->state(fn (array $attributes) => [
            'pristup' => 'pretplatnici',
            'nivo_pristupa_id' => null,
        ]);
    }

    public function zaNivo()
    {
        return $this->state(fn (array $attributes) => [
            'pristup' => 'nivo',
            'nivo_pristupa_id' => SubLevel::factory(),
        ]);
    }
}
