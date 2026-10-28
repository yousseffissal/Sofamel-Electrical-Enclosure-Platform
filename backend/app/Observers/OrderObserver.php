<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Order;

class OrderObserver
{
    public function updated(Order $order): void
    {
        $changes  = $order->getChanges();
        $original = $order->getOriginal();

        // ── Archive
        if (array_key_exists('archived_at', $changes)) {

            $isArchiving = !is_null($changes['archived_at']);

            ActivityLog::create([
                'type'  => $isArchiving ? 'archived' : 'restored',
                'title' => $isArchiving
                    ? "Order archived: #{$order->id}"
                    : "Order restored: #{$order->id}",
                'user'  => auth('admin')->user()?->name ?? 'System',
                'meta'  => [
                    'order_id'    => $order->id,
                    'archived_at' => $changes['archived_at'],
                ],
            ]);
            return;
        }

        // ── Other updates
        $diff = [];

        foreach ($changes as $field => $newValue) {

            if ($field === 'updated_at') {
                continue;
            }

            $diff[$field] = [
                'from' => $original[$field] ?? null,
                'to'   => $newValue,
            ];
        }

        if (empty($diff)) {
            return;
        }

        ActivityLog::create([
            'type'  => 'order',
            'title' => "Order updated: #{$order->id}",
            'user'  => auth('admin')->user()?->name ?? 'System',
            'meta'  => $diff,
        ]);
    }
}
