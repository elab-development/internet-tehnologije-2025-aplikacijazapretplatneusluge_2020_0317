<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    /**
     * Registracija novog korisnika.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'tip' => 'sometimes|in:patron,kreator,oba',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'tip' => $validated['tip'] ?? 'patron', // podrazumevam patron
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Korisnik uspešno registrovan.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Prijavljivanje korisnika.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Uneti podaci nisu ispravni.'],
            ]);
        }

        // Obriši postojeće tokene (opciono, može da se ostavi više aktivnih)
        //$user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Uspešno ste se prijavili.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Odjava – briše trenutni token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Uspešno ste se odjavili.']);
    }

    /**
     * Prikazuje podatke ulogovanog korisnika.
     */
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }
}
