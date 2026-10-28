<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [

        'user_id',
        'status',
        'total_price',
        'phone',
        'address',
        'archived_at'
    ];

    protected $casts = [

        'total_price' => 'decimal:2',
    ];

    /**
     * Relations
     */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function configuration(): HasOne
    {
        return $this->hasOne(Configuration::class);
    }
}
