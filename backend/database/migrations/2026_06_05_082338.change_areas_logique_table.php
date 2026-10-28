<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old area_item table
        Schema::dropIfExists('area_item');

        // Add area_id to box_allowed_items
        Schema::table('box_allowed_items', function (Blueprint $table) {
            $table->foreignId('area_id')
                ->nullable()
                ->after('item_id')
                ->constrained('areas')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('box_allowed_items', function (Blueprint $table) {
            $table->dropForeign(['area_id']);
            $table->dropColumn('area_id');
        });

        Schema::create('area_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->foreignId('area_id')->constrained('areas')->onDelete('cascade');
            $table->unique(['item_id', 'area_id'], 'item_area_unique');
            $table->timestamps();
        });
    }
};