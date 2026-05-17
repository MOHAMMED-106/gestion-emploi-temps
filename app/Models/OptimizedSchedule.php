<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OptimizedSchedule extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'schedule',
        'explanations',
        'generated_for',
        'is_active'
    ];
    
    
    protected $casts = [
        'schedule' => 'array',      
        'is_active' => 'boolean',
        'generated_for' => 'date'
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}