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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('image')->nullable();
            $table->string('location')->nullable();
            $table->dateTime('event_date');
            $table->dateTime('registration_deadline')->nullable();
            $table->enum('status', ['mendatang', 'berlangsung', 'selesai'])->default('mendatang');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // Pivot table: event <-> user (panitia)
        Schema::create('event_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('position')->nullable(); // Ketua Panitia, Sekretaris, dll
            $table->timestamps();

            $table->unique(['event_id', 'user_id']); // user hanya bisa 1x per event
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_user');
        Schema::dropIfExists('events');
    }
};
