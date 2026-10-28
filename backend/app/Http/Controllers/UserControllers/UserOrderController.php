<?php

namespace App\Http\Controllers\UserControllers;

use App\Http\Controllers\Controller;
use App\Models\Order;

use Illuminate\Http\Request;
use App\Models\Configuration;
use App\Models\ConfigurationItem;
use App\Models\ConfigurableBox;
use App\Models\Item;
use App\Helpers\PdfImageHelper;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Jobs\SendOrderConfirmationEmail;

use Illuminate\Support\Facades\DB;

class UserOrderController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([

            'phone' => ['required'],
            'address' => ['required'],

            'configurable_box_id' => ['required'],
            'template_quantity' => ['required', 'integer', 'min:1'],
            'total_price' => ['required'],

            'areas' => ['required', 'array'],
        ]);

        return DB::transaction(function () use ($request) {

            $order = Order::create([

                'user_id' => $request->user()->id,

                'status' => 'pending',

                'total_price' => $request->total_price,

                'phone' => $request->phone,

                'address' => $request->address,

            ]);

            $template = ConfigurableBox::findOrFail(
                $request->configurable_box_id
            );

            $configuration = Configuration::create([

                'user_id' => $request->user()->id,

                'order_id' => $order->id,

                'configurable_box_id' => $template->id,

                'quantity' => $request->template_quantity,

                'box_price_snapshot' => $template->base_price,
            ]);

            foreach ($request->areas as $area) {

                foreach ($area['items'] as $itemData) {

                    $item = Item::findOrFail(
                        $itemData['item_id']
                    );

                    ConfigurationItem::create([

                        'configuration_id' => $configuration->id,

                        'item_id' => $item->id,

                        'area_id' => $area['area_id'],

                        'quantity' => $itemData['quantity'],

                        'price_snapshot' => $item->price,

                        'x-position' => $itemData['x_position'] ?? 0,

                        'y-position' => $itemData['y_position'] ?? 0,
                    ]);
                }
            };
            SendOrderConfirmationEmail::dispatch($order->id);
            return response()->json([
                'message' => 'Order created',
                'order_id' => $order->id,
            ]);
        });
    }

    public function myOrders(Request $request)
    {
        $orders = Order::with([
            'configuration.configurableBox.boxType',
            'configuration.configurationItems.item',
            'configuration.configurationItems.area',
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {

            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->load([
            'configuration.configurableBox.boxType',
            'configuration.configurationItems.item',
            'configuration.configurationItems.area',
        ]);

        return response()->json($order);
    }

    public function downloadPdf($id)
    {
        $order = Order::with([
            'user',
            'configuration.configurableBox.boxType',
            'configuration.configurableBox.areas',
            'configuration.configurationItems.item',
            'configuration.configurationItems.area',
        ])->findOrFail($id);

        // ── Pre-resolve ALL images to base64 via PdfImageHelper
        // PdfImageHelper's static cache deduplicates repeated images automatically.

        $logoBase64 = PdfImageHelper::toBase64(
            public_path('images/logo.png')
        );

        $boxImageBase64 = PdfImageHelper::toBase64(
            $order->configuration?->configurableBox?->preview ?? null
        );

        // Item images keyed by item ID so the blade does: $itemImages[$ci->item->id]
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

        // ── Totals (computed server-side, passed as clean variables)
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
        $pdf->getDomPDF()->set_option('font_dir', storage_path('fonts/'));  
        $pdf->getDomPDF()->set_option('font_cache', storage_path('fonts/')); 

        return $pdf->download('SOFAMEL-order-' . $order->id . '.pdf');
    }
}
