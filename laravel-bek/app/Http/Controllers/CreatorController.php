<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Http\Resources\CreatorResource;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
     /**
     * Display a listing of creators.
     */
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
