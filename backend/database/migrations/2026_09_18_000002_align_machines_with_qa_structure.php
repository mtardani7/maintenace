<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machines', function (Blueprint $table): void {
            $table->unsignedBigInteger('plant_id')->nullable()->after('id')->index();
            $table->string('section')->nullable()->after('name');
            $table->boolean('is_active')->default(true)->after('section')->index();
            $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users');
            $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users');
        });

        DB::table('machines')->orderBy('id')->eachById(function (object $machine): void {
            DB::table('machines')->where('id', $machine->id)->update([
                'plant_id' => is_numeric($machine->plant) ? (int) $machine->plant : null,
                'section' => $machine->line,
                'is_active' => $machine->status !== 'offline',
                'created_by' => $machine->requested_by,
                'updated_by' => $machine->reviewed_by ?? $machine->requested_by,
            ]);
        });

        Schema::table('machines', function (Blueprint $table): void {
            $table->dropUnique('machines_code_unique');
            $table->unique(['plant_id', 'code']);
            $table->dropForeign(['requested_by']);
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'plant',
                'line',
                'location',
                'status',
                'approval_status',
                'requested_by',
                'reviewed_by',
                'reviewed_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table): void {
            $table->string('plant')->nullable();
            $table->string('line')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default('offline');
            $table->string('approval_status')->default('approved');
            $table->foreignId('requested_by')->nullable()->constrained('users');
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
        });

        Schema::table('machines', function (Blueprint $table): void {
            $table->dropUnique(['plant_id', 'code']);
            $table->unique('code');
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['plant_id', 'section', 'is_active', 'created_by', 'updated_by']);
        });
    }
};
