<?php

namespace App\Mail;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function build()
    {
        $order = $this->order->load([
            'user',
            'configuration.configurableBox.boxType',
            'configuration.configurableBox.areas',
            'configuration.configurationItems.item',
            'configuration.configurationItems.area',
        ]);

        $logoBase64 = \App\Helpers\PdfImageHelper::toBase64(
            public_path('images/logo.png')
        );

        $logoPath = public_path('images/logo.png');

        $boxImageBase64 = \App\Helpers\PdfImageHelper::toBase64(
            $order->configuration?->configurableBox?->preview ?? null
        );

        $itemImages = [];
        if ($order->configuration) {
            foreach ($order->configuration->configurationItems as $ci) {
                $itemId = $ci->item?->id;
                if ($itemId && !isset($itemImages[$itemId])) {
                    $itemImages[$itemId] = \App\Helpers\PdfImageHelper::toBase64(
                        $ci->item->preview ?? null
                    );
                }
            }
        }

        $itemsTotal = $order->configuration
            ?->configurationItems
            ->sum(fn($ci) => $ci->quantity * ($ci->price_snapshot ?? 0)) ?? 0;

        $boxPrice   = $order->configuration?->box_price_snapshot ?? 0;
        $quantity   = $order->configuration?->quantity ?? 1;
        $unitTotal  = $boxPrice + $itemsTotal;
        $grandTotal = $unitTotal * $quantity;

        $pdf = Pdf::loadView('pdf.order', [
            'order'          => $order,
            'itemsTotal'     => $itemsTotal,
            'unitTotal'      => $unitTotal,
            'grandTotal'     => $grandTotal,
            'boxImageBase64' => $boxImageBase64,
            'itemImages'     => $itemImages,
            'logoBase64'     => $logoBase64,
        ]);

        $pdf->getDomPDF()->set_option('isHtml5ParserEnabled', true);
        $pdf->getDomPDF()->set_option('isPhpEnabled', false);
        $pdf->getDomPDF()->set_option('defaultFont', 'DejaVu Sans');
        $pdf->getDomPDF()->set_option('dpi', 150);
        $pdf->getDomPDF()->set_option('isRemoteEnabled', true);
        $pdf->getDomPDF()->set_option('chroot', public_path());
        $pdf->getDomPDF()->set_option('font_dir', storage_path('fonts/'));
        $pdf->getDomPDF()->set_option('font_cache', storage_path('fonts/'));

        return $this
            ->subject('Your SOFAMEL quotation')
            ->view('emails.order-confirmation', [
                'order'    => $order,
                'logoPath' => $logoPath,
            ])
            ->attachData(
                $pdf->output(),
                'SOFAMEL-Quotation-' . $order->id . '.pdf',
                ['mime' => 'application/pdf']
            );
    }
}