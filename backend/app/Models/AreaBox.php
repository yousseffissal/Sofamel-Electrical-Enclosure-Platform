<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoxAllowedItem extends Model
{
    protected $table = 'area_box';

    protected $fillable = [

        'configurable_box_id',
        'area_id',
        'width_mm',
        'height_mm',
        'padding_mm'
    ];

    /**
     * Relations
     */

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function configurableBox(): BelongsTo
    {
        return $this->belongsTo(ConfigurableBox::class);
    }
}
