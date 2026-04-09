<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CreatorController;
use App\Http\Controllers\TierController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/creators', [CreatorController::class, 'index']);
Route::get('/creators/{id}', [CreatorController::class, 'show']);
Route::get('/creators/{id}/tiers', [TierController::class, 'index']); 
Route::get('/creators/{id}/posts', [PostController::class, 'index']); //javne objave datog kreatora
Route::get('/posts/{id}', [PostController::class, 'show']); //javna objava (ako je javna uopste)

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    //user control
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::delete('/users/me', [UserController::class, 'destroy']);
    //become creator
    Route::post('/users/become-creator', [UserController::class, 'becomeCreator']);

     // Creator profile
    Route::put('/creators/profile', [CreatorController::class, 'updateProfile']);

    //Tiers (subscription levels)
    Route::post('/creators/{id}/tiers', [TierController::class, 'store']);
    Route::put('/tiers/{id}', [TierController::class, 'update']);
    Route::delete('/tiers/{id}', [TierController::class, 'destroy']);

    // Posts
    Route::post('/creators/{id}/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);

    // Subscriptions
    Route::post('/creators/{id}/subscribe', [SubscriptionController::class, 'store']);
    Route::delete('/creators/{id}/subscribe', [SubscriptionController::class, 'destroy']);
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
    Route::put('/subscriptions/{id}', [SubscriptionController::class, 'update']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/earnings', [TransactionController::class, 'earnings']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::put('/admin/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'destroyUser']);
        Route::get('/admin/creators', [AdminController::class, 'creators']);
        Route::put('/admin/creators/{id}/status', [AdminController::class, 'updateCreator']);
        Route::get('/admin/stats', [AdminController::class, 'stats']);
    });
});


