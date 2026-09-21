<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plants', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        DB::table('machines')->whereNotNull('plant_id')->whereNotExists(function ($query): void {
            $query->select(DB::raw(1))->from('plants')->whereColumn('plants.id', 'machines.plant_id');
        })->update(['plant_id' => null]);

        Schema::table('machines', function (Blueprint $table): void {
            $table->foreign('plant_id')->references('id')->on('plants');
        });
    }

    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table): void {
            $table->dropForeign(['plant_id']);
        });
        Schema::dropIfExists('plants');
    }
};
