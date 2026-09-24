<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('maintenance_tickets')
            ->whereNotNull('machine_id')
            ->orderBy('id')
            ->get()
            ->each(function (object $ticket): void {
                $machine = DB::table('machines')->where('id', $ticket->machine_id)->first();
                if (! $machine) {
                    return;
                }

                $plant = DB::table('plants')->where('id', $machine->plant_id)->first();
                $plantCode = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $plant->code ?? $plant->name ?? 'PLANT'));
                $machineCode = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $machine->code ?? $machine->id));
                $date = date('dmy', strtotime($ticket->created_at ?? 'now'));
                $number = sprintf('%s-%s-%s-%03d', $plantCode, $date, $machineCode, $ticket->id);

                DB::table('maintenance_tickets')->where('id', $ticket->id)->update(['ticket_number' => $number]);
            });
    }

    public function down(): void
    {
        // Ticket numbers are derived data; there is no safe value to restore.
    }
};