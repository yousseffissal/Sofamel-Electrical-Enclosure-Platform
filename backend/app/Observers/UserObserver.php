<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\User;

class UserObserver
{
    public function deleted(User $user): void
    {
        ActivityLog::create([
            'type'  => 'user',
            'title' => "User account deleted: {$user->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }
}