<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MachineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Machine::query()->latest();
        $user = $request->user();

        if (! in_array($user?->role, ['admin', 'qa'], true)) {
            $query->where('approval_status', 'approved');
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($builder) use ($search): void {
                $builder->where('code', 'ilike', "%{$search}%")
                    ->orWhere('name', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('plant')) $query->where('plant', $request->string('plant'));
        if ($request->filled('status')) $query->where('status', $request->string('status'));

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100', 'unique:machines,code'],
            'name' => ['required', 'string', 'max:255'],
            'plant' => ['required', 'string', 'max:255'],
            'line' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $machine = Machine::create([...$validated, 'requested_by' => $request->user()->id]);

        return response()->json($machine->load('requester'), 201);
    }

    public function review(Request $request, Machine $machine): JsonResponse
    {
        abort_unless(in_array($request->user()?->role, ['admin', 'qa'], true), 403);

        $validated = $request->validate(['decision' => ['required', Rule::in(['approved', 'rejected'])]]);
        $machine->update([
            'approval_status' => $validated['decision'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json($machine->fresh()->load('requester', 'reviewer'));
    }
}
