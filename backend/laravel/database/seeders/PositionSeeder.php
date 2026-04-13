<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            ['name' => 'Ketua Umum'],
            ['name' => 'Wakil Ketua'],
            ['name' => 'Sekretaris'],
            ['name' => 'Bendahara'],
            ['name' => 'Ketua Divisi'],
            ['name' => 'Anggota'],
        ];

        foreach ($positions as $position) {
            Position::updateOrCreate(
                ['name' => $position['name']],
                $position
            );
        }
    }
}
