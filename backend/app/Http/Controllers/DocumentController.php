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

    // Guest Methods

    public function guestUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx|max:5120',
            'guest_id' => 'required|string',
        ]);

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
}
