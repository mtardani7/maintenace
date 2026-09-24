<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_ticket_spare_parts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('maintenance_ticket_id')->constrained('maintenance_tickets')->cascadeOnDelete();
            $table->string('name');
            $table->string('material_code', 100);
            $table->unsignedInteger('quantity');
            $table->text('remark')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_ticket_spare_parts');
    }
};