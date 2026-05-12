<?php

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
        Schema::create('fixed_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('location')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixed_events');
    }
};