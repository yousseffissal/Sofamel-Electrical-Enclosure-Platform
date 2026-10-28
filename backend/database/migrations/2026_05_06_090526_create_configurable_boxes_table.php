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
        Schema::create('configurable_boxes', function (Blueprint $table) {

            $table->id();

          $table->foreignId('box_type_id')->nullable()->constrained('box_types')->cascadeOnDelete();

            $table->string('code', 100)->unique();

            $table->integer('max_total_items');

            $table->string('preview')->nullable();

            $table->string('preview_public_id')->nullable();

            $table->text('notes')->nullable();

            $table->decimal('base_price', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configurable_boxes');
    }
};