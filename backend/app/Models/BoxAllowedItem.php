<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoxAllowedItem extends Model
{
    protected $table = 'box_allowed_items';

    protected $fillable = [
        'configurable_box_id',
        'item_id',
        'area_id',
        'max_quantity',
    ];

    public function configurableBox(): BelongsTo
    {
        return $this->belongsTo(ConfigurableBox::class);
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