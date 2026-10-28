<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Admin;
use App\Models\BoxType;
use App\Models\ConfigurableBox;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use App\Services\SystemHealthService;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __construct(
        private readonly SystemHealthService $health
    ) {}

    public function getOverview()
    {
        /* ============================================================
         *  A) GLOBAL COUNTERS
         * ============================================================ */
        $totalAdmins    = Admin::count();
        $totalUsers     = User::count();
        $totalBoxes     = ConfigurableBox::count();
        $totalTemplates = BoxType::count();
        $totalItems     = Item::count();
        $totalOrders    = Order::count();

        /* ============================================================
         *  B) ORDER ANALYTICS
         * ============================================================ */
        $completedOrders  = Order::where('status', 'completed')->count();
        $pendingOrders    = Order::where('status', 'pending')->count();
        $processingOrders = Order::where('status', 'processing')->count();
        $cancelledOrders  = Order::where('status', 'cancelled')->count();
        $newOrdersCount = Order::where('status', 'pending')
            ->where('created_at', '>=', Carbon::now()->subDay())
            ->count();
        $totalRevenue   = (float) Order::where('status', 'completed')->sum('total_price');
        $todayRevenue   = (float) Order::where('status', 'completed')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_price');
        $monthlyRevenue = (float) Order::where('status', 'completed')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_price');

        /* ============================================================
         *  C) RECENT ORDERS (latest 5)
         * ============================================================ */
        $recentOrders = Order::with('user:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'status', 'total_price', 'created_at'])
            ->map(fn($o) => [
                'id'          => $o->id,
                'user'        => ['name' => $o->user?->name ?? 'Unknown'],
                'status'      => $o->status,
                'total_price' => $o->total_price,
                'created_at'  => $o->created_at,
            ]);

        /* ============================================================
         *  D) WEEKLY ORDERS CHART (last 7 days)
         * ============================================================ */
        $weeklyOrders = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo);
            return [
                'day'    => $date->format('D'),
                'orders' => Order::whereDate('created_at', $date)->count(),
            ];
        })->values();

        /* ============================================================
         *  E) MONTHLY REVENUE CHART (last 6 months)
         * ============================================================ */
        $monthlyRevenueChart = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = Carbon::now()->subMonths($monthsAgo);
            return [
                'month'   => $date->format('M'),
                'revenue' => (float) Order::where('status', 'completed')
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->sum('total_price'),
            ];
        })->values();

        /* ============================================================
         *  F) TOP BOXES
         * ============================================================ */
        $topBoxes = ConfigurableBox::withCount('configurations')
            ->orderByDesc('configurations_count')
            ->take(5)
            ->get(['id', 'code'])
            ->map(fn($b) => [
                'code'        => $b->code,
                'usage_count' => $b->configurations_count,
            ]);

        /* ============================================================
         *  G) TOP ITEMS
         * ============================================================ */
        $topItems = Item::withCount('configurationItems')
            ->orderByDesc('configuration_items_count')
            ->take(5)
            ->get(['id', 'name'])
            ->map(fn($i) => [
                'name'        => $i->name,
                'usage_count' => $i->configuration_items_count,
            ]);

        /* ============================================================
         *  H) SYSTEM HEALTH  ← now real, via service
         * ============================================================ */
        $systemHealth = $this->health->getAll();

        /* ============================================================
         *  I) RECENT ACTIVITY — FROM DATABASE TABLE
         * ============================================================ */
        $recentActivity = ActivityLog::whereDate('created_at', Carbon::today())
            ->latest()
            ->get()
            ->map(fn($log) => [
                'id'        => $log->id,
                'type'      => $log->type,
                'title'     => $log->title,
                'user'      => $log->user ?? 'System',
                'meta'      => $log->meta,
                'timestamp' => Carbon::parse($log->created_at)->diffForHumans(),
            ]);

        /* ============================================================
         *  RESPONSE
         * ============================================================ */
        return response()->json([
            'counters' => [
                'total_admins'    => $totalAdmins,
                'total_users'     => $totalUsers,
                'total_boxes'     => $totalBoxes,
                'total_templates' => $totalTemplates,
                'total_items'     => $totalItems,
                'total_orders'    => $totalOrders,
            ],
            'order_analytics' => [
                'completed_orders'  => $completedOrders,
                'pending_orders'    => $pendingOrders,
                'processing_orders' => $processingOrders,
                'cancelled_orders'  => $cancelledOrders,
                'total_revenue'     => $totalRevenue,
                'today_revenue'     => $todayRevenue,
                'monthly_revenue'   => $monthlyRevenue,
                'new_orders_count'  => $newOrdersCount,
            ],
            'recent_orders'         => $recentOrders,
            'weekly_orders'         => $weeklyOrders,
            'monthly_revenue_chart' => $monthlyRevenueChart,
            'top_boxes'             => $topBoxes,
            'top_items'             => $topItems,
            'system_health'         => $systemHealth,
            'recent_activity'       => $recentActivity,
        ]);
    } 
}
