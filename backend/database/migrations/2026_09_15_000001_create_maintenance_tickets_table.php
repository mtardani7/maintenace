<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_tickets', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('plant_id')->nullable()->index();
            $table->unsignedBigInteger('machine_id')->index();
            $table->string('problem_type');
            $table->text('description');
            $table->string('source')->default('OPERATOR');
            $table->string('status')->default('OPEN')->index();
            $table->string('priority')->default('MEDIUM');
            $table->foreignId('reported_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_tickets');
    }
};
