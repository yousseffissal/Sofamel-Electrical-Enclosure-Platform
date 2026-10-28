<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfigurationItem extends Model
{
    protected $fillable = [

        'configuration_id',

        'item_id',

        'area_id',

        'quantity',

        'y-position',
        'x-position',

        'price_snapshot',
    ];

    protected $casts = [

        'price_snapshot' => 'decimal:2',
        'x-position' => 'decimal:2',
        'y-position' => 'decimal:2',

    ];

    /**
     * Relations
     */

    public function configuration(): BelongsTo
    {
        return $this->belongsTo(Configuration::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

}