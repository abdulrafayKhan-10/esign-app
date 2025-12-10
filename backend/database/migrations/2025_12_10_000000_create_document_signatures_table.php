<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('document_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->text('signature_data'); // Base64 encoded signature image
            $table->integer('page')->default(1); // Page number where signature is placed
            $table->decimal('x', 8, 6); // Relative X position (0-1)
            $table->decimal('y', 8, 6); // Relative Y position (0-1)
            $table->decimal('w', 8, 6); // Relative width (0-1)
            $table->decimal('h', 8, 6); // Relative height (0-1)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_signatures');
    }
};
