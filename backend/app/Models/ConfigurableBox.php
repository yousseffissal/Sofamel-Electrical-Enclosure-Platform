<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConfigurableBox extends Model
{
    protected $fillable = [

        'box_type_id',

        'code',

        'max_total_items',

        'base_price',

        'preview',
        'preview_public_id',

        'notes',
    ];

    protected $casts = [

        'base_price' => 'decimal:2',
    ];

    /**
     * Relations
     */

    public function boxType(): BelongsTo
    {
        return $this->belongsTo(BoxType::class);
    }

    public function allowedItems(): BelongsToMany
    {
        return $this->belongsToMany(
            Item::class,
            'box_allowed_items'
        )
            ->withPivot('max_quantity', 'area_id')
            ->withTimestamps();
    }
    
    public function configurations(): HasMany
    {
        return $this->hasMany(Configuration::class);
    }

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(
            Area::class,
            'area_box'
        )
            ->withPivot('width_mm', 'height_mm', 'padding_mm')
            ->withTimestamps();
    }
}
