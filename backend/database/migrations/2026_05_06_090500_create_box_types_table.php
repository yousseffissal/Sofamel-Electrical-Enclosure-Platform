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
        Schema::create('box_types', function (Blueprint $table) {

            $table->id();

            $table->string('code', 50)->unique();

            $table->string('family', 100);
            $table->string('variant', 20);

            $table->string('material', 50);
            $table->string('mounting_type', 50);
            $table->string('ip_rating', 20);
            $table->string('color', 50);

            $table->integer('width_mm');
            $table->integer('height_mm');
            $table->integer('depth_mm');

            $table->boolean('has_overcurrent')->default(false);

            $table->boolean('has_earth_leakage')->default(false);

            $table->string('earth_leakage_rating', 50)->nullable();

            $table->integer('branch_cable_count')->default(1);

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('box_types');
    }
};