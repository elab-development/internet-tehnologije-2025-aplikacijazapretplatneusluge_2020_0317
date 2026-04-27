<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Models\Subscription;
use App\Models\SubLevel;
use App\Http\Resources\SubscriptionResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class SubscriptionController extends Controller
{
    /**
     * Subscribe to a creator.
     */
    #[OA\Post(
        path: "/api/creators/{id}/subscribe",
        summary: "Subscribe to a creator",
        tags: ["Subscriptions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Creator ID", schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "nivo_id", type: "integer", nullable: true, description: "Tier ID (optional)")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Subscribed successfully", content: new OA\JsonContent(ref: "#/components/schemas/SubscriptionResource")),
            new OA\Response(response: 403, description: "Cannot subscribe to yourself"),
            new OA\Response(response: 404, description: "Creator not found"),
            new OA\Response(response: 409, description: "Already subscribed")
        ]
    )]
    public function store(Request $request, $creatorId)
    {
        $user = $request->user();
        $creator = Creator::find($creatorId);
        if (!$creator) {
            return response()->json(['poruka' => "Kreator nije pronadjen",], 404);
        }

        // Prevent subscribing to yourself (if user is also a creator)
        if ($user->creator && $user->creator->id === $creator->id) {
            return response()->json(['message' => 'Ne možete se pretplatiti na sebe.'], 403);
        }

        // Check if already subscribed
        $existing = Subscription::where('patron_id', $user->id)
            ->where('kreator_id', $creator->id)
            ->whereIn('status', ['aktivna', 'otkazana']) // allow resubscribing after cancellation? We'll treat as update.
            ->first();

        if ($existing && $existing->status === 'aktivna') {
            return response()->json(['message' => 'Već ste pretplaćeni na ovog kreatora.'], 409);
        }

        $validated = $request->validate([
            'nivo_id' => 'nullable|exists:sub_levels,id',
        ]);

        // If a tier is provided, ensure it belongs to this creator
        if (!empty($validated['nivo_id'])) {
            $tier = SubLevel::where('id', $validated['nivo_id'])
                ->where('kreator_id', $creator->id)
                ->first();
            if (!$tier) {
                return response()->json(['message' => 'Izabrani nivo ne pripada ovom kreatoru.'], 422);
            }
        }

        // If already had a cancelled subscription, reactivate it
        if ($existing) {
            $existing->update([
                'status' => 'aktivna',
                'nivo_id' => $validated['nivo_id'] ?? null,
                'datum_pocetka' => now(),
            ]);
            $subscription = $existing->fresh();
        } else {
            $subscription = Subscription::create([
                'patron_id' => $user->id,
                'kreator_id' => $creator->id,
                'nivo_id' => $validated['nivo_id'] ?? null,
                'status' => 'aktivna',
                'datum_pocetka' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Uspešno ste se pretplatili.',
            'subscription' => new SubscriptionResource($subscription->load('subLevel', 'creator.user')),
        ], 201);
    }

    /**
     * Unsubscribe from a creator.
     */
    #[OA\Delete(
        path: "/api/creators/{id}/subscribe",
        summary: "Unsubscribe from a creator",
        tags: ["Subscriptions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Creator ID", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Unsubscribed"),
            new OA\Response(response: 404, description: "Not subscribed or creator not found")
        ]
    )]
    public function destroy(Request $request, $creatorId)
    {
        $user = $request->user();
        $creator = Creator::find($creatorId);
        if (!$creator) {
            return response()->json(['poruka' => "Kreator nije pronadjen",], 404);
        }

        $subscription = Subscription::where('patron_id', $user->id)
            ->where('kreator_id', $creator->id)
            ->where('status', 'aktivna')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'Niste pretplaćeni na ovog kreatora.'], 404);
        }

        $subscription->update(['status' => 'otkazana']);

        return response()->json(['message' => 'Pretplata je otkazana.'], 200);
    }

    /**
     * List authenticated user's subscriptions.
     */
    #[OA\Get(
        path: "/api/subscriptions",
        summary: "List authenticated user's subscriptions",
        tags: ["Subscriptions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of subscriptions", content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/SubscriptionResource")))
        ]
    )]
    public function index(Request $request)
    {
        $subscriptions = $request->user()->subscriptions()
            ->with(['creator.user', 'subLevel'])
            ->latest('datum_pocetka')
            ->paginate($request->get('per_page', 15));

        return SubscriptionResource::collection($subscriptions);
    }

    /**
     * Show a single subscription (only if it belongs to the user).
     */
     #[OA\Get(
        path: "/api/subscriptions/{id}",
        summary: "Show a single subscription",
        tags: ["Subscriptions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Subscription details", content: new OA\JsonContent(ref: "#/components/schemas/SubscriptionResource")),
            new OA\Response(response: 404, description: "Not found")
        ]
    )]
    public function show(Request $request, $id)
    {
        $subscription = Subscription::with(['creator.user', 'subLevel'])
            ->where('patron_id', $request->user()->id)
            ->find($id);
        if (!$subscription) {
            return response()->json(['poruka' => "Pretplata nije pronadjena",], 404);
        }

        return new SubscriptionResource($subscription);
    }

    /**
     * Update subscription tier.
     */
    #[OA\Put(
        path: "/api/subscriptions/{id}",
        summary: "Update subscription tier",
        tags: ["Subscriptions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "nivo_id", type: "integer", nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Tier updated", content: new OA\JsonContent(ref: "#/components/schemas/SubscriptionResource")),
            new OA\Response(response: 404, description: "Subscription not found"),
            new OA\Response(response: 422, description: "Tier does not belong to creator")
        ]
    )]
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $subscription = Subscription::where('patron_id', $user->id)
            ->where('status', 'aktivna')
            ->find($id);
        if (!$subscription) {
            return response()->json(['poruka' => "Pretplata nije pronadjena",], 404);
        }

        $validated = $request->validate([
            'nivo_id' => 'nullable|exists:sub_levels,id',
        ]);

        if (!empty($validated['nivo_id'])) {
            $tier = SubLevel::where('id', $validated['nivo_id'])
                ->where('kreator_id', $subscription->kreator_id)
                ->first();
            if (!$tier) {
                return response()->json(['message' => 'Izabrani nivo ne pripada ovom kreatoru.'], 422);
            }
        }

        $subscription->update(['nivo_id' => $validated['nivo_id'] ?? null]);

        return response()->json([
            'message' => 'Nivo pretplate je ažuriran.',
            'subscription' => new SubscriptionResource($subscription->load('subLevel', 'creator.user')),
        ], 200);
    }
}