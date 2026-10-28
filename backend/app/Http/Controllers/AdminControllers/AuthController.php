<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $email = strtolower($validated['email']);

        $admin = Admin::where('email', $email)->first();

        if (!$admin || !Hash::check($validated['password'], $admin->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 400);
        }

        //  create new token (multi-device allowed)
        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'gender' => $admin->gender,
                'email' => $admin->email,
                'pictureURL' => $admin->pictureURL,
                'level_id' => $admin->level_id,
                'level_name' => $admin->level->name,
            ],
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $admin = $request->user();

        if (!$admin || !$admin->currentAccessToken()) {
            return response()->json([
                'message' => 'No active session found'
            ], 400);
        }

        $admin->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function logoutAll(Request $request)
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $admin->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices'
        ]);
    }

    public function getMe(Request $request)
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        return response()->json([
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'gender' => $admin->gender,
                'pictureURL' => $admin->pictureURL,
                'level_id' => $admin->level_id,
                'level_name' => $admin->level?->name,
            ]
        ]);
    }

    public function getAdmins()
    {
        $admins = Admin::with('level')
            ->select('id', 'name', 'email', 'pictureURL', 'gender', 'level_id', 'last_activity')
            ->get()
            ->map(function ($admin) {

                $admin->status = $admin->last_activity &&
                    $admin->last_activity->gt(now()->subSeconds(30))
                    ? 'online'
                    : 'offline';

                return $admin;
            });

        return response()->json($admins);
    }

    public function update(Request $request)
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $request->validate([
            'current_password'      => 'required',
            'new_password'          => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $admin->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Current password is incorrect',
            ]);
        }

        $admin->password = Hash::make($request->new_password);
        $admin->save();

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }
}
