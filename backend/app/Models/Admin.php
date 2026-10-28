<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'pictureURL',
        'gender',
        'imagePublicId',
        'level_id',
        'last_activity',
    ];

    /**
     * The attributes that should be hidden.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_activity' => 'datetime',
        ];
    }

    /**
     * Get the level that the admin belongs to.
     */
    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function receivesBroadcastNotificationsOn()
    {
        return 'admins.' . $this->id;
    }
}
