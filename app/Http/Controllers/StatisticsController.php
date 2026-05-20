<?php

namespace App\Http\Controllers;

use App\Models\OptimizedSchedule;
use App\Models\FixedEvent;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $schedules = OptimizedSchedule::where('user_id', $user->id)
            ->orderBy('is_active', 'desc')
            ->get();

        $fixedEvents = FixedEvent::where('user_id', $user->id)->get();

        return Inertia::render('Statistics', [
            'schedules'   => $schedules,
            'fixedEvents' => $fixedEvents,
            'user'        => $user,
        ]);
    }
}
