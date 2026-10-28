<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserControllers\AuthController as UserAuthController;
use App\Http\Controllers\UserControllers\UserOrderController as UserOrderController;
use App\Http\Controllers\UserControllers\ConfiguratorController as ConfiguratorController;
use App\Http\Controllers\UserControllers\UserConfigurationController as UserConfigurationController;
use App\Http\Controllers\UserControllers\ReportController as ReportController;

Route::prefix('user')->group(function () {

    Route::post('/login', [UserAuthController::class, 'login']);
    Route::post('/register', [UserAuthController::class, 'register'])->middleware('throttle:1,1');
    Route::post('/forgot-password', [UserAuthController::class, 'forgetPassword']);
    Route::post('/reset-password', [UserAuthController::class, 'resetPassword']);
    Route::post('/verify-reset-token', [UserAuthController::class, 'verifyResetToken']);

    Route::middleware(['auth:api'])->group(function () {

        Route::post('/orders', [UserOrderController::class, 'store']);
        Route::get('/orders', [UserOrderController::class, 'myOrders']);
        Route::get('/orders/{order}', [UserOrderController::class, 'show']);
        Route::get('/orders/{order}/pdf', [UserOrderController::class, 'downloadPdf']);

        Route::get('/client/configurations', [UserConfigurationController::class, 'index']);
        Route::post('/client/configurations',[UserConfigurationController::class, 'store']);
        Route::delete('/client/configurations/{configuration}', [UserConfigurationController::class, 'destroy']);
        Route::post('/client/configurations/{configuration}/checkout', [UserConfigurationController::class, 'checkout']);

        Route::get('/box-types', [ConfiguratorController::class, 'getAllBoxTypes']);
        Route::get('/box-types/{boxType}/templates', [ConfiguratorController::class, 'getBoxTypeTemplates']);
        Route::get('/templates/{template}/areas', [ConfiguratorController::class, 'getTemplateAreas']);
        Route::get('/templates/{template}/areas/{area}/items', [ConfiguratorController::class, 'getTemplateAreaItems']);

        Route::get('/get-me', [UserAuthController::class, 'getMe']);
        Route::post('/logout', [UserAuthController::class, 'logout']);
        Route::post('/logout-all', [UserAuthController::class, 'logoutAll']);
    });
    Route::post('/reports', [ReportController::class, 'store']);
});
