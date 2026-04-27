<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Creator;
use App\Http\Resources\CreatorResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    /**
     * Ažuriranje profila ulogovanog korisnika.
     */
    #[OA\Put(
        path: "/api/users/profile",
        summary: "Update authenticated user's profile",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string"),
                    new OA\Property(property: "email", type: "string", format: "email"),
                    new OA\Property(property: "password", type: "string", format: "password")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Profile updated", content: new OA\JsonContent(ref: "#/components/schemas/UserResource")),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|string|min:8',
        ]);

        // Ako je poslat password, hesiraj ga
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil uspešno ažuriran.',
            'user' => $user->fresh(),
        ], 200);
    }

    /**
     * Brisanje naloga ulogovanog korisnika.
     */
     #[OA\Delete(
        path: "/api/users/me",
        summary: "Delete own account",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["password"],
                properties: [
                    new OA\Property(property: "password", type: "string", format: "password")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Account deleted"),
            new OA\Response(response: 401, description: "Invalid password"),
            new OA\Response(response: 403, description: "Forbidden")
        ]
    )]
    public function destroy(Request $request)
    {
        $user = $request->user();

        //dodatna provera lozinke pre brisanja (bezbednosni sloj)
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Lozinka nije tačna.'],
            ]);
        }

        // Brisanje svih tokena korisnika (odjavljuje sa svih uređaja)
        $user->tokens()->delete();

        // Brisanje korisnika (cascade će obrisati i kreatora, pretplate, objave itd. ako su relacije podešene sa onDelete('cascade'))
        $user->delete();

        return response()->json([
            'message' => 'Vaš nalog je uspešno obrisan.',
        ], 200);
    }

    #[OA\Post(
        path: "/api/users/become-creator",
        summary: "Upgrade a patron account to creator (oba)",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["naziv_stranice"],
                properties: [
                    new OA\Property(property: "naziv_stranice", type: "string", example: "My Awesome Page"),
                    new OA\Property(property: "opis", type: "string", nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Upgraded to creator", content: new OA\JsonContent(ref: "#/components/schemas/CreatorResource")),
            new OA\Response(response: 403, description: "Only patrons can become creators"),
            new OA\Response(response: 409, description: "Already has a creator profile"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function becomeCreator(Request $request)
    {
        $user = $request->user();

        // 1. Check current role
        if ($user->tip !== 'patron') {
            return response()->json([
                'message' => 'Samo korisnici tipa "patron" mogu postati kreatori.',
                'tip' => $user->tip
            ], 403);
        }

        // 2. Check if user already has a creator record
        if ($user->creator()->exists()) {
            return response()->json([
                'message' => 'Već imate kreiran kreatorski profil.'
            ], 409);
        }

        // 3. Validate creator data
        $validated = $request->validate([
            'naziv_stranice' => 'required|string|max:255|unique:creators,naziv_stranice',
            'opis' => 'nullable|string|max:1000',
        ]);

        // 4. Begin transaction to ensure both updates succeed
        \DB::beginTransaction();

        try {
            // Update user tip
            $user->update(['tip' => 'oba']);

            // Create creator record
            $creator = Creator::create([
                'korisnik_id' => $user->id,
                'naziv_stranice' => $validated['naziv_stranice'],
                'opis' => $validated['opis'],
            ]);

            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'message' => 'Došlo je do greške prilikom nadogradnje. Pokušajte ponovo.'
            ], 500);
        }

        // 5. Return response with user and creator data
        return response()->json([
            'message' => 'Uspešno ste postali kreator!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tip' => $user->tip,
            ],
            'creator' => new CreatorResource($creator->load('user')),
        ], 201);
    }
}
