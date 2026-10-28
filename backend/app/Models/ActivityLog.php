<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'type',
        'title',
        'user',
        'meta',
    ];

    protected $casts = [
    'meta' => 'array',
];
}
