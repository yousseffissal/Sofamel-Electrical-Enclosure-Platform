<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Configuration extends Model
{
    protected $fillable = [

        'user_id',

        'order_id',

        'configurable_box_id',

        'quantity',

        'box_price_snapshot',
    ];

    protected $casts = [

        'box_price_snapshot' => 'decimal:2',
    ];

    /**
     * Relations
     */

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function configurableBox(): BelongsTo
    {
        return $this->belongsTo(ConfigurableBox::class);
    }

    public function configurationItems(): HasMany
    {
        return $this->hasMany(ConfigurationItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
