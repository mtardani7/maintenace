<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\MaintenanceTicketController;
use App\Http\Controllers\QaMachineController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->post('/admin/users', [AdminUserController::class, 'store']);
Route::middleware('auth:sanctum')->group(function (): void {
	Route::get('/machines', [QaMachineController::class, 'index']);
	Route::get('/plants', [QaMachineController::class, 'plants']);
	Route::get('/qa-dashboard', [QaMachineController::class, 'dashboard']);
	Route::post('/machines', [QaMachineController::class, 'store']);
	Route::put('/machines/{machine}', [QaMachineController::class, 'update']);
	Route::patch('/machines/{machine}', [QaMachineController::class, 'update']);
	Route::delete('/machines/{machine}', [QaMachineController::class, 'destroy']);
	Route::apiResource('incidents', IncidentController::class);
	Route::apiResource('tickets', MaintenanceTicketController::class);
});
