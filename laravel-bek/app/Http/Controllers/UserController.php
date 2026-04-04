<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Ažuriranje profila ulogovanog korisnika.
     */
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
            //'tip' => ['sometimes', Rule::in(['patron', 'kreator', 'oba'])],
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
    public function destroy(Request $request)
    {
        $user = $request->user();

        // Opciono: dodatna provera lozinke pre brisanja (bezbednosni sloj)
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
}
