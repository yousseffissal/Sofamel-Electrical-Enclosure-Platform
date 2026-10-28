<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Admin;

class AdminObserver
{
    public function created(Admin $admin): void
    {
        ActivityLog::create([
            'type'  => 'admin',
            'title' => "New admin account created: {$admin->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }

    public function updated(Admin $admin): void
    {
        $changes = $admin->getChanges();
        $original = $admin->getOriginal();

        $ignoredFields = ['updated_at', 'last_activity', 'password'];

        $filteredChanges = array_diff_key(
            $changes,
            array_flip($ignoredFields)
        );

        if (empty($filteredChanges)) {
            return;
        }

        $diff = [];

        foreach ($filteredChanges as $field => $newValue) {

            $diff[$field] = [
                'from' => $original[$field] ?? null,
                'to'   => $newValue,
            ];
        }

        ActivityLog::create([
            'type'  => 'admin',
            'title' => "Admin account updated: {$admin->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
            'meta'  => $diff,
        ]);
    }

    public function deleted(Admin $admin): void
    {
        ActivityLog::create([
            'type'  => 'admin',
            'title' => "Admin account deleted: {$admin->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }
}
