<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            //abort(403, 'Nemate dozvolu za ovu akciju.');
            return response()->json(['poruka' => "Nemate dozvolu za ovu akciju.",], 403);
        }

        return $next($request);
    }
}
