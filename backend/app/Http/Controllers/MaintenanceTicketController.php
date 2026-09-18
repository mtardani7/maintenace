<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceTicket;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = MaintenanceTicket::query()
            ->when($request->filled('plant_id'), fn ($query) => $query->where('plant_id', $request->integer('plant_id')))
            ->when($request->filled('machine_id'), fn ($query) => $query->where('machine_id', $request->integer('machine_id')))
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 100));

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plant_id' => ['required', 'integer'],
            'machine_id' => ['required', 'integer'],
            'problem_type' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'min:10'],
            'source' => ['required', 'in:OPERATOR,QA'],
        ]);
        $data['reported_by'] = $request->user()->id;

        $ticket = DB::transaction(function () use ($data): MaintenanceTicket {
            $machine = \App\Models\Machine::query()->lockForUpdate()->findOrFail($data['machine_id']);
            $plant = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $machine->plant));
            $machineCode = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $machine->code));
            $date = now()->format('dmy');
            $prefix = sprintf('%s-%s-%s-', $plant, $date, $machineCode);
            $lastSequence = MaintenanceTicket::query()
                ->where('ticket_number', 'like', $prefix . '%')
                ->pluck('ticket_number')
                ->map(fn (string $number): int => (int) str($number)->afterLast('-'))
                ->max() ?? 0;

            $data['ticket_number'] = sprintf('%s%03d', $prefix, $lastSequence + 1);

            return MaintenanceTicket::create($data);
        });

        return response()->json($ticket->load('machine'), 201);
    }

    public function show(MaintenanceTicket $ticket): JsonResponse
    {
        return response()->json($ticket);
    }

    public function action(Request $request, MaintenanceTicket $ticket, ?string $action = null): JsonResponse
    {
        $data = $request->validate([
            'action' => ['sometimes', 'in:accept,start,diagnosis,action,spare-part,photo,resolve,close,assign,priority,review,verify,reopen'],
            'duration_hours' => ['sometimes', 'numeric', 'min:0.25', 'max:1000'],
            'solution' => ['sometimes', 'string', 'max:5000'],
            'reason' => ['sometimes', 'string', 'max:5000'],
        ]);
        $action = $action ?? $data['action'] ?? null;

        if ($action === 'close' && blank($data['solution'] ?? null)) {
            return response()->json(['message' => 'Solution is required when closing a ticket.'], 422);
        }

        if ($action === 'reopen' && blank($data['reason'] ?? null)) {
            return response()->json(['message' => 'Reason is required when opening a ticket.'], 422);
        }

        if (! in_array($action, ['accept', 'start', 'diagnosis', 'action', 'spare-part', 'photo', 'resolve', 'close', 'assign', 'priority', 'review', 'verify', 'reopen'], true)) {
            return response()->json(['message' => 'The ticket action is invalid.'], 422);
        }

        $status = match ($action) {
            'accept' => 'ASSIGNED',
            'start' => 'IN_PROGRESS',
            'resolve' => 'RESOLVED',
            'close' => 'CLOSED',
            'verify' => 'VERIFIED',
            'reopen' => 'OPEN',
            default => $ticket->status,
        };

        $ticket->update(array_merge(['status' => $status], array_intersect_key($data, array_flip(['duration_hours', 'solution', 'reason']))));

        return response()->json($ticket->fresh());
    }

    public function update(Request $request, MaintenanceTicket $ticket): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:OPEN,ASSIGNED,IN_PROGRESS,RESOLVED,CLOSED'],
            'priority' => ['sometimes', 'in:LOW,MEDIUM,HIGH,CRITICAL'],
            'description' => ['sometimes', 'string', 'min:10'],
        ]);
        $ticket->update($data);

        return response()->json($ticket->fresh());
    }

    public function destroy(MaintenanceTicket $ticket): JsonResponse
    {
        $ticket->delete();
        return response()->json(null, 204);
    }
}
