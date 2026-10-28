<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\ConfigurableBox;

class ConfigurableBoxObserver
{
    public function created(ConfigurableBox $box): void
    {
        ActivityLog::create([
            'type'  => 'template',
            'title' => "Template created: {$box->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }

    public function updated(ConfigurableBox $box): void
    {
        $changes = $box->getChanges();
        $original = $box->getOriginal();

        $diff = [];

        foreach ($changes as $field => $newValue) {
            if ($field === 'updated_at' || $field === 'box_type_id') continue;

            $diff[$field] = [
                'from' => $original[$field] ?? null,
                'to'   => $newValue,
            ];
        }

        if (empty($diff)) {
            return;
        }

        ActivityLog::create([
            'type'  => 'template',
            'title' => "Template updated: {$box->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
            'meta'  => $diff,
        ]);
    }

    public function deleted(ConfigurableBox $box): void
    {
        ActivityLog::create([
            'type'  => 'template',
            'title' => "Template deleted: {$box->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }
}
