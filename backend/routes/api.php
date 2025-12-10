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
Route::post('/guest/documents/{id}/sign', [DocumentController::class, 'guestSign']); // Legacy - kept for backward compatibility
Route::get('/guest/documents/{id}/download', [DocumentController::class, 'guestDownload']);

// New Multi-Signature Routes (Guest)
Route::post('/guest/documents/{id}/add-signature', [DocumentController::class, 'guestAddSignature']);
Route::get('/guest/documents/{id}/signatures', [DocumentController::class, 'guestGetSignatures']);
Route::delete('/guest/documents/{id}/signatures/{signatureId}', [DocumentController::class, 'guestDeleteSignature']);
Route::post('/guest/documents/{id}/signatures/{signatureId}/duplicate', [DocumentController::class, 'guestDuplicateSignature']);
Route::post('/guest/documents/{id}/signatures/{signatureId}/apply-all', [DocumentController::class, 'guestApplyToAllPages']);
Route::post('/guest/documents/{id}/finalize', [DocumentController::class, 'guestFinalize']);


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
    Route::post('/documents/{id}/sign', [DocumentController::class, 'sign']); // Legacy
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);

    // Authenticated Multi-Signature Routes
    Route::post('/documents/{id}/add-signature', [DocumentController::class, 'addSignature']);
    Route::get('/documents/{id}/signatures', [DocumentController::class, 'getSignatures']);
    Route::delete('/documents/{id}/signatures/{signatureId}', [DocumentController::class, 'deleteSignaturePlace']);
    Route::post('/documents/{id}/signatures/{signatureId}/duplicate', [DocumentController::class, 'duplicateSignature']);
    Route::post('/documents/{id}/signatures/{signatureId}/apply-all', [DocumentController::class, 'applyToAllPages']);
    Route::put('/documents/{id}/signatures/{signatureId}', [DocumentController::class, 'updateSignature']); // New Update Route
    Route::post('/documents/{id}/finalize', [DocumentController::class, 'finalize']);
});
