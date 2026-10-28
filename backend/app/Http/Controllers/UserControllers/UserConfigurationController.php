<?php

namespace App\Http\Controllers\UserControllers;

use App\Http\Controllers\Controller;
use App\Models\ConfigurableBox;
use App\Models\Configuration;
use App\Models\ConfigurationItem;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendOrderConfirmationEmail;

class UserConfigurationController extends Controller
{
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {

            $template = ConfigurableBox::findOrFail(
                $request->configurable_box_id
            );

            $configuration = Configuration::create([

                'user_id' => $request->user()->id,

                'order_id' => null,

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
            }

            return response()->json([
                'message' => 'Saved',
                'id' => $configuration->id,
            ]);
        });
    }

    public function index(Request $request)
    {
        return Configuration::with([
            'configurableBox.boxType',
            'configurationItems.item',
            'configurationItems.area',
        ])
            ->where('user_id', $request->user()->id)
            ->whereNull('order_id')
            ->latest()
            ->get();
    }

    public function destroy(
        Request $request,
        Configuration $configuration
    ) {
        if (
            $configuration->user_id !==
            $request->user()->id
        ) {
            abort(403);
        }

        $configuration->delete();

        return response()->json([
            'message' => 'Deleted'
        ]);
    }

    public function checkout(
        Request $request,
        Configuration $configuration
    ) {
        if (
            $configuration->user_id !==
            $request->user()->id
        ) {
            abort(403);
        }

        if ($configuration->order_id) {

            return response()->json([
                'message' => 'Already ordered'
            ], 422);
        }

        $totalPrice = 0;

        foreach ($configuration->configurationItems as $item) {

            $totalPrice +=
                $item->price_snapshot *
                $item->quantity;
        }

        $totalPrice += $configuration->box_price_snapshot;

        $totalPrice *= $configuration->quantity;

        $order = \App\Models\Order::create([

            'user_id' => $request->user()->id,

            'status' => 'pending',

            'phone' => $request->phone,

            'address' => $request->address,

            'total_price' => $totalPrice,
        ]);

        $configuration->update([
            'order_id' => $order->id
        ]);

        SendOrderConfirmationEmail::dispatch($order->id);

        return response()->json([
            'message' => 'Order created',
            'order_id' => $order->id,
        ]);
    }


}
