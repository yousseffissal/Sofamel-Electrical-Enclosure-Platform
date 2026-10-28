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
        Schema::create('box_allowed_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('configurable_box_id')
                ->constrained('configurable_boxes')
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained('items')
                ->cascadeOnDelete();

            $table->integer('max_quantity')->default(1);

            $table->timestamps();

            $table->unique(
                ['configurable_box_id', 'item_id'],
                'box_item_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('box_allowed_items');
    }
};