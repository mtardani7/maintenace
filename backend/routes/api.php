<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
	Route::get('/csrf-cookie', [AuthController::class, 'csrfCookie']);
	Route::post('/login', [AuthController::class, 'login']);
	Route::middleware('auth')->get('/me', [AuthController::class, 'me']);
	Route::middleware('auth')->post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['web', 'auth'])->post('/admin/users', [AdminUserController::class, 'store']);
