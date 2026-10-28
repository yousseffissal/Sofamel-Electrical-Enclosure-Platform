<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = [
        'name',
    ];

    public function admins()
    {
        return $this->hasMany(Admin::class);
    }
}
