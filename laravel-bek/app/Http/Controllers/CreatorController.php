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
            return $this->neuspesno([], "Kreator nije pronadjen", 404);
        }
        $creator->load('user');
        return response()->json([
            'kreator' => new CreatorResource($creator),
            'poruka' => 'Uspesno ucitan kreator',
        ], 200);
    }
}
