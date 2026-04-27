<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Http\Resources\CreatorResource;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CreatorController extends Controller
{
     /**
     * Display a listing of creators.
     */
    #[OA\Get(
        path: "/api/creators",
        summary: "Lista svih kreatora",
        tags: ["Creators"],
        parameters: [
            new OA\Parameter(
                name: "per_page",
                description: "Broj rezultata po stranici",
                in: "query",
                schema: new OA\Schema(type: "integer", default: 15)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Uspešno učitani kreatori",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "kreatori", type: "array", items: new OA\Items(ref: "#/components/schemas/CreatorResource")),
                        new OA\Property(property: "poruka", type: "string", example: "Uspesno usitani svi kreatori")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request)
    {
        $creators = Creator::All();
        return response()->json([
            'kreatori' => CreatorResource::collection($creators->load('user')),
            'poruka' => 'Uspesno usitani svi kreatori',
        ], 200);
    }

    /**
     * Display the specified creator.
     */
    #[OA\Get(
        path: "/api/creators/{id}",
        summary: "Pojedinačni kreator",
        tags: ["Creators"],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID kreatora",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Uspešno učitani kreator",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "kreator", ref: "#/components/schemas/CreatorResource"),
                        new OA\Property(property: "poruka", type: "string", example: "Uspesno ucitan kreator")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Kreator nije pronađen",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "poruka", type: "string", example: "Kreator nije pronadjen")
                    ]
                )
            )
        ]
    )]
    public function show($id)
    {
        // Load user and tiers for the response
        $creator = Creator::find($id);
        if (!$creator) {
            return response()->json(['poruka' => "Kreator nije pronadjen",], 404);
        }
        $creator->load('user');
        return response()->json([
            'kreator' => new CreatorResource($creator),
            'poruka' => 'Uspesno ucitan kreator',
        ], 200);
    }

    /**
     * User updates their Creator profile
     */
     #[OA\Put(
        path: "/api/creators/profile",
        summary: "Ažuriranje profila kreatora",
        description: "Samo kreator može ažurirati sopstveni profil.",
        tags: ["Creators"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "naziv_stranice", type: "string", example: "Moj novi naziv"),
                    new OA\Property(property: "opis", type: "string", nullable: true, example: "Novi opis")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Profil ažuriran",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profil kreatora uspešno ažuriran."),
                        new OA\Property(property: "creator", ref: "#/components/schemas/CreatorResource")
                    ]
                )
            ),
            new OA\Response(
                response: 403,
                description: "Nije kreator",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Niste kreator.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Greška u validaciji"
            )
        ]
    )]
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $creator = $user->creator;

        if (!$creator) {
            return response()->json(['message' => 'Niste kreator.'], 403);
        }

        $validated = $request->validate([
            'naziv_stranice' => 'sometimes|string|max:255',
            'opis' => 'nullable|string',
        ]);

        if (empty($validated)) {
            return response()->json(['message' => 'Nijedno polje za ažuriranje nije poslato.'], 422);
        }
        
        $creator->update($validated);

        return response()->json([
            'message' => 'Profil kreatora uspešno ažuriran.',
            'creator' => new CreatorResource($creator->load('user')),
        ], 200);
    }
}
