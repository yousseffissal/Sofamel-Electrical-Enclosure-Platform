<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    protected $fillable = [
        'name',
        'width_mm',
        'height_mm',
        'padding_mm',
    ];

    protected $casts = [
        'width_mm' => 'decimal:2',
        'height_mm' =>  'decimal:2',
        'padding_mm' =>  'decimal:2',
    ];

    /**
     * Relations
     */

    public function ConfigurableBoxes(): BelongsToMany
    {
        return $this->belongsToMany(
            ConfigurableBox::class,
            'area_box'
        )
            ->withPivot('width_mm', 'height_mm', 'padding_mm')
            ->withTimestamps();
    }

    public function Item(): BelongsToMany
    {
        return $this->belongsToMany(
            Item::class,
            'area_item'
        )
            ->withTimestamps();
    }
}
