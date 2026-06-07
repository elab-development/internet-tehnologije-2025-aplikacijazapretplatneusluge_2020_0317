<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class QuoteController extends Controller
{
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