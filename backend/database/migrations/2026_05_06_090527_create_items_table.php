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
        Schema::create('items', function (Blueprint $table) {

            $table->id();

            $table->string('code', 100)->unique();

            $table->string('category', 100);

            $table->string('name');

            $table->string('preview')->nullable();

            $table->string('preview_public_id')->nullable();

            $table->integer('amperage')->nullable();

            $table->integer('poles')->nullable();

            $table->integer('voltage')->nullable();

            $table->decimal('price', 10, 2)->default(0);

            $table->integer('width_mm');
            $table->integer('height_mm');
            $table->integer('depth_mm');
            $table->integer('padding_mm')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
