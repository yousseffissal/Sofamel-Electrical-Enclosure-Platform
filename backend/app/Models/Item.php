<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $fillable = [

        'code',

        'category',

        'name',

        'amperage',
        'poles',
        'voltage',

        'preview',
        'preview_public_id',

        'width_mm',
        'height_mm',
        'depth_mm',
        'padding_mm',

        'price',
    ];

    protected $casts = [

        'price' => 'decimal:2',
        'width_mm' => 'decimal:2',
        'height_mm' =>  'decimal:2',
        'depth_mm' =>  'decimal:2',
        'padding_mm' => 'decimal:2',
    ];

    /**
     * Relations
     */

    public function configurableBoxes(): BelongsToMany
    {
        return $this->belongsToMany(
            ConfigurableBox::class,
            'box_allowed_items'
        )
            ->withPivot('max_quantity', 'area_id')
            ->withTimestamps();
    }

    public function configurationItems(): HasMany
    {
        return $this->hasMany(ConfigurationItem::class);
    }

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(
            Area::class,
            'area_item'
        )
            ->withTimestamps();
    }
}
