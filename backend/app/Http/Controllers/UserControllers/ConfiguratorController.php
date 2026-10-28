<?php

namespace App\Http\Controllers\UserControllers;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\BoxType;
use App\Models\ConfigurableBox;
use Illuminate\Http\Request;

class ConfiguratorController extends Controller
{

    public function getAllBoxTypes()
    {
        $boxTypes = BoxType::query()
            ->withCount('configurableBoxes')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $boxTypes,
        ]);
    }

    public function getBoxTypeTemplates(BoxType $boxType)
    {
        $templates = $boxType
            ->configurableBoxes()
            ->withCount([
                'areas',
                'allowedItems'
            ])
            ->get();

        return response()->json([
            'success' => true,
            'box_type' => $boxType,
            'data' => $templates,
        ]);
    }

    public function getTemplateAreas(ConfigurableBox $template)
    {
        $areas = $template
            ->areas()
            ->get()
            ->map(function ($area) {

                return [
                    'id' => $area->id,
                    'name' => $area->name,

                    'width_mm' => $area->pivot->width_mm,
                    'height_mm' => $area->pivot->height_mm,
                    'padding_mm' => $area->pivot->padding_mm,
                ];
            });

        return response()->json([
            'success' => true,
            'template' => [
                'id' => $template->id,
                'code' => $template->code,
            ],
            'data' => $areas,
        ]);
    }

    public function getTemplateAreaItems(
        ConfigurableBox $template,
        Area $area
    ) {
        $areaExists = $template
            ->areas()
            ->where('areas.id', $area->id)
            ->exists();

        if (!$areaExists) {
            return response()->json([
                'success' => false,
                'message' => 'Area does not belong to this template'
            ], 404);
        }

        $items = $template
            ->allowedItems()
            ->wherePivot('area_id', $area->id)
            ->get()
            ->map(function ($item) {
                return [
                    'id'           => $item->id,
                    'code'         => $item->code,
                    'name'         => $item->name,
                    'category'     => $item->category,
                    'preview'      => $item->preview,
                    'price'        => $item->price,
                    'amperage'     => $item->amperage,
                    'poles'        => $item->poles,
                    'voltage'      => $item->voltage,
                    'width_mm'     => $item->width_mm,
                    'height_mm'    => $item->height_mm,
                    'depth_mm'     => $item->depth_mm,
                    'padding_mm'   => $item->padding_mm,
                    'max_quantity' => $item->pivot->max_quantity,
                ];
            });

        return response()->json([
            'success'  => true,
            'template' => ['id' => $template->id, 'code' => $template->code],
            'area'     => ['id' => $area->id, 'name' => $area->name],
            'data'     => $items,
        ]);
    }
}
