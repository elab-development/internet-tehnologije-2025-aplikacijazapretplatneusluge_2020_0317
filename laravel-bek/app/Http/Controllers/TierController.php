<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Http\Resources\TierResource;
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
            return $this->neuspesno([], "Kreator nije pronadjen", 404);
        }
        $sublvls = $creator->subLevels()->get();
        return response()->json([
            'sublvls' => TierResource::collection($sublvls),
            'poruka' => 'Uspesno ucitani nivoi pretplata',
        ], 200);
    }
}
