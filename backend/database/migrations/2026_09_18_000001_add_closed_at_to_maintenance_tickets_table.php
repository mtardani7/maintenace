<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->timestamp('closed_at')->nullable()->after('solution')->index();
        });

        DB::table('maintenance_tickets')
            ->where('status', 'CLOSED')
            ->whereNull('closed_at')
            ->orderBy('id')
            ->eachById(function (object $ticket): void {
                DB::table('maintenance_tickets')
                    ->where('id', $ticket->id)
                    ->update(['closed_at' => $ticket->updated_at ?? $ticket->created_at]);
            });
    }

    public function down(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->dropIndex(['closed_at']);
            $table->dropColumn('closed_at');
        });
    }
};