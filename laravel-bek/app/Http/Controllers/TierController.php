<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Models\SubLevel;
use App\Http\Resources\TierResource;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class TierController extends Controller
{
    /**
     * Display a listing of tiers for a specific creator.
     */
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
