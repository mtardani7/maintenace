<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('incidents')->where('status', 'open')->update(['status' => 'OPEN']);
        DB::table('incidents')->where('status', 'resolved')->update(['status' => 'RESOLVED']);

        DB::table('maintenance_tickets')
            ->whereIn('status', ['CLOSED', 'RESOLVED', 'VERIFIED'])
            ->update(['status' => 'CLOSED']);
        DB::table('maintenance_tickets')
            ->whereNotIn('status', ['OPEN', 'CLOSED'])
            ->update(['status' => 'OPEN']);
    }

    public function down(): void
    {
        // Existing records remain in their normalized status.
    }
};