<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin account (status aktif, siap digunakan)
        User::create([
            'name' => 'Admin OMS',
            'email' => 'admin@oms.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Pengurus account
        User::create([
            'name' => 'Pengurus OMS',
            'email' => 'pengurus@oms.com',
            'password' => Hash::make('password123'),
            'role' => 'pengurus',
            'status' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Anggota account (nonaktif — menunggu aktivasi admin)
        User::create([
            'name' => 'Anggota Baru',
            'email' => 'anggota@oms.com',
            'password' => Hash::make('password123'),
            'role' => 'anggota',
            'status' => 'nonaktif',
        ]);
    }
}
