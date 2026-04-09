<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Creator;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * List all users with optional filters.
     */
    public function users(Request $request)
    {
        $query = User::with('creator');

        if ($request->has('tip')) {
            $query->where('tip', $request->tip);
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Update user's role (user/admin) or tip (patron/kreator/oba).
     */
    public function updateUserRole(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['poruka' => "Korisnik nije pronadjen",], 404);
        }

        $validated = $request->validate([
            'role' => ['sometimes', Rule::in(['user', 'admin'])],
            'tip' => ['sometimes', Rule::in(['patron', 'kreator', 'oba'])],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Korisnik uspešno ažuriran.',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user (and cascade delete related data).
     */
    public function destroyUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['poruka' => "Korisnik nije pronadjen",], 404);
        }

        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Ne možete obrisati sopstveni nalog.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Korisnik uspešno obrisan.']);
    }

    /**
     * List all creators with their users.
     */
    public function creators(Request $request)
    {
        $creators = Creator::with('user', 'subLevels')
            ->paginate($request->get('per_page', 15));

        return response()->json($creators);
    }

    /**
     * Update creator's status (e.g., block/unblock) – assuming status field exists.
     * If not, add a 'status' column to creators table (active/blocked).
     */
    public function updateCreator(Request $request, $id)
    {
        $creator = Creator::find($id);
        if (!$creator) {
            return response()->json(['poruka' => "Kreator nije pronadjen",], 404);
        }

        $validated = $request->validate([
            'naziv_stranice' => 'sometimes|string|max:255',
            'opis' => 'nullable|string',
        ]);

        // You need to add 'status' column to creators table via migration.
        $creator->update($validated);

        return response()->json([
            'message' => 'Kreator ažuriran.',
            'creator' => $creator,
        ]);
    }

    /**
     * Get platform statistics.
     */
    public function stats()
    {
        $totalUsers = User::count();
        $totalCreators = Creator::count();
        $totalSubscriptions = Subscription::where('status', 'aktivna')->count();
        $totalRevenue = Transaction::where('status', 'uspešna')->sum('iznos');

        return response()->json([
            'total_users' => $totalUsers,
            'total_creators' => $totalCreators,
            'active_subscriptions' => $totalSubscriptions,
            'total_revenue' => (float) $totalRevenue,
        ]);
    }
}
