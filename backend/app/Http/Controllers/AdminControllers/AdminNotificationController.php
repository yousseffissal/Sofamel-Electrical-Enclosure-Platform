<?php

namespace App\Http\Controllers\AdminControllers;

use App\Models\Admin;
use App\Models\Level;
use Illuminate\Http\Request;
use App\Notifications\AdminNotification;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminNotificationController extends Controller
{
    public function inbox(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    public function sent(Request $request)
    {
        $notifications = DB::table('notifications')
            ->orderByDesc('created_at')
            ->get();

        $grouped = $notifications
            ->groupBy(function ($n) {

                $data = json_decode($n->data, true);

                return $data['global_id'] ?? $n->id;
            })
            ->map(function ($items) {

                $first = $items->first();

                $data = json_decode($first->data, true);

                $sender = Admin::select(
                    'id',
                    'name',
                    'pictureURL'
                )->find($data['sender_id'] ?? null);

                /* ================= TARGET ================= */

                $target = "Unknown";

                // ALL ADMINS
                if ($items->count() > 1) {

                    $receiversCount = $items
                        ->pluck('notifiable_id')
                        ->unique()
                        ->count();

                    $adminsCount = Admin::count();

                    if ($receiversCount === $adminsCount) {
                        $target = "All Admins";
                    }
                }

                // SINGLE ADMIN
                if ($target === "Unknown" && $items->count() === 1) {

                    $receiver = Admin::select(
                        'id',
                        'name'
                    )->find($first->notifiable_id);

                    if ($receiver) {
                        $target = $receiver->name;
                    }
                }

                // LEVEL
                if ($target === "Unknown") {

                    $levelIds = Admin::whereIn(
                        'id',
                        $items->pluck('notifiable_id')
                    )
                        ->pluck('level_id')
                        ->unique();

                    if ($levelIds->count() === 1) {

                        $level = Level::find(
                            $levelIds->first()
                        );

                        if ($level) {
                            $target = "Level : " . $level->name;
                        }
                    }
                }

                return [
                    'id' => $first->id,

                    'title' => $data['title'] ?? null,

                    'message' => $data['message'] ?? null,

                    'read_at' => $first->read_at,

                    'created_at' => $first->created_at,

                    'sender' => $sender,

                    'target' => $target,

                    'receivers_count' => $items->count(),
                ];
            })
            ->values();

        return response()->json([
            'sent_notifications' => $grouped
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'title'   => 'required|string',
            'message' => 'required|string',
            'target'  => 'required'
        ]);

        $sender = $request->user();

        $globalId = (string) Str::uuid();

        /* ================= RESOLVE TARGET ================= */
        if ($request->target === 'all') {

            $admins = Admin::all();
        } elseif (is_array($request->target)) {

            // multiple levels
            $admins = Admin::whereIn('level_id', $request->target)->get();
        } elseif (str_starts_with($request->target, 'level:')) {

            $levelId = str_replace('level:', '', $request->target);
            $admins = Admin::where('level_id', $levelId)->get();
        } elseif (is_numeric($request->target)) {

            $admins = Admin::where('id', $request->target)->get();
        } else {
            return response()->json([
                'message' => 'Invalid target'
            ], 422);
        }

        /* ================= SEND ================= */
        foreach ($admins as $admin) {
            $admin->notify(
                new AdminNotification(
                    $request->title,
                    $request->message,
                    $sender->id,
                    $globalId
                )
            );
        }

        return response()->json([
            'message' => 'Notification sent',
            'global_id' => $globalId
        ]);
    }

    public function markAsRead($id, Request $request)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true
        ]);
    }

    public function destroy($id, Request $request)
    {
        $admin = $request->user();

        $notification = DB::table('notifications')
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json([
                'message' => 'Not found'
            ], 404);
        }

        $data = json_decode($notification->data, true);

        $globalId = $data['global_id'] ?? null;

        if ($globalId) {
            DB::table('notifications')
                ->where('data->global_id', $globalId)
                ->delete();
        } else {
            DB::table('notifications')
                ->where('id', $id)
                ->delete();
        }

        return response()->json([
            'success' => true
        ]);
    }

    public function meta()
    {
        return response()->json([
            'admins' => Admin::with('level:id,name')
                ->select('id', 'name', 'level_id', 'pictureURL')
                ->get(),
            'levels' => Level::select('id', 'name')->get(),
        ]);
    }
}
