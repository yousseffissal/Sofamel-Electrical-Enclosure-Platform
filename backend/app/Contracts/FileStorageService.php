<?php

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

interface FileStorageService
{
    /**
     * @return array{url: string, public_id: string}
     */
    public function upload(UploadedFile $file, ?string $folder = null): array;

    public function delete(string $publicId): void;
}