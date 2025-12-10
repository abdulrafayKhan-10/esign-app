<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Signature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Fpdi;

class DocumentController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->documents);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx|max:5120', // 5MB max
        ]);

        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'user_id' => Auth::id(),
            'title' => $request->file('file')->getClientOriginalName(),
            'original_file_path' => $path,
            'status' => 'pending',
        ]);

        return response()->json($document, 201);
    }

    public function sign(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info("Sign request received for doc ID: $id");
        
        $request->validate([
            'signature_id' => 'required|exists:signatures,id',
            'page' => 'integer|min:1',
            'x' => 'numeric',
            'y' => 'numeric',
            'w' => 'numeric',
            'h' => 'numeric',
        ]);

        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);
            $signature = Signature::where('user_id', Auth::id())->findOrFail($request->signature_id);

            // Path to original file
            $originalPath = storage_path('app/public/' . $document->original_file_path);
            \Illuminate\Support\Facades\Log::info("Original path: $originalPath");
            
            if (!file_exists($originalPath)) {
                \Illuminate\Support\Facades\Log::error("File not found at $originalPath");
                return response()->json(['message' => 'Original file not found'], 404);
            }

            // Initialize FPDI
            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($originalPath);
            \Illuminate\Support\Facades\Log::info("FPDI initialized, page count: $pageCount");

            // Import pages
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $pdf->AddPage();
                $pdf->useTemplate($templateId);

                // Apply signature on the specified page
                if ($pageNo == ($request->page ?? 1)) {
                    \Illuminate\Support\Facades\Log::info("Signing page $pageNo");
                    
                    // Convert base64 signature to temporary image file
                    $sigData = $signature->signature_data;
                    // Remove header if present (e.g., "data:image/png;base64,")
                    if (preg_match('/^data:image\/(\w+);base64,/', $sigData, $type)) {
                        $sigData = substr($sigData, strpos($sigData, ',') + 1);
                        $type = strtolower($type[1]); // jpg, png, gif
                        
                        if (!in_array($type, [ 'jpg', 'jpeg', 'png', 'gif' ])) {
                            return response()->json(['message' => 'Invalid image type'], 422);
                        }
                    } else {
                         return response()->json(['message' => 'Invalid signature data'], 422);
                    }

                    $sigData = base64_decode($sigData);
                    
                    // Use storage path for temp file to avoid permission issues
                    $tempSigPath = storage_path('app/public/temp_sig_' . uniqid() . '.' . $type);
                    file_put_contents($tempSigPath, $sigData);
                    \Illuminate\Support\Facades\Log::info("Temp signature saved to $tempSigPath");

                    // Get PDF page size
                    $size = $pdf->getTemplateSize($templateId);
                    $pdfWidth = $size['width'];
                    $pdfHeight = $size['height'];

                    // Calculate absolute coordinates from relative (0-1) values
                    // If values are > 1, assume they are legacy absolute pixels and use them directly (fallback)
                    $reqX = (float)($request->x ?? 0);
                    $reqY = (float)($request->y ?? 0);
                    $reqW = (float)($request->w ?? 0.2); // Default 20% width
                    $reqH = (float)($request->h ?? 0.05); // Default 5% height

                    if ($reqX <= 1 && $reqY <= 1 && $reqW <= 1) {
                        $x = $reqX * $pdfWidth;
                        $y = $reqY * $pdfHeight;
                        $width = $reqW * $pdfWidth;
                        $height = $reqH * $pdfHeight;
                    } else {
                        // Fallback for legacy absolute values (though frontend should now send relative)
                        $x = $reqX;
                        $y = $reqY;
                        $width = $reqW;
                        $height = $reqH;
                    }

                    \Illuminate\Support\Facades\Log::info("Placing image at $x, $y with size $width x $height (Page size: $pdfWidth x $pdfHeight)");
                    
                    $pdf->Image($tempSigPath, $x, $y, $width, $height);
                    
                    if (file_exists($tempSigPath)) {
                        unlink($tempSigPath);
                    }
                }
            }

            // Save signed PDF
            $signedFileName = 'signed_' . basename($document->original_file_path);
            $signedPath = 'documents/' . $signedFileName;
            $fullSignedPath = storage_path('app/public/' . $signedPath);
            
            $pdf->Output($fullSignedPath, 'F');
            \Illuminate\Support\Facades\Log::info("Signed PDF saved to $fullSignedPath");

            // Update document record
            $document->update([
                'signed_file_path' => $signedPath,
                'status' => 'signed',
            ]);

            return response()->json($document);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Signing Error: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to sign document: ' . $e->getMessage()], 500);
        }
    }

    public function download($id)
    {
        $document = Document::where('user_id', Auth::id())->findOrFail($id);

        if ($document->status !== 'signed' || !$document->signed_file_path) {
            return response()->json(['message' => 'Document not signed yet'], 400);
        }

        return Storage::disk('public')->download($document->signed_file_path);
    }

    public function destroy($id)
    {
        $document = Document::where('user_id', Auth::id())->findOrFail($id);

        // Delete files
        if ($document->original_file_path) {
            Storage::disk('public')->delete($document->original_file_path);
        }
        if ($document->signed_file_path) {
            Storage::disk('public')->delete($document->signed_file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }


    // Authenticated User Multi-Signature Methods

    public function addSignature(Request $request, $id)
    {
        $request->validate([
            'signature_data' => 'required|string',
            'page' => 'required|integer|min:1',
            'x' => 'required|numeric|min:0|max:1',
            'y' => 'required|numeric|min:0|max:1',
            'w' => 'required|numeric|min:0|max:1',
            'h' => 'required|numeric|min:0|max:1',
        ]);

        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);

            $signature = \App\Models\DocumentSignature::create([
                'document_id' => $document->id,
                'signature_data' => $request->signature_data,
                'page' => $request->page,
                'x' => $request->x,
                'y' => $request->y,
                'w' => $request->w,
                'h' => $request->h,
            ]);

            return response()->json($signature, 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Add Signature Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to add signature'], 500);
        }
    }

    public function deleteSignaturePlace(Request $request, $id, $signatureId)
    {
        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);
            $signature = \App\Models\DocumentSignature::where('document_id', $document->id)
                ->findOrFail($signatureId);

            $signature->delete();

            return response()->json(['message' => 'Signature deleted successfully']);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Delete Signature Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete signature'], 500);
        }
    }

    public function duplicateSignature(Request $request, $id, $signatureId)
    {
        $request->validate([
            'x' => 'numeric|min:0|max:1',
            'y' => 'numeric|min:0|max:1',
        ]);

        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);
            $originalSignature = \App\Models\DocumentSignature::where('document_id', $document->id)
                ->findOrFail($signatureId);

            $newSignature = \App\Models\DocumentSignature::create([
                'document_id' => $document->id,
                'signature_data' => $originalSignature->signature_data,
                'page' => $originalSignature->page,
                'x' => $request->x ?? min(1.0, $originalSignature->x + 0.1),
                'y' => $request->y ?? min(1.0, $originalSignature->y + 0.1),
                'w' => $originalSignature->w,
                'h' => $originalSignature->h,
            ]);

            return response()->json($newSignature, 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Duplicate Signature Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to duplicate signature'], 500);
        }
    }

    public function applyToAllPages(Request $request, $id, $signatureId)
    {
        $request->validate([
            'num_pages' => 'required|integer|min:1',
        ]);

        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);
            $originalSignature = \App\Models\DocumentSignature::where('document_id', $document->id)
                ->findOrFail($signatureId);

            $createdSignatures = [];
            
            for ($page = 1; $page <= $request->num_pages; $page++) {
                if ($page == $originalSignature->page) {
                    continue;
                }

                $newSignature = \App\Models\DocumentSignature::create([
                    'document_id' => $document->id,
                    'signature_data' => $originalSignature->signature_data,
                    'page' => $page,
                    'x' => $originalSignature->x,
                    'y' => $originalSignature->y,
                    'w' => $originalSignature->w,
                    'h' => $originalSignature->h,
                ]);

                $createdSignatures[] = $newSignature;
            }

            return response()->json([
                'message' => 'Signature applied to all pages',
                'signatures' => $createdSignatures
            ], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Apply To All Pages Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to apply to all pages'], 500);
        }
    }

    public function finalize(Request $request, $id)
    {
        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);
            
            $signatures = \App\Models\DocumentSignature::where('document_id', $document->id)->get();

            if ($signatures->isEmpty()) {
                return response()->json(['message' => 'No signatures to apply'], 400);
            }

            $originalPath = storage_path('app/public/' . $document->original_file_path);
            
            if (!file_exists($originalPath)) {
                return response()->json(['message' => 'Original file not found'], 404);
            }

            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($originalPath);

            $signaturesByPage = $signatures->groupBy('page');

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $pdf->AddPage();
                $pdf->useTemplate($templateId);

                if (isset($signaturesByPage[$pageNo])) {
                    $size = $pdf->getTemplateSize($templateId);
                    $pdfWidth = $size['width'];
                    $pdfHeight = $size['height'];

                    foreach ($signaturesByPage[$pageNo] as $sig) {
                        try {
                            $sigData = $sig->signature_data;
                            if (preg_match('/^data:image\/(\w+);base64,/', $sigData, $type)) {
                                $sigData = substr($sigData, strpos($sigData, ',') + 1);
                                $type = strtolower($type[1]);
                            } else {
                                $type = 'png';
                            }

                            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) $type = 'png';

                            $decodedData = base64_decode($sigData);
                            $tempSigPath = storage_path('app/public/temp_sig_' . uniqid() . '.' . $type);
                            
                            file_put_contents($tempSigPath, $decodedData);

                            $x = $sig->x * $pdfWidth;
                            $y = $sig->y * $pdfHeight;
                            $width = $sig->w * $pdfWidth;
                            $height = $sig->h * $pdfHeight;
                            
                            $pdf->Image($tempSigPath, $x, $y, $width, $height);
                            
                            if (file_exists($tempSigPath)) {
                                unlink($tempSigPath);
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error("Error applying signature: " . $e->getMessage());
                        }
                    }
                }
            }

            $signedFileName = 'signed_' . basename($document->original_file_path);
            $signedPath = 'documents/' . $signedFileName;
            $fullSignedPath = storage_path('app/public/' . $signedPath);
            
            $directory = dirname($fullSignedPath);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $pdf->Output($fullSignedPath, 'F');

            $document->update([
                'signed_file_path' => $signedPath,
                'status' => 'signed',
            ]);

            return response()->json([
                'message' => 'Document finalized successfully',
                'document' => $document
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Finalize Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to finalize document'], 500);
        }
    }

    public function getSignatures(Request $request, $id)
    {
        try {
            $document = Document::where('user_id', Auth::id())->findOrFail($id);
            $signatures = \App\Models\DocumentSignature::where('document_id', $document->id)->get();
            return response()->json($signatures);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch signatures'], 500);
        }
    }

    // Guest Methods

    public function guestUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx|max:5120',
            'guest_id' => 'required|string',
        ]);

        $ip = $request->ip();

        // Check if IP is whitelisted (belongs to a registered user)
        $isWhitelisted = \App\Models\User::where('last_ip_address', $ip)->exists();

        if (!$isWhitelisted) {
            $guestUsage = \App\Models\GuestUsage::firstOrCreate(
                ['ip_address' => $ip],
                ['usage_count' => 0]
            );

            if ($guestUsage->usage_count >= 5) {
                return response()->json([
                    'message' => 'Guest limit reached. Please create an account to continue.',
                    'limit_reached' => true
                ], 403);
            }

            $guestUsage->increment('usage_count');
        }

        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'user_id' => null,
            'guest_id' => $request->guest_id,
            'title' => $request->file('file')->getClientOriginalName(),
            'original_file_path' => $path,
            'status' => 'pending',
        ]);

        return response()->json($document, 201);
    }

    public function guestSign(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info("Guest sign request received for doc ID: $id");
        
        $request->validate([
            'guest_id' => 'required|string',
            'signature_data' => 'required|string',
            'page' => 'integer|min:1',
            'x' => 'numeric',
            'y' => 'numeric',
            'w' => 'numeric',
            'h' => 'numeric',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);

            // Path to original file
            $originalPath = storage_path('app/public/' . $document->original_file_path);
            
            if (!file_exists($originalPath)) {
                return response()->json(['message' => 'Original file not found'], 404);
            }

            // Initialize FPDI
            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($originalPath);

            // Import pages
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $pdf->AddPage();
                $pdf->useTemplate($templateId);

                // Apply signature on the specified page
                if ($pageNo == ($request->page ?? 1)) {
                    // Convert base64 signature to temporary image file
                    $sigData = $request->signature_data;
                    // Remove header if present
                    if (preg_match('/^data:image\/(\w+);base64,/', $sigData, $type)) {
                        $sigData = substr($sigData, strpos($sigData, ',') + 1);
                        $type = strtolower($type[1]);
                    } else {
                        // Default to png if no header
                        $type = 'png';
                    }

                    $sigData = base64_decode($sigData);
                    $tempSigPath = storage_path('app/public/temp_guest_sig_' . uniqid() . '.' . $type);
                    file_put_contents($tempSigPath, $sigData);

                    // Get PDF page size
                    $size = $pdf->getTemplateSize($templateId);
                    $pdfWidth = $size['width'];
                    $pdfHeight = $size['height'];

                    // Calculate coordinates
                    $reqX = (float)($request->x ?? 0);
                    $reqY = (float)($request->y ?? 0);
                    $reqW = (float)($request->w ?? 0.2);
                    $reqH = (float)($request->h ?? 0.05);

                    if ($reqX <= 1 && $reqY <= 1 && $reqW <= 1) {
                        $x = $reqX * $pdfWidth;
                        $y = $reqY * $pdfHeight;
                        $width = $reqW * $pdfWidth;
                        $height = $reqH * $pdfHeight;
                    } else {
                        $x = $reqX;
                        $y = $reqY;
                        $width = $reqW;
                        $height = $reqH;
                    }
                    
                    $pdf->Image($tempSigPath, $x, $y, $width, $height);
                    
                    if (file_exists($tempSigPath)) {
                        unlink($tempSigPath);
                    }
                }
            }

            // Save signed PDF
            $signedFileName = 'signed_' . basename($document->original_file_path);
            $signedPath = 'documents/' . $signedFileName;
            $fullSignedPath = storage_path('app/public/' . $signedPath);
            
            $pdf->Output($fullSignedPath, 'F');

            // Update document record
            $document->update([
                'signed_file_path' => $signedPath,
                'status' => 'signed',
            ]);

            return response()->json($document);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Signing Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to sign document: ' . $e->getMessage()], 500);
        }
    }

    public function guestGet(Request $request, $id)
    {
        $request->validate([
            'guest_id' => 'required|string',
        ]);

        $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);

        return response()->json($document);
    }

    public function guestDownload(Request $request, $id)
    {
        $request->validate([
            'guest_id' => 'required|string',
        ]);

        $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);

        if ($document->status !== 'signed' || !$document->signed_file_path) {
            return response()->json(['message' => 'Document not signed yet'], 400);
        }

        return Storage::disk('public')->download($document->signed_file_path);
    }

    /**
     * Add a signature placement to a document (Guest)
     */
    public function guestAddSignature(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info("Guest add signature request for doc ID: $id");
        
        $request->validate([
            'guest_id' => 'required|string',
            'signature_data' => 'required|string',
            'page' => 'required|integer|min:1',
            'x' => 'required|numeric|min:0|max:1',
            'y' => 'required|numeric|min:0|max:1',
            'w' => 'required|numeric|min:0|max:1',
            'h' => 'required|numeric|min:0|max:1',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);

            $signature = \App\Models\DocumentSignature::create([
                'document_id' => $document->id,
                'signature_data' => $request->signature_data,
                'page' => $request->page,
                'x' => $request->x,
                'y' => $request->y,
                'w' => $request->w,
                'h' => $request->h,
            ]);

            \Illuminate\Support\Facades\Log::info("Signature added successfully: " . $signature->id);

            return response()->json($signature, 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Add Signature Error: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to add signature: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a signature placement (Guest)
     */
    public function guestDeleteSignature(Request $request, $id, $signatureId)
    {
        $request->validate([
            'guest_id' => 'required|string',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);
            $signature = \App\Models\DocumentSignature::where('document_id', $document->id)
                ->findOrFail($signatureId);

            $signature->delete();

            return response()->json(['message' => 'Signature deleted successfully']);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Delete Signature Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete signature: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Duplicate a signature placement (Guest)
     */
    public function guestDuplicateSignature(Request $request, $id, $signatureId)
    {
        $request->validate([
            'guest_id' => 'required|string',
            'x' => 'numeric|min:0|max:1',
            'y' => 'numeric|min:0|max:1',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);
            $originalSignature = \App\Models\DocumentSignature::where('document_id', $document->id)
                ->findOrFail($signatureId);

            // Create duplicate with new position or offset from original
            $newSignature = \App\Models\DocumentSignature::create([
                'document_id' => $document->id,
                'signature_data' => $originalSignature->signature_data,
                'page' => $originalSignature->page,
                'x' => $request->x ?? min(1.0, $originalSignature->x + 0.1),
                'y' => $request->y ?? min(1.0, $originalSignature->y + 0.1),
                'w' => $originalSignature->w,
                'h' => $originalSignature->h,
            ]);

            return response()->json($newSignature, 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Duplicate Signature Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to duplicate signature: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Apply signature to all pages (Guest)
     */
    public function guestApplyToAllPages(Request $request, $id, $signatureId)
    {
        $request->validate([
            'guest_id' => 'required|string',
            'num_pages' => 'required|integer|min:1',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);
            $originalSignature = \App\Models\DocumentSignature::where('document_id', $document->id)
                ->findOrFail($signatureId);

            $createdSignatures = [];
            
            // Apply to all pages except the one that already has this signature
            for ($page = 1; $page <= $request->num_pages; $page++) {
                if ($page == $originalSignature->page) {
                    continue; // Skip the page that already has this signature
                }

                $newSignature = \App\Models\DocumentSignature::create([
                    'document_id' => $document->id,
                    'signature_data' => $originalSignature->signature_data,
                    'page' => $page,
                    'x' => $originalSignature->x,
                    'y' => $originalSignature->y,
                    'w' => $originalSignature->w,
                    'h' => $originalSignature->h,
                ]);

                $createdSignatures[] = $newSignature;
            }

            return response()->json([
                'message' => 'Signature applied to all pages',
                'signatures' => $createdSignatures
            ], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Apply To All Pages Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to apply signature to all pages: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Finalize document with all signature placements (Guest)
     */
    public function guestFinalize(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info("Guest finalize request for doc ID: $id");
        
        $request->validate([
            'guest_id' => 'required|string',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);
            
            // Get all signature placements for this document
            $signatures = \App\Models\DocumentSignature::where('document_id', $document->id)->get();

            if ($signatures->isEmpty()) {
                return response()->json(['message' => 'No signatures to apply'], 400);
            }

            // Path to original file
            $originalPath = storage_path('app/public/' . $document->original_file_path);
            \Illuminate\Support\Facades\Log::info("Original path: $originalPath");
            
            if (!file_exists($originalPath)) {
                \Illuminate\Support\Facades\Log::error("File not found at $originalPath");
                return response()->json(['message' => 'Original file not found'], 404);
            }

            // Check file permissions
            if (!is_readable($originalPath)) {
                \Illuminate\Support\Facades\Log::error("File not readable at $originalPath");
                return response()->json(['message' => 'Cannot read original file'], 500);
            }

            // Initialize FPDI
            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($originalPath);
            \Illuminate\Support\Facades\Log::info("FPDI initialized, page count: $pageCount");

            // Group signatures by page for efficient processing
            $signaturesByPage = $signatures->groupBy('page');

            // Import and process each page
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $pdf->AddPage();
                $pdf->useTemplate($templateId);

                // Apply signatures for this page
                if (isset($signaturesByPage[$pageNo])) {
                    $size = $pdf->getTemplateSize($templateId);
                    $pdfWidth = $size['width'];
                    $pdfHeight = $size['height'];

                    foreach ($signaturesByPage[$pageNo] as $sig) {
                        try {
                            // Convert base64 signature to temporary image file
                            $sigData = $sig->signature_data;
                            
                            // Remove header if present
                            if (preg_match('/^data:image\/(\w+);base64,/', $sigData, $type)) {
                                $sigData = substr($sigData, strpos($sigData, ',') + 1);
                                $type = strtolower($type[1]);
                            } else {
                                $type = 'png';
                            }

                            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                                \Illuminate\Support\Facades\Log::warning("Invalid image type: $type, defaulting to png");
                                $type = 'png';
                            }

                            $decodedData = base64_decode($sigData);
                            if ($decodedData === false) {
                                \Illuminate\Support\Facades\Log::error("Failed to decode signature data for signature ID: " . $sig->id);
                                continue;
                            }

                            $tempSigPath = storage_path('app/public/temp_guest_sig_' . uniqid() . '.' . $type);
                            
                            if (file_put_contents($tempSigPath, $decodedData) === false) {
                                \Illuminate\Support\Facades\Log::error("Failed to write temp signature file: $tempSigPath");
                                continue;
                            }

                            \Illuminate\Support\Facades\Log::info("Temp signature saved to $tempSigPath");

                            // Calculate absolute coordinates from relative values
                            $x = $sig->x * $pdfWidth;
                            $y = $sig->y * $pdfHeight;
                            $width = $sig->w * $pdfWidth;
                            $height = $sig->h * $pdfHeight;

                            \Illuminate\Support\Facades\Log::info("Placing signature on page $pageNo at ($x, $y) with size ($width x $height)");
                            
                            $pdf->Image($tempSigPath, $x, $y, $width, $height);
                            
                            // Clean up temp file
                            if (file_exists($tempSigPath)) {
                                unlink($tempSigPath);
                            }

                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error("Error applying signature ID {$sig->id}: " . $e->getMessage());
                            // Continue with other signatures even if one fails
                        }
                    }
                }
            }

            // Save signed PDF
            $signedFileName = 'signed_' . basename($document->original_file_path);
            $signedPath = 'documents/' . $signedFileName;
            $fullSignedPath = storage_path('app/public/' . $signedPath);
            
            // Ensure directory exists
            $directory = dirname($fullSignedPath);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $pdf->Output($fullSignedPath, 'F');
            \Illuminate\Support\Facades\Log::info("Signed PDF saved to $fullSignedPath");

            // Update document record
            $document->update([
                'signed_file_path' => $signedPath,
                'status' => 'signed',
            ]);

            return response()->json([
                'message' => 'Document finalized successfully',
                'document' => $document
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Finalize Error: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to finalize document: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get all signature placements for a document (Guest)
     */
    public function guestGetSignatures(Request $request, $id)
    {
        $request->validate([
            'guest_id' => 'required|string',
        ]);

        try {
            $document = Document::where('guest_id', $request->guest_id)->findOrFail($id);
            $signatures = \App\Models\DocumentSignature::where('document_id', $document->id)->get();

            return response()->json($signatures);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Guest Get Signatures Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to get signatures: ' . $e->getMessage()], 500);
        }
    }
}

