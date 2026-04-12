<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Menambahkan kolom nomor_anggota ke tabel users.
     * Format: 2-digit kode provinsi + 2-digit kode kota + 4-digit nomor urut
     * Contoh Semarang: 3374 (Jawa Tengah=33, Semarang=74) + 0001 => "33740001"
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Nomor anggota unik, nullable saat awal (diisi oleh service setelah generate)
            $table->string('member_number', 8)->nullable()->unique()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('member_number');
        });
    }
};
