<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaintenanceTicketSparePartController extends Controller
{
    public function store(Request $request, MaintenanceTicket $ticket): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'material_code' => ['required', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'remark' => ['nullable', 'string', 'max:1000'],
        ]);

        $sparePart = DB::transaction(function () use ($data, $ticket) {
            $lockedTicket = MaintenanceTicket::query()->lockForUpdate()->findOrFail($ticket->getKey());
            abort_if($lockedTicket->status !== 'OPEN', 422, 'Spare parts can only be changed while the ticket is open.');

            return $lockedTicket->spareParts()->create($data);
        });

        return response()->json($sparePart, 201);
    }

    public function destroy(MaintenanceTicket $ticket, int $sparePart): JsonResponse
    {
        DB::transaction(function () use ($ticket, $sparePart): void {
            $lockedTicket = MaintenanceTicket::query()->lockForUpdate()->findOrFail($ticket->getKey());
            abort_if($lockedTicket->status !== 'OPEN', 422, 'Spare parts can only be changed while the ticket is open.');
            $lockedTicket->spareParts()->findOrFail($sparePart)->delete();
        });

        return response()->json(null, 204);
    }
}