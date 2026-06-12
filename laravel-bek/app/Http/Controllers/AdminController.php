<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Creator;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class AdminController extends Controller
{
    /**
     * List all users with optional filters.
     */
    #[OA\Get(
        path: "/api/admin/users",
        summary: "List all users (admin only)",
        description: "Requires role: admin. Supports filters: tip, role, per_page.",
        tags: ["Admin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "tip", in: "query", schema: new OA\Schema(type: "string", enum: ["patron","kreator","oba"])),
            new OA\Parameter(name: "role", in: "query", schema: new OA\Schema(type: "string", enum: ["user","admin"])),
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of users"),
            new OA\Response(response: 403, description: "Forbidden")
        ]
    )]
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
    #[OA\Put(
        path: "/api/admin/users/{id}/role",
        summary: "Update user role or tip (admin only)",
        description: "Requires role: admin.",
        tags: ["Admin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "role", type: "string", enum: ["user","admin"]),
                    new OA\Property(property: "tip", type: "string", enum: ["patron","kreator","oba"])
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "User updated"),
            new OA\Response(response: 404, description: "User not found"),
            new OA\Response(response: 403, description: "Forbidden")
        ]
    )]
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
        #[OA\Delete(
        path: "/api/admin/users/{id}",
        summary: "Delete a user (admin only)",
        description: "Requires role: admin. Cannot delete yourself.",
        tags: ["Admin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "User deleted"),
            new OA\Response(response: 403, description: "Forbidden (cannot delete yourself)"),
            new OA\Response(response: 404, description: "User not found")
        ]
    )]
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
    #[OA\Get(
        path: "/api/admin/creators",
        summary: "List all creators (admin only)",
        tags: ["Admin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of creators")
        ]
    )]
    public function creators(Request $request)
    {
        $creators = Creator::with('user', 'subLevels')
            ->paginate($request->get('per_page', 15));

        return response()->json($creators);
    }

    /**
     * Update creator's status 
     */
     #[OA\Put(
        path: "/api/admin/creators/{id}",
        summary: "Update a creator (admin only)",
        description: "Admin can edit any creator's page name or description.",
        tags: ["Admin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "naziv_stranice", type: "string"),
                    new OA\Property(property: "opis", type: "string", nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Creator updated"),
            new OA\Response(response: 404, description: "Creator not found")
        ]
    )]
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
        #[OA\Get(
        path: "/api/admin/stats",
        summary: "Platform statistics (admin only)",
        tags: ["Admin"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Statistics",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "total_users", type: "integer"),
                        new OA\Property(property: "total_creators", type: "integer"),
                        new OA\Property(property: "active_subscriptions", type: "integer"),
                        new OA\Property(property: "total_revenue", type: "number", format: "float")
                    ]
                )
            )
        ]
    )]
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
