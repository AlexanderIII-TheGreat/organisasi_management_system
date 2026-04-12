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
        // Bank Soal / Test Minat Bakat
        Schema::create('talent_tests', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('minat'); // minat, bakat
            $table->integer('duration_minutes')->nullable();
            $table->enum('status', ['draft', 'aktif', 'nonaktif'])->default('draft');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // Pertanyaan dalam test
        Schema::create('talent_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_test_id')->constrained('talent_tests')->cascadeOnDelete();
            $table->text('question');
            $table->integer('order')->default(0);
            $table->integer('weight')->default(1); // bobot soal
            $table->timestamps();
        });

        // Opsi jawaban per pertanyaan
        Schema::create('talent_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_question_id')->constrained('talent_questions')->cascadeOnDelete();
            $table->text('option_text');
            $table->integer('score')->default(0); // nilai per jawaban
            $table->string('recommended_division')->nullable(); // divisi yang direkomendasikan
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Hasil akhir user setelah mengerjakan test
        Schema::create('talent_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('talent_test_id')->constrained('talent_tests')->cascadeOnDelete();
            $table->integer('total_score')->default(0);
            $table->string('recommended_division')->nullable(); // divisi final rekomendasi
            $table->text('analysis')->nullable(); // analisis hasil
            $table->json('answers')->nullable(); // JSON array of {question_id, option_id}
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'talent_test_id']); // 1 user = 1 result per test
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('talent_results');
        Schema::dropIfExists('talent_options');
        Schema::dropIfExists('talent_questions');
        Schema::dropIfExists('talent_tests');
    }
};
