<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Models\Report;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::get();

        return response()->json($reports);
    }
    
    public function destroy(Report $report)
    {
        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
    }
}