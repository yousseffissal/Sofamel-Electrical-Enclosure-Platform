<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UpdateUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $user = $request->user();

        if ($user) {

            $lastActivity = $user->last_activity;

            if (
                !$lastActivity ||
                $lastActivity->diffInSeconds(now()) > 20
            ) {
                $user->update([
                    'last_activity' => now(),
                ]);
            }
        }

        return $response;
    }
}