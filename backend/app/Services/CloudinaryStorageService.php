<?php

namespace App\Services;

use App\Contracts\FileStorageService;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;

class CloudinaryStorageService implements FileStorageService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(
            sprintf(
                'cloudinary://%s:%s@%s',
                config('services.cloudinary.api_key'),
                config('services.cloudinary.api_secret'),
                config('services.cloudinary.cloud_name'),
            )
        );

        /* Fix SSL on local Windows — remove this in production
        if (app()->environment('local')) {
            $this->cloudinary->configuration->api->curlOptions = [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ];
        }*/
    }

    public function upload(UploadedFile $file, ?string $folder = null): array
    {
        $options = ['resource_type' => 'image'];

        if ($folder) {
            $options['folder'] = $folder;
        }

        $result = $this->cloudinary
            ->uploadApi()
            ->upload($file->getRealPath(), $options);

        return [
            'url'       => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function delete(string $publicId): void
    {
        $this->cloudinary
            ->uploadApi()
            ->destroy($publicId);
    }
}
