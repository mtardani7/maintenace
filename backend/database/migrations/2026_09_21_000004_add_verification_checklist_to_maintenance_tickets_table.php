<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->json('verification_checklist')->nullable()->after('action_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->dropColumn('verification_checklist');
        });
    }
};