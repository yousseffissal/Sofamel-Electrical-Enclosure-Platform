<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Item;

class ItemObserver
{
    public function created(Item $item): void
    {
        ActivityLog::create([
            'type'  => 'item',
            'title' => "New item added: {$item->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }

    public function deleted(Item $item): void
    {
        ActivityLog::create([
            'type'  => 'item',
            'title' => "Item deleted: {$item->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);
    }

    public function updated(Item $item): void
    {
        $changes = $item->getChanges();
        $original = $item->getOriginal();

        $diff = [];

        foreach ($changes as $field => $newValue) {
            if ($field === 'updated_at') continue;

            $diff[$field] = [
                'from' => $original[$field] ?? null,
                'to'   => $newValue,
            ];
        }

        if (empty($diff)) {
            return;
        }

        ActivityLog::create([
            'type'  => 'item',
            'title' => "Item updated: {$item->name}",
            'user'  => auth('admin')->user()?->name ?? 'System',
            'meta'  => $diff,
        ]);
    }
}
