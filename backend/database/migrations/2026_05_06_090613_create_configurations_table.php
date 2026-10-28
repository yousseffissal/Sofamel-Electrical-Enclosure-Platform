<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();

            // user directly on configuration (new design)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            // box relation
            $table->foreignId('configurable_box_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // order relation (now nullable + safe delete)
            $table->foreignId('order_id')
                ->nullable()
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            // pricing snapshot
            $table->integer('quantity')->default(1);
            $table->decimal('box_price_snapshot', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configurations');
    }
};