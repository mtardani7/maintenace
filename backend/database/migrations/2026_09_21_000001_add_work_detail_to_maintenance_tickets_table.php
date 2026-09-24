<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->text('action_taken')->nullable()->after('reason');
            $table->foreignId('executor_id')->nullable()->after('reported_by')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->dropForeign(['executor_id']);
            $table->dropColumn(['action_taken', 'executor_id']);
        });
    }
};