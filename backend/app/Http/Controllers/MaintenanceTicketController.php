<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceTicket;
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

        return response()->json(MaintenanceTicket::create($data), 201);
    }

    public function show(MaintenanceTicket $ticket): JsonResponse
    {
        return response()->json($ticket);
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
