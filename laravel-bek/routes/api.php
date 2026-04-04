<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CreatorController;
use App\Http\Controllers\TierController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;

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

    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::delete('/users/me', [UserController::class, 'destroy']);
});


