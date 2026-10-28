<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoxType extends Model
{
    protected $fillable = [

        'code',

        'family',
        'variant',

        'material',
        'mounting_type',
        'ip_rating',
        'color',

        'width_mm',
        'height_mm',
        'depth_mm',

        'has_overcurrent',

        'has_earth_leakage',
        'earth_leakage_rating',

        'branch_cable_count',

        'description',
    ];

    protected $casts = [

        'has_overcurrent' => 'boolean',
        'has_earth_leakage' => 'boolean',
        'width_mm' => 'decimal:2',
        'height_mm' =>  'decimal:2',
        'depth_mm' =>  'decimal:2',
    ];

    /**
     * Relations
     */

    public function configurableBoxes(): HasMany
    {
        return $this->hasMany(ConfigurableBox::class);
    }
}