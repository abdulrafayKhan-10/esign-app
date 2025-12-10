<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'signature_data',
        'page',
        'x',
        'y',
        'w',
        'h',
    ];

    protected $casts = [
        'page' => 'integer',
        'x' => 'float',
        'y' => 'float',
        'w' => 'float',
        'h' => 'float',
    ];

    /**
     * Get the document that owns the signature.
     */
    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
