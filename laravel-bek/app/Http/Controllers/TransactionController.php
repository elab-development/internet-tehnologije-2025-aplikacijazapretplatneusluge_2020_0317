<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * List authenticated user's transactions (as patron).
     */
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
