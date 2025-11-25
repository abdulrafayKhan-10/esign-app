<?php

namespace App\Http\Controllers;

use App\Models\Signature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SignatureController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->signatures);
    }

    public function store(Request $request)
    {
        $request->validate([
            'signature_data' => 'required|string', // Expecting base64 string
        ]);

        // Optionally, you could decode and save as an image file here
        // For now, we store the base64 string directly in the DB as requested

        $signature = Signature::create([
            'user_id' => Auth::id(),
            'signature_data' => $request->signature_data,
        ]);

        return response()->json($signature, 201);
    }

    public function destroy($id)
    {
        $signature = Signature::where('user_id', Auth::id())->findOrFail($id);
        $signature->delete();
        return response()->json(['message' => 'Signature deleted']);
    }
}
