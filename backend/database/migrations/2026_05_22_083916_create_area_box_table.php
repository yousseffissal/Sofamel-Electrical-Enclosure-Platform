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
        Schema::create('area_box', function (Blueprint $table) {
            $table->id();

            $table->foreignId('configurable_box_id')
                ->constrained('configurable_boxes')
                ->onDelete('cascade');

            $table->foreignId('area_id')
                ->constrained('areas')
                ->onDelete('cascade');

            $table->integer('width_mm')->default(0);
            $table->integer('height_mm')->default(0);
            $table->integer('padding_mm')->default(0);

            $table->unique(
                ['configurable_box_id', 'area_id'],
                'configurable_box_area_unique'
            );

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('area_box');
    }
};
