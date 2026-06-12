<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class TransactionController extends Controller
{
    /**
     * List authenticated user's transactions (as patron).
     */
    #[OA\Get(
        path: "/api/transactions",
        summary: "List authenticated user's transactions (as patron)",
        tags: ["Transactions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of transactions", content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/TransactionResource")))
        ]
    )]
    public function index(Request $request)
    {
        $user = $request->user();
        $transactions = Transaction::whereHas('subscription', function ($q) use ($user) {
            $q->where('patron_id', $user->id);
        })->with('subscription.creator.user')
          ->latest('datum')
          ->paginate($request->get('per_page', 15));

        return response()->json([
            'transakcije' => TransactionResource::collection($transactions),
        ], 200);
    }

    /**
     * Get earnings for the authenticated creator.
     */
    #[OA\Get(
        path: "/api/creators/earnings",
        summary: "Get earnings for the authenticated creator",
        tags: ["Transactions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "start_date", in: "query", schema: new OA\Schema(type: "string", format: "date"), description: "Filter start date (YYYY-MM-DD)"),
            new OA\Parameter(name: "end_date", in: "query", schema: new OA\Schema(type: "string", format: "date"), description: "Filter end date")
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Earnings summary",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "total_earnings", type: "number", format: "float"),
                        new OA\Property(property: "monthly_breakdown", type: "array", items: new OA\Items(
                            properties: [
                                new OA\Property(property: "year", type: "integer"),
                                new OA\Property(property: "month", type: "integer"),
                                new OA\Property(property: "total", type: "number", format: "float")
                            ]
                        ))
                    ]
                )
            ),
            new OA\Response(response: 403, description: "Only creators can view earnings")
        ]
    )]
    public function earnings(Request $request)
    {
        $user = $request->user();
        $creator = $user->creator;

        if (!$creator) {
            return response()->json(['message' => 'Samo kreatori mogu videti zaradu.'], 403);
        }

        // Optional: filter by date range via query parameters
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = Transaction::whereHas('subscription', function ($q) use ($creator) {
            $q->where('kreator_id', $creator->id)
              ->where('status', 'aktivna'); // only active subscriptions generate payments
        })->where('status', 'uspešna');

        if ($startDate) {
            $query->whereDate('datum', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('datum', '<=', $endDate);
        }

        $totalEarnings = $query->sum('iznos');
        $monthlyEarnings = $query->select(
                DB::raw('YEAR(datum) as year'),
                DB::raw('MONTH(datum) as month'),
                DB::raw('SUM(iznos) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json([
            'total_earnings' => (float) $totalEarnings,
            'monthly_breakdown' => $monthlyEarnings,
        ]);
    }
}
