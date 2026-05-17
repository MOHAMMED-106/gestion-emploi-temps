<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('optimized_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // intensif, equilibre, leger
            $table->json('schedule'); // Laravel gère automatiquement le JSON
            $table->text('explanations')->nullable();
            $table->date('generated_for')->nullable(); // 🔥 AJOUTÉ
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('optimized_schedules');
    }
};