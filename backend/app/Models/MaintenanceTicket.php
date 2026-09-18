<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceTicket extends Model
{
    protected $fillable = [
        'plant_id', 'machine_id', 'problem_type', 'description',
        'source', 'status', 'priority', 'reported_by',
        'duration_hours',
        'solution',
        'reason',
    ];

    protected $casts = ['duration_hours' => 'float'];

    public function getRouteKeyName(): string
    {
        return 'ticket_number';
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        return $query->where(function ($ticketQuery) use ($value): void {
            $ticketQuery->where('ticket_number', $value)->orWhere('id', $value);
        });
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
