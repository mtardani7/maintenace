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
            $table->string('ticket_number')->nullable()->unique()->after('id');
        });

        DB::table('maintenance_tickets')
            ->orderBy('id')
            ->get()
            ->each(function (object $ticket): void {
                $machine = DB::table('machines')->where('id', $ticket->machine_id)->first();
                $plant = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $machine->plant ?? 'PLANT'));
                $machineCode = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $machine->code ?? $ticket->machine_id));
                $date = date('dmy', strtotime($ticket->created_at ?? 'now'));

                DB::table('maintenance_tickets')
                    ->where('id', $ticket->id)
                    ->update(['ticket_number' => sprintf('%s-%s-%s-%03d', $plant, $date, $machineCode, $ticket->id)]);
            });

        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->string('ticket_number')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_tickets', function (Blueprint $table): void {
            $table->dropUnique(['ticket_number']);
            $table->dropColumn('ticket_number');
        });
    }
};