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
}
