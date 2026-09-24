<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->text('root_cause_analysis')->nullable()->after('action_taken');
            $table->text('corrective_action_plan')->nullable()->after('root_cause_analysis');
            $table->dateTime('target_at')->nullable()->after('corrective_action_plan');
            $table->foreignId('action_by_id')->nullable()->after('target_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->dropForeign(['action_by_id']);
            $table->dropColumn(['root_cause_analysis', 'corrective_action_plan', 'target_at', 'action_by_id']);
        });
    }
};