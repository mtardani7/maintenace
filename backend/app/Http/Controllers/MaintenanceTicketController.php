<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceTicket;
use App\Services\MaintenanceTicketCreator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = MaintenanceTicket::query()
            ->with(['machine', 'reporter'])
            ->when($request->filled('plant_id'), fn ($query) => $query->where('plant_id', $request->integer('plant_id')))
            ->when($request->filled('machine_id'), fn ($query) => $query->where('machine_id', $request->integer('machine_id')))
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 100));

        return response()->json($tickets);
    }

    public function store(Request $request, MaintenanceTicketCreator $creator): JsonResponse
    {
        $data = $request->validate([
            'plant_id' => ['required', 'integer'],
            'machine_id' => ['required', 'integer'],
            'problem_type' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'min:10'],
            'source' => ['required', 'in:OPERATOR,QA'],
        ]);
        $data['reported_by'] = $request->user()->id;

        $ticket = $creator->create($data);

        return response()->json($ticket, 201);
    }

    public function show(MaintenanceTicket $ticket): JsonResponse
    {
        return response()->json($ticket->load(['machine', 'reporter']));
    }

    public function action(Request $request, MaintenanceTicket $ticket, ?string $action = null): JsonResponse
    {
        $data = $request->validate([
            'action' => ['sometimes', 'in:close'],
            'duration_hours' => ['required', 'numeric', 'min:0.25', 'max:1000'],
            'solution' => ['required', 'string', 'min:1', 'max:5000'],
        ]);
        $action = $action ?? $data['action'] ?? null;

        if ($action !== 'close') {
            return response()->json(['message' => 'The ticket action is invalid.'], 422);
        }

        if ($ticket->status !== 'OPEN') {
            return response()->json(['message' => 'Only open tickets can be closed.'], 422);
        }

        $ticket->update([
            'status' => 'CLOSED',
            'duration_hours' => $data['duration_hours'],
            'solution' => trim($data['solution']),
            'closed_at' => now(),
        ]);

        return response()->json($ticket->fresh(['machine', 'reporter']));
    }

    public function update(Request $request, MaintenanceTicket $ticket): JsonResponse
    {
        if ($ticket->status === 'CLOSED') {
            return response()->json(['message' => 'Closed tickets are historical records and cannot be edited.'], 422);
        }

        $data = $request->validate([
            'priority' => ['sometimes', 'in:LOW,MEDIUM,HIGH,CRITICAL'],
            'description' => ['sometimes', 'string', 'min:10'],
        ]);
        $ticket->update($data);

        return response()->json($ticket->fresh(['machine', 'reporter']));
    }

    public function destroy(MaintenanceTicket $ticket): JsonResponse
    {
        if ($ticket->status === 'CLOSED') {
            return response()->json(['message' => 'Closed tickets are historical records and cannot be deleted.'], 422);
        }

        $ticket->delete();
        return response()->json(null, 204);
    }
}
