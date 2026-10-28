<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Models\BoxType;
use App\Models\BoxAllowedItem;
use App\Models\ConfigurableBox;
use App\Models\Item;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Contracts\FileStorageService;

class BoxController extends Controller
{
    public function __construct(
        private readonly FileStorageService $storage
    ) {}

    /* ---------------- BOX TYPES ---------------- */

    public function getBoxTypes()
    {
        return response()->json([
            'success' => true,
            'data' => BoxType::all()
        ]);
    }

    public function storeBoxType(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:box_types,code',
            'family' => 'required|string|max:100',
            'variant' => 'required|string|max:20',
            'material' => 'required|string|max:50',
            'mounting_type' => 'required|string|max:50',
            'ip_rating' => 'required|string|max:20',
            'color' => 'required|string|max:50',
            'width_mm' => 'required|numeric',
            'height_mm' => 'required|numeric',
            'depth_mm' => 'required|numeric',
            'has_overcurrent' => 'boolean',
            'has_earth_leakage' => 'boolean',
            'earth_leakage_rating' => 'nullable|string|max:50',
            'branch_cable_count' => 'numeric|min:1',
            'description' => 'nullable|string',
        ]);

        $boxType = BoxType::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Box type created successfully',
            'data' => $boxType
        ], 201);
    }

    public function deleteBoxType($id)
    {
        $boxType = BoxType::find($id);

        if (!$boxType) {
            return response()->json([
                'success' => false,
                'message' => 'Box type not found'
            ], 404);
        }

        $boxType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Box type deleted successfully'
        ]);
    }

    public function updateBoxType(Request $request, BoxType $boxType)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:box_types,code,' . $boxType->id,
            'family' => 'required|string|max:100',
            'variant' => 'required|string|max:20',
            'material' => 'required|string|max:50',
            'mounting_type' => 'required|string|max:50',
            'ip_rating' => 'required|string|max:20',
            'color' => 'required|string|max:50',
            'width_mm' => 'required|numeric',
            'height_mm' => 'required|numeric',
            'depth_mm' => 'required|numeric',
            'has_overcurrent' => 'boolean',
            'has_earth_leakage' => 'boolean',
            'earth_leakage_rating' => 'nullable|string|max:50',
            'branch_cable_count' => 'numeric|min:1',
            'description' => 'nullable|string',
        ]);

        $boxType->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Box type updated successfully',
            'data' => $boxType
        ]);
    }

    /* ---------------- CONFIGURABLE BOX ---------------- */

    public function getAllConfigurableBoxes()
    {
        return response()->json([
            'success' => true,
            'data' => ConfigurableBox::with('boxType')->get()
        ]);
    }

    public function getConfigurableBox(BoxType $boxType)
    {
        $boxType->load('configurableBoxes.boxType');

        return response()->json([
            'success' => true,
            'box_type' => $boxType->only(['id', 'code', 'family']),
            'data' => $boxType->configurableBoxes
        ]);
    }

    public function attachConfigurableBox(Request $request, BoxType $boxType)
    {
        $validated = $request->validate([
            'configurable_box_id' => 'required|exists:configurable_boxes,id',
        ]);

        $template = ConfigurableBox::findOrFail($validated['configurable_box_id']);

        if ($template->box_type_id) {
            return response()->json([
                'success' => false,
                'message' => 'Template already attached',
            ], 422);
        }

        $template->update([
            'box_type_id' => $boxType->id
        ]);

        ActivityLog::create([
            'type'  => 'template',
            'title' => "Template {$template->code} attached to box type {$boxType->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template attached successfully'
        ]);
    }

    public function getAvailableConfigurableBoxes()
    {
        return response()->json([
            'success' => true,
            'data' => ConfigurableBox::whereNull('box_type_id')->get()
        ]);
    }

    public function getBoxAreas(ConfigurableBox $configurableBox)
    {
        $configurableBox->load('areas');

        return response()->json([
            'success' => true,
            'data' => $configurableBox->areas->map(function ($area) {
                return [
                    'id'         => $area->id,
                    'name'       => $area->name,
                    'width_mm'   => $area->pivot->width_mm,
                    'height_mm'  => $area->pivot->height_mm,
                    'padding_mm' => $area->pivot->padding_mm,
                ];
            }),
        ]);
    }

    public function addConfigurableBox(Request $request)
    {
        $validated = $request->validate([
            'box_type_id'    => 'nullable|exists:box_types,id',
            'code'           => 'required|string|max:255|unique:configurable_boxes,code',
            'max_total_items' => 'nullable|numeric',
            'base_price'     => 'nullable|numeric',
            'notes'          => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'areas'          => 'nullable|array',
            'areas.*.id'     => 'required|exists:areas,id',
            'areas.*.width_mm'   => 'nullable|numeric',
            'areas.*.height_mm'  => 'nullable|numeric',
            'areas.*.padding_mm' => 'nullable|numeric',
        ]);

        $imageUrl      = null;
        $imagePublicId = null;

        if ($request->hasFile('image')) {
            $uploaded      = $this->storage->upload($request->file('image'), 'templates');
            $imageUrl      = $uploaded['url'];
            $imagePublicId = $uploaded['public_id'];
        };

        $configurableBox = ConfigurableBox::create([
            'box_type_id' => $validated['box_type_id'] ?? null,
            'code' => trim($validated['code']),
            'max_total_items' => $validated['max_total_items'] ?? null,
            'base_price' => $validated['base_price'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'preview'        => $imageUrl,
            'preview_public_id'  => $imagePublicId,
        ]);

        // ── Sync areas
        if (!empty($validated['areas'])) {
            $syncData = [];
            foreach ($validated['areas'] as $area) {
                $syncData[$area['id']] = [
                    'width_mm'   => $area['width_mm']   ?? 0,
                    'height_mm'  => $area['height_mm']  ?? 0,
                    'padding_mm' => $area['padding_mm']  ?? 0,
                ];
            }
            $configurableBox->areas()->sync($syncData);
        }

        $boxType = $configurableBox->box_type_id ? BoxType::find($configurableBox->box_type_id) : null;

        if ($configurableBox->box_type_id) {
            ActivityLog::create([
                'type' => 'template',
                'title' => "Template {$configurableBox->code} attached to box type {$boxType->code}",
                'user' => auth('admin')->user()?->name ?? 'System',
            ]);
        };

        return response()->json([
            'success' => true,
            'status' => $configurableBox->box_type_id
                ? 'created_attached'
                : 'created_unattached',

            'message' => $configurableBox->box_type_id
                ? 'Template created and attached to box type'
                : 'Template created without attachment',

            'data' => $configurableBox
        ]);
    }

    public function updateConfigurableBox(Request $request, ConfigurableBox $configurableBox)
    {
        $validated = $request->validate([
            'code'           => 'required|string|max:255|unique:configurable_boxes,code,' . $configurableBox->id,
            'max_total_items' => 'required|numeric',
            'base_price'     => 'required|numeric',
            'notes'          => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'areas'          => 'nullable|array',
            'areas.*.id'     => 'required|exists:areas,id',
            'areas.*.width_mm'   => 'nullable|numeric',
            'areas.*.height_mm'  => 'nullable|numeric',
            'areas.*.padding_mm' => 'nullable|numeric',
        ]);

        if ($request->hasFile('image')) {

            // Delete old image from Cloudinary if one exists
            if ($configurableBox->preview_public_id) {
                $this->storage->delete($configurableBox->preview_public_id);
            }

            $uploaded = $this->storage->upload($request->file('image'), 'templates');

            $validated['preview']       = $uploaded['url'];
            $validated['preview_public_id'] = $uploaded['public_id'];
        }

        $configurableBox->update($validated);

        // ── Sync areas
        if (isset($validated['areas'])) {
            $syncData = [];
            foreach ($validated['areas'] as $area) {
                $syncData[$area['id']] = [
                    'width_mm'   => $area['width_mm']   ?? 0,
                    'height_mm'  => $area['height_mm']  ?? 0,
                    'padding_mm' => $area['padding_mm']  ?? 0,
                ];
            }
            $configurableBox->areas()->sync($syncData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Configurable box updated successfully',
            'data' => $configurableBox
        ]);
    }

    public function removeConfigurableBox(Request $request, BoxType $boxType)
    {
        $validated = $request->validate([
            'configurable_box_id' => 'required|exists:configurable_boxes,id',
        ]);

        $template = ConfigurableBox::findOrFail($validated['configurable_box_id']);

        $template->update([
            'box_type_id' => null
        ]);

        ActivityLog::create([
            'type'  => 'template',
            'title' => "Template {$template->code} detached from box type {$boxType->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template detached successfully'
        ]);
    }

    public function deleteConfigurableBox(Request $request)
    {
        $validated = $request->validate([
            'configurable_box_id' => 'required|exists:configurable_boxes,id',
        ]);

        $box = ConfigurableBox::findOrFail($validated['configurable_box_id']);

        if ($box->preview_public_id) {
            $this->storage->delete($box->preview_public_id);
        };

        $box->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully'
        ]);
    }

    public function getAreas()
    {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Area::all()
        ]);
    }

    public function storeArea(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:areas,name',
        ]);

        $area = \App\Models\Area::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Area created successfully',
            'data'    => $area,
        ], 201);
    }

    /* ---------------- ITEMS ---------------- */

    public function getAllItems()
    {
        return response()->json([
            'success' => true,
            'data' => Item::all()
        ]);
    }

    public function getAllowedItems(int $boxId)
    {
        $box = ConfigurableBox::with(['allowedItems', 'boxType'])->find($boxId);

        if (!$box) {
            return response()->json([
                'success' => false,
                'message' => 'Configurable box not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'template' => [
                'id'              => $box->id,
                'box_type_id'     => $box->box_type_id,
                'box_type_code'   => $box->boxType?->code,
                'box_type_family' => $box->boxType?->family,
                'code'            => $box->code,
            ],
            'data' => $box->allowedItems->map(function ($item) {
                return [
                    'id'           => $item->id,
                    'code'         => $item->code,
                    'name'         => $item->name,
                    'category'     => $item->category,
                    'amperage'     => $item->amperage,
                    'poles'        => $item->poles,
                    'voltage'      => $item->voltage,
                    'price'        => $item->price,
                    'max_quantity' => $item->pivot->max_quantity,
                    'area_id'      => $item->pivot->area_id,
                    'width_mm'     => $item->width_mm,
                    'height_mm'     => $item->height_mm,
                    'depth_mm'     => $item->depth_mm,
                    'preview'      => $item->preview,
                ];
            })
        ]);
    }

    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'configurable_box_id' => 'nullable|exists:configurable_boxes,id',
            'area_id'             => 'nullable|exists:areas,id',
            'code'                => 'required|string|max:255|unique:items,code',
            'name'                => 'required|string|max:255',
            'category'            => 'required|string|max:255',
            'amperage'            => 'nullable|numeric',
            'poles'               => 'nullable|numeric',
            'voltage'             => 'nullable|numeric',
            'price'               => 'nullable|numeric',
            'max_quantity'        => 'nullable|numeric',
            'width_mm'            => 'nullable|numeric',
            'height_mm'           => 'nullable|numeric',
            'depth_mm'            => 'nullable|numeric',
            'image'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $imageUrl      = null;
        $imagePublicId = null;

        if ($request->hasFile('image')) {
            $uploaded      = $this->storage->upload($request->file('image'), 'items');
            $imageUrl      = $uploaded['url'];
            $imagePublicId = $uploaded['public_id'];
        }

        $item = Item::create([
            'code'               => trim($validated['code']),
            'name'               => $validated['name'],
            'category'           => $validated['category'],
            'amperage'           => $validated['amperage'] ?? null,
            'poles'              => $validated['poles'] ?? null,
            'voltage'            => $validated['voltage'] ?? null,
            'price'              => $validated['price'] ?? null,
            'width_mm'  => $validated['width_mm']  ?? null,
            'height_mm' => $validated['height_mm'] ?? null,
            'depth_mm'  => $validated['depth_mm']  ?? null,
            'preview'            => $imageUrl,
            'preview_public_id'  => $imagePublicId,
        ]);

        if (!empty($validated['configurable_box_id'])) {

            BoxAllowedItem::create([
                'configurable_box_id' => $validated['configurable_box_id'],
                'item_id'             => $item->id,
                'area_id'             => $validated['area_id'] ?? null,
                'max_quantity'        => $validated['max_quantity'] ?? 1,
            ]);

            $configurableBox = ConfigurableBox::find($validated['configurable_box_id']);

            ActivityLog::create([
                'type'  => 'item',
                'title' => "Item {$item->name} attached to template {$configurableBox->code}",
                'user'  => auth('admin')->user()?->name ?? 'System',
            ]);

            return response()->json([
                'success' => true,
                'status'  => 'created_attached',
                'message' => 'Item created and linked to configurable box',
                'data'    => $item
            ]);
        }

        return response()->json([
            'success' => true,
            'status'  => 'created_unattached',
            'message' => 'Item created without attachment',
            'data'    => $item
        ]);
    }

    public function getAvailableItems(ConfigurableBox $box)
    {
        $items = Item::whereDoesntHave('configurableBoxes', function ($query) use ($box) {
            $query->where('configurable_boxes.id', $box->id);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function attachItem(Request $request, ConfigurableBox $configurableBox)
    {
        $validated = $request->validate([
            'item_id'      => 'required|exists:items,id',
            'area_id'      => 'nullable|exists:areas,id',
            'max_quantity' => 'required|nullable|numeric',
        ]);

        $configurableBox->allowedItems()->attach($validated['item_id'], [
            'area_id'      => $validated['area_id'] ?? null,
            'max_quantity' => $validated['max_quantity'] ?? 1,
        ]);

        $item = Item::find($validated['item_id']);

        ActivityLog::create([
            'type'  => 'item',
            'title' => "Item {$item->name} attached to template {$configurableBox->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item attached successfully'
        ]);
    }

    public function updateItem(Request $request, Item $item)
    {
        $validated = $request->validate([
            'code'                => 'string|max:255|unique:items,code,' . $item->id,
            'name'                => 'string|max:255',
            'category'            => 'string|max:255',
            'amperage'            => 'nullable|numeric',
            'poles'               => 'nullable|numeric',
            'voltage'             => 'nullable|numeric',
            'price'               => 'nullable|numeric',
            'width_mm'            => 'nullable|numeric',
            'height_mm'           => 'nullable|numeric',
            'depth_mm'            => 'nullable|numeric',
            'image'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'configurable_box_id' => 'nullable|exists:configurable_boxes,id',
            'area_id'             => 'nullable|exists:areas,id',
            'max_quantity'        => 'nullable|numeric',
        ]);

        if ($request->hasFile('image')) {
            if ($item->preview_public_id) {
                $this->storage->delete($item->preview_public_id);
            }
            $uploaded = $this->storage->upload($request->file('image'), 'items');
            $validated['preview']            = $uploaded['url'];
            $validated['preview_public_id']  = $uploaded['public_id'];
        }

        $item->update($validated);

        // Update pivot only if a box context is provided
        if (!empty($validated['configurable_box_id'])) {
            $pivotData = [];

            if (array_key_exists('area_id', $validated)) {
                $pivotData['area_id'] = $validated['area_id'];
            }

            if (!empty($validated['max_quantity'])) {
                $pivotData['max_quantity'] = $validated['max_quantity'];
            }

            if (!empty($pivotData)) {
                $box = ConfigurableBox::find($validated['configurable_box_id']);
                $box->allowedItems()->updateExistingPivot($item->id, $pivotData);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data'    => $item
        ]);
    }

    public function removeItem(Request $request, ConfigurableBox $configurableBox)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
        ]);

        $item = Item::find($validated['item_id']);

        $configurableBox->allowedItems()->detach($validated['item_id']);

        ActivityLog::create([
            'type'  => 'item',
            'title' => "Item {$item->name} detached from template {$configurableBox->code}",
            'user'  => auth('admin')->user()?->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item detached successfully'
        ]);
    }

    public function deleteItem(Item $item)
    {
        if ($item->preview_public_id) {
            $this->storage->delete($item->preview_public_id);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully'
        ]);
    }
}
