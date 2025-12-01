<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileServingController extends Controller
{
    public function serve($filename)
    {
        if (!Storage::disk('public')->exists($filename)) {
            abort(404);
        }

        return Storage::disk('public')->response($filename, null, [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
