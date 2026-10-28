<?php

namespace App\Providers;

use Illuminate\Support\Facades\Request;
use App\Contracts\FileStorageService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use App\Models\Admin;
use App\Models\BoxType;
use App\Models\ConfigurableBox;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use App\Observers\AdminObserver;
use App\Observers\ConfigurableBoxObserver;
use App\Observers\ItemObserver;
use App\Observers\OrderObserver;
use App\Observers\UserObserver;
use App\Observers\BoxTypeObserver;
use App\Services\CloudinaryStorageService;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Swap CloudinaryStorageService → S3StorageService or LocalStorageService
        // here without touching any controller or business logic.
        $this->app->bind(FileStorageService::class, CloudinaryStorageService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Order::observe(OrderObserver::class);
        User::observe(UserObserver::class);
        Admin::observe(AdminObserver::class);
        Item::observe(ItemObserver::class);
        ConfigurableBox::observe(ConfigurableBoxObserver::class);
        BoxType::observe(BoxTypeObserver::class);
    }
}
