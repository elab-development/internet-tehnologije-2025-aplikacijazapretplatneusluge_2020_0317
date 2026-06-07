<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class CurrencyController extends Controller
{
    // Valute koje ćemo prikazivati (uključujući EUR za konverziju)
    private $targetCurrencies = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = env('CURRENCYFREAKS_API_KEY');
    }

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
