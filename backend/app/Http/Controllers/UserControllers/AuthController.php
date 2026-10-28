<?php

namespace App\Http\Controllers\UserControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
        ]);

        // 🔑 multi-device token (no deletion)
        $token = $user->createToken('user-token', ['user'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'message' => 'Registration successful'
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $email = strtolower($validated['email']);

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 400);
        }

        $token = $user->createToken('user-token', ['user'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->currentAccessToken()) {
            return response()->json([
                'message' => 'No active session found'
            ], 401);
        }

        $user->currentAccessToken()->delete();

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
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function forgetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $status = Password::broker('users')->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Reset link sent to email'
            ]);
        }

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Please wait before retrying'
            ], 429);
        }

        return response()->json([
            'message' => "This email doesn't have an account"
        ], 400);
    }

    public function resetPassword(Request $request)
    {
        // decode email
        $request->merge([
            'email' => urldecode($request->email)
        ]);

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $status = Password::broker('users')->reset(
            $request->only(
                'email',
                'password',
                'password_confirmation',
                'token'
            ),

            function (User $user, string $password) {

                $user->password = Hash::make($password);

                $user->setRememberToken(
                    \Illuminate\Support\Str::random(60)
                );

                $user->save();

                // logout all sanctum devices
                $user->tokens()->delete();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json([
                'message' => 'Password reset successful'
            ])
            : response()->json([
                'message' => 'Invalid or expired token'
            ], 400);
    }

    public function verifyResetToken(Request $request)
    {
        // decode email
        $request->merge([
            'email' => urldecode($request->email)
        ]);

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
        ]);

        $reset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Email not found
        if (!$reset) {

            return response()->json([
                'message' => 'Invalid reset request'
            ], 404);
        }

        // Verify token
        if (!Hash::check($request->token, $reset->token)) {

            return response()->json([
                'message' => 'Invalid or expired token'
            ], 401);
        }

        return response()->json([
            'message' => 'Token is valid'
        ]);
    }
}
