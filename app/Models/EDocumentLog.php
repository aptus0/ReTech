<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EDocumentLog extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'request_payload' => 'array',
        'response_payload' => 'array',
        'sent_at' => 'datetime',
        'checked_at' => 'datetime',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
