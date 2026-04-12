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
            $table->index('member_number');
            $table->index('role');
            $table->index('status');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index('created_at');
        });

        if (Schema::hasTable('event_user')) {
            Schema::table('event_user', function (Blueprint $table) {
                // morphs and foreignId usually create single indexes, but composite is better for lookup
                $table->index(['event_id', 'user_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['member_number']);
            $table->dropIndex(['role']);
            $table->dropIndex(['status']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        if (Schema::hasTable('event_user')) {
            Schema::table('event_user', function (Blueprint $table) {
                $table->dropIndex(['event_id', 'user_id']);
            });
        }
    }
};
