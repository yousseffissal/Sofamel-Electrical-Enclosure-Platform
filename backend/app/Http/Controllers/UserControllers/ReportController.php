<?php

namespace App\Http\Controllers\UserControllers;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'issue' => ['required', 'string'],
        ]);

        $report = Report::create($validated);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report'  => $report,
        ], 201);
    }
}