<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceTicketSparePart extends Model
{
    protected $fillable = [
        'maintenance_ticket_id',
        'name',
        'material_code',
        'quantity',
        'remark',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(MaintenanceTicket::class, 'maintenance_ticket_id');
    }
}