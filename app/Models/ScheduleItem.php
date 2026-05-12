<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'day_of_week', 'start_time', 'end_time', 'type', 'is_from_fixed'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}