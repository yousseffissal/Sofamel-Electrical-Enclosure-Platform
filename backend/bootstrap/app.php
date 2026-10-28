<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        api: [
            __DIR__ . '/../routes/user.php',
            __DIR__ . '/../routes/admin.php',
        ],
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'level' => \App\Http\Middleware\CheckLevel::class,
            'update.activity' => \App\Http\Middleware\UpdateUserActivity::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (
            ThrottleRequestsException $e,
            $request
        ) {
            return response()->json([
                'message' => 'Please wait before retrying'
            ], Response::HTTP_TOO_MANY_REQUESTS);
        });
    })->create();
