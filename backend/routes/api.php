<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'store']);

// Guest Routes
Route::post('/guest/documents/upload', [DocumentController::class, 'guestUpload']);
Route::get('/guest/documents/{id}', [DocumentController::class, 'guestGet']);
Route::post('/guest/documents/{id}/sign', [DocumentController::class, 'guestSign']);
Route::get('/guest/documents/{id}/download', [DocumentController::class, 'guestDownload']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // User Info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Signatures
    Route::get('/signatures', [SignatureController::class, 'index']);
    Route::post('/signatures', [SignatureController::class, 'store']);
    Route::delete('/signatures/{id}', [SignatureController::class, 'destroy']);

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    Route::post('/documents/{id}/sign', [DocumentController::class, 'sign']);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
});
