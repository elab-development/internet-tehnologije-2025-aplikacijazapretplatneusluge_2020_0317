<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Models\Post;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PostController extends Controller
{
     /**
     * Display a listing of public posts for a specific creator.
     */
        #[OA\Get(
        path: "/api/creators/{id}/posts",
        summary: "Javne objave kreatora",
        tags: ["Posts"],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID kreatora",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            ),
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
                description: "Uspešno učitane objave",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "objave", type: "array", items: new OA\Items(ref: "#/components/schemas/PostResource")),
                        new OA\Property(property: "poruka", type: "string", example: "Uspesno ucitane sve objave")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Kreator nije pronađen",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Kreator ne postoji.")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request, $id)
    {
        $creator = Creator::find($id);
        $posts = $creator->posts()
            ->where('pristup', 'javno') // only public posts for public listing
            ->orderBy('datum_objave', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'objave' => PostResource::collection($posts),
            'poruka' => 'Uspesno ucitane sve objave',
        ], 200);
    }

    /**
     * Display the specified post if it is public.
     */
    #[OA\Get(
        path: "/api/posts/{id}",
        summary: "Pojedinačna javna objava",
        tags: ["Posts"],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID objave",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Uspešno učitana objava",
                content: new OA\JsonContent(ref: "#/components/schemas/PostResource")
            ),
            new OA\Response(
                response: 403,
                description: "Objava nije javna",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "poruka", type: "string", example: "Objava nije javna!")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Objava nije pronađena"
            )
        ]
    )]
    public function show($id)
    {
        // Only allow access if post is public
        $post = Post::find($id);
        if ($post->pristup !== 'javno') {
             return response()->json([
            'poruka' => 'Objava nije javna!',
            ], 403);
        }

        // Load creator and images (if needed)
        $post->load('creator.user', 'images');

        return new PostResource($post);
    }

    #[OA\Post(
        path: "/api/creators/{id}/posts",
        summary: "Kreiranje nove objave",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID kreatora",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["naslov", "sadrzaj", "pristup"],
                properties: [
                    new OA\Property(property: "naslov", type: "string", example: "Nova objava"),
                    new OA\Property(property: "sadrzaj", type: "string", example: "Sadržaj objave..."),
                    new OA\Property(property: "pristup", type: "string", enum: ["javno", "pretplatnici", "nivo"], example: "javno"),
                    new OA\Property(property: "nivo_pristupa_id", type: "integer", nullable: true, example: 3)
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Objava kreirana",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Objava uspešno kreirana."),
                        new OA\Property(property: "post", ref: "#/components/schemas/PostResource")
                    ]
                )
            ),
            new OA\Response(
                response: 403,
                description: "Nema dozvolu",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Nemate dozvolu.")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Kreator ne postoji"
            ),
            new OA\Response(
                response: 422,
                description: "Validaciona greška"
            )
        ]
    )]
    public function store(Request $request, $creatorId)
    {
        $user = $request->user();
        $creator = Creator::find($creatorId);
        if (!$creator) {
            return response()->json(['message' => 'Kreator ne postoji.'], 404);
        }

        if ($user->creator->id !== $creator->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $validated = $request->validate([
            'naslov' => 'required|string|max:255',
            'sadrzaj' => 'required|string',
            'pristup' => 'required|in:javno,pretplatnici,nivo',
            'nivo_pristupa_id' => 'nullable|exists:sub_levels,id',
        ]);

        if ($validated['pristup'] === 'nivo' && !isset($validated['nivo_pristupa_id'])){
            return response()->json(['message' => 'Objava nema selektovan nivo pretplate!'], 422);
        }
        // Optionally ensure the nivo belongs to this creator
        if ($validated['pristup'] === 'nivo' && $validated['nivo_pristupa_id']) {
            $tierBelongsToCreator = $creator->subLevels()->where('id', $validated['nivo_pristupa_id'])->exists();
            if (!$tierBelongsToCreator) {
                return response()->json(['message' => 'Izabrani nivo ne pripada ovom kreatoru.'], 422);
            }
        }

        $post = $creator->posts()->create($validated);

        return response()->json([
            'message' => 'Objava uspešno kreirana.',
            'post' => new PostResource($post->load('images')),
        ], 201);
    }

        #[OA\Put(
        path: "/api/posts/{id}",
        summary: "Ažuriranje objave",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID objave",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "naslov", type: "string", example: "Izmenjen naslov"),
                    new OA\Property(property: "sadrzaj", type: "string", example: "Izmenjen sadržaj"),
                    new OA\Property(property: "pristup", type: "string", enum: ["javno", "pretplatnici", "nivo"], example: "nivo"),
                    new OA\Property(property: "nivo_pristupa_id", type: "integer", nullable: true, example: 2)
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Objava ažurirana",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Objava uspešno ažurirana."),
                        new OA\Property(property: "post", ref: "#/components/schemas/PostResource")
                    ]
                )
            ),
            new OA\Response(
                response: 403,
                description: "Nema dozvolu",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Nemate dozvolu.")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Objava nije pronađena"
            ),
            new OA\Response(
                response: 422,
                description: "Validaciona greška"
            )
        ]
    )]
    public function update(Request $request, $postId)
    {
        $user = $request->user();
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['message' => 'Objava ne postoji.'], 404);
        }

        if ($user->creator->id !== $post->creator->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $validated = $request->validate([
            'naslov' => 'sometimes|string|max:255',
            'sadrzaj' => 'sometimes|string',
            'pristup' => 'sometimes|in:javno,pretplatnici,nivo',
            'nivo_pristupa_id' => 'nullable|exists:sub_levels,id',
        ]);

        if ($validated['pristup'] === 'nivo' && !isset($validated['nivo_pristupa_id'])){
            return response()->json(['message' => 'Objava nema selektovan nivo pretplate!'], 422);
        }
        // If changing to nivo, ensure the tier belongs to this creator
        if (isset($validated['pristup']) && $validated['pristup'] === 'nivo' && isset($validated['nivo_pristupa_id'])) {
            $tierBelongsToCreator = $post->creator->subLevels()->where('id', $validated['nivo_pristupa_id'])->exists();
            if (!$tierBelongsToCreator) {
                return response()->json(['message' => 'Izabrani nivo ne pripada ovom kreatoru.'], 422);
            }
        }

        $post->update($validated);

        return response()->json([
            'message' => 'Objava uspešno ažurirana.',
            'post' => new PostResource($post->load('images')),
        ], 200);
    }

        #[OA\Delete(
        path: "/api/posts/{id}",
        summary: "Brisanje objave",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID objave",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Objava obrisana",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Objava uspešno obrisana.")
                    ]
                )
            ),
            new OA\Response(
                response: 403,
                description: "Nema dozvolu",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Nemate dozvolu.")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Objava nije pronađena"
            )
        ]
    )]
    public function destroy(Request $request, $postId)
    {
        $user = $request->user();
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['message' => 'Objava ne postoji.'], 404);
        }

        if ($user->creator->id !== $post->creator->id) {
            return response()->json(['message' => 'Nemate dozvolu.'], 403);
        }

        $post->delete();

        return response()->json([
            'message' => 'Objava uspešno obrisana.',
        ], 200);
    }
}
