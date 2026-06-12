<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Creator;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SubscriptionPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_patron_can_view_only_his_subscription()
    {
        $patron1 = User::factory()->patron()->create();
        $patron2 = User::factory()->patron()->create();
        $creator = Creator::factory()->create();

        $sub = Subscription::factory()->create([
            'patron_id' => $patron1->id,
            'kreator_id' => $creator->id,
        ]);

        // Patron1 treba da vidi svoju pretplatu
        $this->actingAs($patron1, 'sanctum')
             ->getJson("/api/subscriptions/{$sub->id}")
             ->assertStatus(200);

        // Patron2 treba da dobije 403
        $this->actingAs($patron2, 'sanctum')
             ->getJson("/api/subscriptions/{$sub->id}")
             ->assertStatus(403);
    }
}