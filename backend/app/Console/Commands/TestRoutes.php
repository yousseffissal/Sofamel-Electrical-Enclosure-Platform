<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

#[Signature('app:test-routes')]
#[Description('Command description')]
class TestRoutes extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        foreach (Route::getRoutes() as $route) {

            $methods = implode('|', $route->methods());
            $uri = $route->uri();

            $this->info("✓ {$methods}  {$uri}");
        }

        return Command::SUCCESS;
    }
}
