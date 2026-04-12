<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Hapus kolom string lama
            if (Schema::hasColumn('users', 'position')) {
                $table->dropColumn('position');
            }
            
            // Tambah foreign key ke tabel positions
            $table->foreignId('position_id')->nullable()->after('role')->constrained('positions')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropColumn('position_id');
            $table->string('position')->nullable()->after('role');
        });
    }
};
