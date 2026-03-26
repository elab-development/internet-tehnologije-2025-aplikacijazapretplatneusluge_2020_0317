<?php

namespace Database\Factories;

use App\Models\PostImage;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PostImage>
 */
class PostImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'objava_id' => Objava::factory(),
            'putanja' => $this->faker->imageUrl(640, 480, 'cats', true, 'Faker'),
            'redosled' => $this->faker->numberBetween(0, 5),
        ];
    }
}
