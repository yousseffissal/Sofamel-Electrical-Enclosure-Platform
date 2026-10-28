<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Level;

class LevelSeeder extends Seeder
{
    public function run(): void
    {
        Level::create([
            'name' => 'Admin'
        ]);
        Level::create([
            'name' => 'Super Admin'
        ]);
        Level::create([
            'name' => 'Moderator'
        ]);
         Level::create([
            'name' => 'RH'
        ]);
    }
}