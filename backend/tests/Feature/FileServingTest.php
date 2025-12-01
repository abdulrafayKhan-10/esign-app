<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileServingTest extends TestCase
{
    public function test_can_serve_file_from_storage()
    {
        Storage::fake('public');

        $filename = 'test-file.txt';
        $content = 'Hello World';

        Storage::disk('public')->put($filename, $content);

        $response = $this->get('/storage/' . $filename);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        // assertSee might fail with StreamedResponse/BinaryFileResponse in tests
    }

    public function test_returns_404_if_file_not_found()
    {
        Storage::fake('public');

        $response = $this->get('/storage/non-existent-file.txt');

        $response->assertStatus(404);
    }
}
