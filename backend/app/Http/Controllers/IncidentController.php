<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use App\Http\Resources\IncidentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $incidents = Incident::query()
            ->when($request->filled('plant_id'), fn ($query) => $query->where('plant_id', $request->integer('plant_id')))
            ->when($request->filled('machine_id'), fn ($query) => $query->where('machine_id', $request->integer('machine_id')))
            ->latest()
            ->paginate(min($request->integer('per_page', 20), 100));

        return IncidentResource::collection($incidents);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plant_id' => ['required', 'integer'],
            'machine_id' => ['required', 'integer'],
            'problem_type' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'min:10'],
            'action_taken' => ['required', 'string', 'min:5'],
            'result' => ['required', 'string', 'min:5'],
        ]);
        $data['reported_by'] = $request->user()->id;
        $data['status'] = 'RESOLVED';

        return response()->json(new IncidentResource(Incident::create($data)), 201);
    }

    public function show(Incident $incident): IncidentResource
    {
        return new IncidentResource($incident);
    }

    public function update(Request $request, Incident $incident): IncidentResource
    {
        $data = $request->validate([
            'plant_id' => ['sometimes', 'integer'],
            'machine_id' => ['sometimes', 'integer'],
            'problem_type' => ['sometimes', 'string', 'max:100'],
            'description' => ['sometimes', 'string', 'min:10'],
            'action_taken' => ['sometimes', 'string', 'min:5'],
            'result' => ['sometimes', 'string', 'min:5'],
            'status' => ['sometimes', 'in:RESOLVED,CANCELLED'],
        ]);
        $incident->update($data);

        return new IncidentResource($incident->fresh());
    }

    public function destroy(Incident $incident): JsonResponse
    {
        $incident->delete();
        return response()->json(null, 204);
    }
}
