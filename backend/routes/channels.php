<?php

use Illuminate\Support\Facades\Broadcast;


Broadcast::routes(['middleware' => ['auth:admin']]);

Broadcast::channel('admins.{id}', function ($admin, $id) {
    return (int) $admin->id === (int) $id;
});