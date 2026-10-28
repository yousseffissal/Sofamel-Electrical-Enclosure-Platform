<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminControllers\AuthController as AdminAuthController;
use App\Http\Controllers\AdminControllers\BoxController as BoxController;
use App\Http\Controllers\AdminControllers\ClientController as ClientController;
use App\Http\Controllers\AdminControllers\AdminNotificationController as AdminNotificationController;
use App\Http\Controllers\AdminControllers\OrderController as OrderController;
use App\Http\Controllers\AdminControllers\DashboardController as DashboardController;
use App\Http\Controllers\AdminControllers\AdminTableController as AdminTableController;
use App\Http\Controllers\AdminControllers\ReportController as ReportController;

Route::prefix('admin')->group(function () {

    Route::middleware(['update.activity'])->group(function () {

        Route::post('/login', [AdminAuthController::class, 'login']);

        Route::middleware(['auth:admin'])->group(function () {

            Route::middleware(['level:1'])->group(function () {
                Route::get('/hello', function () {
                    return response()->json([
                        'message' => 'Admin authenticated via token'
                    ]);
                });
                Route::get('/users', [AdminAuthController::class, 'getAdmins']);
                Route::post('/admin', [AdminTableController::class, 'createAdmin']);
                Route::patch('/admins/{admin}', [AdminTableController::class, 'updateAdmin']);
                Route::delete('/admins', [AdminTableController::class, 'deleteAdmin']);

                Route::get('/box-types', [BoxController::class, 'getBoxTypes']);
                Route::post('/box-types', [BoxController::class, 'storeBoxType']);
                Route::delete('/box-types/{id}', [BoxController::class, 'deleteBoxType']);
                Route::patch('/box-types/{boxType}', [BoxController::class, 'updateBoxType']);
                Route::prefix('box-types/{boxType}/configurable-boxes')->group(function () {
                    Route::get('/', [BoxController::class, 'getConfigurableBox']);
                    Route::post('/', [BoxController::class, 'addConfigurableBox']);
                    Route::delete('/', [BoxController::class, 'removeConfigurableBox']);
                    Route::post('/attach', [BoxController::class, 'attachConfigurableBox']);
                });

                Route::get('/configurable-boxes', [BoxController::class, 'getAllConfigurableBoxes']);
                Route::get('/available-configurable-boxes', [BoxController::class, 'getAvailableConfigurableBoxes']);
                Route::patch('/configurable-boxes/{configurableBox}', [BoxController::class, 'updateConfigurableBox']);
                Route::prefix('configurable-boxes/{configurableBox}/items')->group(function () {
                    Route::get('/', [BoxController::class, 'getAllowedItems']);
                    Route::post('/', [BoxController::class, 'addItem']);
                    Route::delete('/', [BoxController::class, 'removeItem']);
                    Route::post('/attach', [BoxController::class, 'attachItem']);
                });
                Route::post('/areas', [BoxController::class, 'storeArea']);
                Route::get('/areas', [BoxController::class, 'getAreas']);
                Route::get('/configurable-boxes/{configurableBox}/areas', [BoxController::class, 'getBoxAreas']);
                Route::delete('/configurable-boxes', [BoxController::class, 'deleteConfigurableBox']);
                Route::delete('/items/{item}', [BoxController::class, 'deleteItem']);

                Route::get('/items', [BoxController::class, 'getAllItems']);
                Route::get('/available-items/{box}', [BoxController::class, 'getAvailableItems']);
                Route::patch('/items/{item}', [BoxController::class, 'updateItem']);

                Route::get('/notifications/sent', [AdminNotificationController::class, 'sent']);
                Route::post('/notifications/send', [AdminNotificationController::class, 'send']);
                Route::get('/notifications/meta', [AdminNotificationController::class, 'meta']);
                Route::delete('/notifications/{id}/delete', [AdminNotificationController::class, 'destroy']);

                Route::get('/clients', [ClientController::class, 'getUsers']);
                Route::get('/clients/{id}/orders', [ClientController::class, 'userOrders']);
                Route::delete('/clients/{id}', [ClientController::class, 'deleteUser']);

                Route::get('/orders/archive', [OrderController::class, 'archived']);
                Route::get('/orders', [OrderController::class, 'index']);
                Route::get('/orders/{id}', [OrderController::class, 'show']);
                Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
                Route::get('/orders/{id}/pdf', [OrderController::class, 'pdf']);
                Route::patch('/orders/{id}/unarchive', [OrderController::class, 'unarchive']);
                Route::patch('/orders/{id}/archive', [OrderController::class, 'archive']);

                Route::get('/reports', [ReportController::class, 'index']);
                Route::get('/reports/{report}', [ReportController::class, 'show']);
                Route::delete('/reports/{report}', [ReportController::class, 'destroy']);
            });

            Route::get('/dashboard/overview', [DashboardController::class, 'getOverview']);
            Route::get('/Mynotifications', [AdminNotificationController::class, 'inbox']);
            Route::post('/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
            Route::get('/get-me', [AdminAuthController::class, 'getMe']);
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::post('/logout-all', [AdminAuthController::class, 'logoutAll']);
            Route::post('/update-password', [AdminAuthController::class, 'update']);
        });
    });
});
