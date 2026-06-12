<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use OpenApi\Attributes as OA;

class CurrencyController extends Controller
{
    // Valute koje ćemo prikazivati (uključujući EUR za konverziju)
    private $targetCurrencies = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = env('CURRENCYFREAKS_API_KEY');
    }

    #[OA\Get(
        path: "/api/currency-rates",
        summary: "Vrati trenutne devizne kurseve",
        description: "Vraca devizne kurseve najkoriscenije valute u poredjenju prema EUR. Rezultati se kesiraju na dva sata.",
        tags: ["Currency"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Devizni kursevi",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "base", type: "string", example: "EUR"),
                        new OA\Property(
                            property: "rates",
                            type: "object",
                            additionalProperties: new OA\AdditionalProperties(type: "number", format: "float"),
                            example: "USD: 1.08, GBP: 0.85"
                        ),
                        new OA\Property(property: "target_currencies", type: "array", items: new OA\Items(type: "string")),
                        new OA\Property(property: "updated_at", type: "string", format: "date-time")
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "API kljuc nije ispravan ili ne postoji",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "error", type: "string", example: "API ključ za CurrencyFreaks nije podešen.")
                    ]
                )
            ),
            new OA\Response(
                response: 503,
                description: "Kursevi nisu trenutno dostupni",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "error", type: "string", example: "Trenutno nije moguće dohvatiti kurseve.")
                    ]
                )
            )
        ]
    )]
    public function getRates()
    {
        if (!$this->apiKey) {
            return response()->json([
                'error' => 'API ključ za CurrencyFreaks nije podešen.'
            ], 500);
        }

        $rates = Cache::remember('exchange_rates', 7200, function () {
            $response = Http::get('https://api.currencyfreaks.com/v2.0/rates/latest', [
                'apikey' => $this->apiKey,
                'symbols' => implode(',', $this->targetCurrencies)
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['rates']) && isset($data['rates']['EUR'])) {
                    $usdRates = $data['rates'];
                    $eurRate = (float) $usdRates['EUR'];
                    $convertedRates = [];
                    $displayCurrencies = ['USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
                    foreach ($displayCurrencies as $currency) {
                        if (isset($usdRates[$currency])) {
                            $rateToUsd = (float) $usdRates[$currency];
                            // Kurs EUR -> currency = (rate currency/USD) / (rate EUR/USD)
                            $convertedRates[$currency] = round($rateToUsd / $eurRate, 6);
                        }
                    }
                    return $convertedRates;
                }
            }

            \Log::error('CurrencyFreaks API greška: ' . $response->body());
            return null;
        });

        if (!$rates) {
            return response()->json([
                'error' => 'Trenutno nije moguće dohvatiti kurseve.'
            ], 503);
        }

        return response()->json([
            'base' => 'EUR',
            'rates' => $rates,
            'target_currencies' => array_keys($rates),
            'updated_at' => now()->toDateTimeString(),
        ]);
    }
}
