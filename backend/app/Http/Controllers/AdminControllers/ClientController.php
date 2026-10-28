<?php

namespace App\Http\Controllers\AdminControllers;

use App\Models\User;
use App\Http\Controllers\Controller;

class ClientController extends Controller
{
    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'created_at')->get();

        return response()->json($users);
    }

    public function userOrders($id)
    {
        $user = User::with([
            'orders.configuration.configurationItems.item',
            'orders.user'
        ])->find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'orders' => $user->orders
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
