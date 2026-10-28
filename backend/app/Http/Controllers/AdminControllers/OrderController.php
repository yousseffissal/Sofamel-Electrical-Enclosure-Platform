<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use App\Helpers\PdfImageHelper;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with([
            'user',
            'configuration.configurableBox',
            'configuration.configurationItems.item'
        ])
            ->whereNull('archived_at')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    public function archived()
    {
        $orders = Order::with([
            'user',
            'configuration.configurableBox',
            'configuration.configurationItems.item'
        ])
            ->whereNotNull('archived_at')
            ->latest('archived_at')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    public function show($id)
    {
        $order = Order::with([
            'user',
            'configuration.configurableBox',
            'configuration.configurationItems.item'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }

    public function archive($id)
    {
        $order = Order::whereNull('archived_at')->findOrFail($id);
        $order->update(['archived_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Order archived successfully'
        ]);
    }

    public function unarchive($id)
    {
        $order = Order::whereNotNull('archived_at')->findOrFail($id);
        $order->update(['archived_at' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Order restored successfully'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'order' => $order
        ]);
    }

    public function pdf($id)
    {
        $order = Order::with([
            'user',
            'configuration.configurableBox.boxType',
            'configuration.configurableBox.areas',
            'configuration.configurationItems.item',
            'configuration.configurationItems.area',
        ])->findOrFail($id);

        $logoBase64 = PdfImageHelper::toBase64(public_path('images/logo.png'));

        $boxImageBase64 = PdfImageHelper::toBase64(
            $order->configuration?->configurableBox?->preview ?? null
        );

        $itemImages = [];
        if ($order->configuration) {
            foreach ($order->configuration->configurationItems as $ci) {
                $itemId = $ci->item?->id;
                if ($itemId && !isset($itemImages[$itemId])) {
                    $itemImages[$itemId] = PdfImageHelper::toBase64(
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

        return $pdf->download('SOFAMEL-order-' . $order->id . '.pdf');
    }
}