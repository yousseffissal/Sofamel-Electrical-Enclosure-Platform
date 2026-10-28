<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\BoxType;

class BoxTypeObserver
{
    public function created(BoxType $box): void
    {
        ActivityLog::create([
            'type'  => 'box',
            'title' => "Box Type created: {$box->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }

    public function updated(BoxType $box): void
    {
        $changes = $box->getChanges();
        $original = $box->getOriginal();

        $diff = [];

        foreach ($changes as $field => $newValue) {
            if ($field === 'updated_at' &&  $field === 'box_type_id') continue;

            $diff[$field] = [
                'from' => $original[$field] ?? null,
                'to'   => $newValue,
            ];
        }

    
        if (empty($diff)) {
            return;
        }

        ActivityLog::create([
            'type'  => 'box',
            'title' => "Box Type updated: {$box->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
            'meta'  => $diff,
        ]);
    }

    public function deleted(BoxType $box): void
    {
        ActivityLog::create([
            'type'  => 'box',
            'title' => "Box Type deleted: {$box->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }
}
