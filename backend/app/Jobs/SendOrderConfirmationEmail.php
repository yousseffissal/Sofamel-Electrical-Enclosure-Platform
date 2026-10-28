<?php

namespace App\Jobs;

use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $orderId
    ) {}

    public function handle(): void
    {
        $order = Order::with([
            'user',
            'configuration.configurableBox.boxType',
            'configuration.configurableBox.areas',
            'configuration.configurationItems.item',
            'configuration.configurationItems.area',
        ])->find($this->orderId);

        if (!$order) {
            return;
        }

        Mail::to($order->user->email)
            ->send(new OrderConfirmationMail($order));
    }
}