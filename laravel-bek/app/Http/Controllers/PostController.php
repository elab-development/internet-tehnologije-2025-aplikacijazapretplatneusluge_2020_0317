<?php

namespace App\Http\Controllers;

use App\Models\Creator;
use App\Models\Post;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

class PostController extends Controller
{
     /**
     * Display a listing of public posts for a specific creator.
     */
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
