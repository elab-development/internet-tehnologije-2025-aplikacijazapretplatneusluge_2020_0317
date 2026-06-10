<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use OpenApi\Attributes as OA;

class QuoteController extends Controller
{

    #[OA\Get(
        path: "/api/random-quote",
        summary: "Uzmi slucajni inspiracioni citat",
        description: "Vraca slucajni citat preko eksternog API (type.fit) sa fallback-om.",
        tags: ["Misc"],
        responses: [
            new OA\Response(
                response: 200,
                description: "slucajni citat",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "content", type: "string", example: "Kreativnost je inteligencija koja se zabavlja."),
                        new OA\Property(property: "author", type: "string", example: "Albert Einstein")
                    ]
                )
            )
        ]
    )]
    public function randomQuote()
    {
        try {
            // Fetch all quotes from type.fit API
            $response = Http::get('https://type.fit/api/quotes');

            if ($response->successful()) {
                $quotes = $response->json();
                $random = $quotes[array_rand($quotes)];

                return response()->json([
                    'content' => $random['text'],
                    'author' => $random['author'] ?? 'Unknown'
                ]);
            }
        } catch (\Exception $e) {
            // Log error but return a fallback quote
        }

        return response()->json([
            'content' => 'Kreativnost je inteligencija koja se zabavlja.',
            'author' => 'Albert Einstein'
        ]);
    }
}