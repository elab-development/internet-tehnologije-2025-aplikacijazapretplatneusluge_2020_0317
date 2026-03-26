<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Creator;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {

        $patroni = User::whereIn('tip', ['patron', 'oba'])->get();
        $kreatori = Creator::all();

        if ($patroni->isEmpty() || $kreatori->isEmpty()) {
            return;
        }

        // Napravi 40 pretplata
        for ($i = 0; $i < 20; $i++) {
            $patron = $patroni->random();
            $kreator = $kreatori->random();

            $nivoId = null;
            if ($kreator->subLevels->isNotEmpty() && fake()->boolean(70)) {
                $nivoId = $kreator->subLevels->random()->id;
            }

            // Kreiraj pretplatu
            $subscription = Subscription::factory()->create([
                'patron_id' => $patron->id,
                'kreator_id' => $kreator->id,
                'nivo_id' => $nivoId,
            ]);

            // Svakoj pretplati dodaj 1–6 transakcija
            $brojTransakcija = rand(1, 6);
            for ($j = 0; $j < $brojTransakcija; $j++) {
                Transaction::factory()->create([
                    'pretplata_id' => $subscription->id,
                    'iznos' => $nivoId
                        ? $kreator->subLevels->find($nivoId)->cena_mesecno
                        : fake()->randomFloat(2, 1, 20),
                ]);
            }
        }
    }
}
