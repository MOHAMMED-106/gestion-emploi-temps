<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();
            $table->time('wake_up_time')->default('08:00:00');
            $table->time('sleep_time')->default('22:00:00');
            $table->string('study_preference')->default('morning');
            $table->integer('concentration_hours')->default(2);
            $table->integer('desired_free_time')->default(2);
            $table->text('priorities')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferences');
    }
};