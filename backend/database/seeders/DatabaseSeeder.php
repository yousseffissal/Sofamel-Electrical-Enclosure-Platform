<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LevelSeeder::class,
        ]);

        $adminLevel = \App\Models\Level::where('name', 'Admin')->first();

        /* USERS */
        User::factory()->createMany([
            [
                'name' => 'Youssef Fissal',
                'email' => 'user@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123456789'),
            ],
            [
                'name' => 'Youness Irda',
                'email' => 'youness@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123456789'),
            ],
        ]);

        /* ADMINS DATA */
        $admins = [
            [
                'name' => 'Youssef Fissal',
                'email' => 'admin@gmail.com',
                'gender' => 'male',
                'level_id' => $adminLevel->id,
                'pictureURL' => "https://res.cloudinary.com/dpt82xqpq/image/upload/v1778615535/A_o9zevu.jpg",
            ],
            [
                'name' => 'Hamza Firdaous',
                'email' => 'admin2@gmail.com',
                'gender' => 'male',
                'level_id' => 2,
                'pictureURL' => null,
            ],
            [
                'name' => 'Youness Irda',
                'email' => 'admin3@gmail.com',
                'gender' => 'male',
                'level_id' => 3,
                'pictureURL' => null,
            ],
            [
                'name' => 'Soufiane Mansour',
                'email' => 'admin4@gmail.com',
                'gender' => 'male',
                'level_id' => 1,
                'pictureURL' => null,
            ],
            [
                'name' => 'Malak Haital',
                'email' => 'admin5@gmail.com',
                'gender' => 'female',
                'level_id' => 4,
                'pictureURL' => null,
            ],
            [
                'name' => 'Mehdi Bakir',
                'email' => 'admin6@gmail.com',
                'gender' => 'male',
                'level_id' => 2,
                'pictureURL' => null,
            ],
            [
                'name' => 'Said Enassiri',
                'email' => 'admin7@gmail.com',
                'gender' => 'male',
                'level_id' => 1,
                'pictureURL' => null,
            ],
            [
                'name' => 'Anass Ghazi',
                'email' => 'admin8@gmail.com',
                'gender' => 'male',
                'level_id' => 4,
                'pictureURL' => null,
            ],
            [
                'name' => 'Youssef Fissal',
                'email' => 'youssefpaxar1@gmail.com',
                'gender' => 'male',
                'level_id' => $adminLevel->id,
                'pictureURL' => null,
            ],
        ];

        foreach ($admins as $admin) {

            $seed = urlencode($admin['name']);
            $avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" . $seed;
            
            Admin::factory()->create([
                'name' => $admin['name'],
                'email' => $admin['email'],
                'email_verified_at' => now(),
                'password' => Hash::make('123456789'),
                'gender' => $admin['gender'],

                'pictureURL' => $admin['pictureURL'] ?? $avatar,

                'level_id' => $admin['level_id'],
            ]);
        }
    }
}
