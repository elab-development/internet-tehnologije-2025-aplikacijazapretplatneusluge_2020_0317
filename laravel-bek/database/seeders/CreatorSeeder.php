<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Creator;
use App\Models\SubLevel;
use App\Models\Post;
use App\Models\User;

class CreatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $korisniciKreatori = User::whereIn('tip', ['kreator', 'oba'])->get();

        foreach ($korisniciKreatori as $user) {
            $creator = Creator::factory()->create([
                'korisnik_id' => $user->id,
            ]);

            // 2-4 nivoa pretplate – direktno create sa kreator_id
            $subLevels = SubLevel::factory()
                ->count(rand(2, 4))
                ->create(['kreator_id' => $creator->id]);

            // 5-15 objava – direktno create sa kreator_id
            $posts = Post::factory()
                ->count(rand(5, 15))
                ->create(['kreator_id' => $creator->id]);

            // Ako objava zahteva nivo, dodelimo joj neki od postojećih nivoa ovog kreatora
            foreach ($posts as $post) {
                if ($post->pristup === 'nivo') {
                    $post->nivo_pristupa_id = $subLevels->random()->id;
                    $post->save();
                }
            }
        }
    }
}
