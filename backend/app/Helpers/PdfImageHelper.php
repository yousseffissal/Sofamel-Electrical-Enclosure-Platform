<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PdfImageHelper
{
    /**
     * Convert any image URL or storage path to a base64 data URI.
     * Results are cached in-memory for the duration of the request
     * to avoid re-downloading the same image multiple times.
     *
     * @param  string|null  $url         Remote URL or storage path
     * @param  string       $fallback    What to return if image cannot be loaded
     * @return string                    data:image/...;base64,... or fallback
     */
    public static function toBase64(?string $url, string $fallback = ''): string
    {
        if (empty($url)) {
            return $fallback ?: self::transparentPlaceholder();
        }

        // In-memory cache: survives the whole PDF generation without re-fetching
        static $cache = [];

        if (isset($cache[$url])) {
            return $cache[$url];
        }

        try {
            $imageData = self::fetchImageData($url);

            if (empty($imageData)) {
                Log::warning("[PdfImageHelper] Empty response for: {$url}");
                return $cache[$url] = ($fallback ?: self::transparentPlaceholder());
            }

            $mimeType  = self::detectMimeType($imageData, $url);
            $base64    = base64_encode($imageData);
            $dataUri   = "data:{$mimeType};base64,{$base64}";

            return $cache[$url] = $dataUri;

        } catch (\Throwable $e) {
            Log::warning("[PdfImageHelper] Failed to load image: {$url} — {$e->getMessage()}");
            return $cache[$url] = ($fallback ?: self::transparentPlaceholder());
        }
    }

    /**
     * Fetch raw image bytes from a URL or Laravel Storage path.
     */
    private static function fetchImageData(string $url): string
    {
        // ── Laravel Storage path (e.g. "images/box.jpg" or "public/items/foo.png")
        if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
            $path = ltrim($url, '/');
            if (Storage::exists($path)) {
                return Storage::get($path);
            }
            // Try public disk
            if (Storage::disk('public')->exists($path)) {
                return Storage::disk('public')->get($path);
            }
            // Treat as absolute filesystem path
            if (file_exists($url)) {
                return file_get_contents($url);
            }
            throw new \RuntimeException("Storage path not found: {$url}");
        }

        // ── Remote URL: use cURL for reliability
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 5,
            CURLOPT_TIMEOUT        => 10,          // seconds
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; Laravel-DomPDF/1.0)',
            CURLOPT_HTTPHEADER     => ['Accept: image/*'],
        ]);

        $data     = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException("cURL error: {$error}");
        }

        if ($httpCode !== 200 || $data === false) {
            throw new \RuntimeException("HTTP {$httpCode} for URL: {$url}");
        }

        return $data;
    }

    /**
     * Detect MIME type from raw bytes (magic numbers) with URL extension as fallback.
     */
    private static function detectMimeType(string $data, string $url): string
    {
        // Check magic bytes first — most reliable
        $signatures = [
            "\xFF\xD8\xFF"      => 'image/jpeg',
            "\x89PNG\r\n\x1A\n" => 'image/png',
            'GIF8'              => 'image/gif',
            'RIFF'              => 'image/webp',   // RIFF....WEBP
            "\x00\x00\x01\x00" => 'image/x-icon',
        ];

        foreach ($signatures as $sig => $mime) {
            if (str_starts_with($data, $sig)) {
                return $mime;
            }
        }

        // WebP has WEBP at offset 8
        if (strlen($data) >= 12 && substr($data, 8, 4) === 'WEBP') {
            return 'image/webp';
        }

        // SVG
        if (str_contains(substr($data, 0, 100), '<svg')) {
            return 'image/svg+xml';
        }

        // Fallback: guess from URL extension
        $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
        return match($ext) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png'         => 'image/png',
            'gif'         => 'image/gif',
            'webp'        => 'image/webp',
            'svg'         => 'image/svg+xml',
            default       => 'image/jpeg',   // safe default for DomPDF
        };
    }

    /**
     * A 1×1 transparent PNG as a data URI — used when an image cannot be loaded.
     * DomPDF renders this as invisible rather than breaking the layout.
     */
    public static function transparentPlaceholder(): string
    {
        return 'data:image/png;base64,'
            . 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
}