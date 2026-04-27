<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Models\SubLevel;
use App\Http\Resources\TierResource;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TierController extends Controller
{
    /**
     * Display a listing of tiers for a specific creator.
     */
    #[OA\Get(
        path: "/api/creators/{id}/tiers",
        summary: "List tiers (subscription levels) of a creator",
        tags: ["Tiers"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Creator ID", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of tiers", content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/TierResource"))),
            new OA\Response(response: 404, description: "Creator not found")
        ]
    )]
    public function index($id)
    {
        $creator = Creator::find($id);
        if (!$creator) {
            return response()->json(['message' => 'Kreator nije pronadjen'], 404);
        }
        $sublvls = $creator->subLevels()->get();
        return response()->json([
            'sublvls' => TierResource::collection($sublvls),
            'poruka' => 'Uspesno ucitani nivoi pretplata',
        ], 200);
    }

    /**
     * Add a sub tier
     */
    #[OA\Post(
        path: "/api/creators/{id}/tiers",
        summary: "Create a new tier (creator only)",
        tags: ["Tiers"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Creator ID", schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["naziv", "cena_mesecno"],
                properties: [
                    new OA\Property(property: "naziv", type: "string", example: "Gold"),
                    new OA\Property(property: "cena_mesecno", type: "number", format: "float", example: 9.99),
                    new OA\Property(property: "opis", type: "string", nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Tier created", content: new OA\JsonContent(ref: "#/components/schemas/TierResource")),
            new OA\Response(response: 403, description: "Forbidden (not your creator profile)"),
            new OA\Response(response: 404, description: "Creator not found"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request, $creatorId)
    {
        $user = $request->user();
        $creator = Creator::find($creatorId);
        if (!$creator) {
            return response()->json(['message' => 'Kreator nije pronadjen'], 404);
        }

        // Authorization: only the creator owner can add tiers
        if ($user->creator->id !== $creator->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $validated = Validator::make($request->all(), [
            'naziv' => 'required|string|max:255',
            'cena_mesecno' => 'required|numeric|min:0',
            'opis' => 'nullable|string',
        ]);

        if ($validated->fails()) {
            return response()->json(['message' => 'Validaciona greska',], 422);
        }

        $tier = $creator->subLevels()->create([
            'naziv'=> $request->naziv,
            'cena_mesecno'=> $request->cena_mesecno, 
            'opis'=> $request->opis
        ]);

        return response()->json([
            'message' => 'Nivo uspešno kreiran.',
            'tier' => new TierResource($tier),
        ], 201);
    }

    /**
     * Update existing a sub tier
     */
    #[OA\Put(
        path: "/api/tiers/{id}",
        summary: "Update a tier (creator only)",
        tags: ["Tiers"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Tier ID", schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "naziv", type: "string"),
                    new OA\Property(property: "cena_mesecno", type: "number", format: "float"),
                    new OA\Property(property: "opis", type: "string", nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Tier updated", content: new OA\JsonContent(ref: "#/components/schemas/TierResource")),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Tier not found")
        ]
    )]
    public function update(Request $request, $tierId)
    {
        $user = $request->user();
        $tier = SubLevel::find($tierId);
        if (!$tier) {
            return response()->json(['message' => 'Nivo pretplate nije pronadjen'], 404);
        }

        // Check ownership via creator relationship
        if ($user->creator->id !== $tier->creator->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $validated = $request->validate([
            'naziv' => 'sometimes|string|max:255',
            'cena_mesecno' => 'sometimes|numeric|min:0',
            'opis' => 'nullable|string',
        ]);

        $tier->update($validated);

        return response()->json([
            'message' => 'Nivo uspešno ažuriran.',
            'tier' => new TierResource($tier),
        ], 200);
    }

    /**
     * Delete existing a sub tier
     */
    #[OA\Delete(
        path: "/api/tiers/{id}",
        summary: "Delete a tier (creator only)",
        tags: ["Tiers"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Tier ID", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Tier deleted"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Tier not found")
        ]
    )]
    public function destroy(Request $request, $tierId)
    {
        $user = $request->user();
        $tier = SubLevel::find($tierId);
        if (!$tier) {
            return response()->json(['message' => 'Nivo pretplate nije pronadjen'], 404);
        }

        if ($user->creator->id !== $tier->creator->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $tier->delete();

        return response()->json([
            'message' => 'Nivo uspešno obrisan.',
        ], 200);
    }
}
