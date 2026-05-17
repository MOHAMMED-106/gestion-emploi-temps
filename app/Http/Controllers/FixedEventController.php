<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FixedEventController extends Controller
{
    public function index()
    {
        $fixedEvents = FixedEvent::where('user_id', auth()->id())->get();
        return Inertia::render('FixedEvents/Index', ['fixedEvents' => $fixedEvents]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'day_of_week' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        FixedEvent::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        return redirect()->back()->with('success', 'Cours ajouté !');
    }

    public function destroy($id)
    {
        $event = FixedEvent::where('user_id', auth()->id())->findOrFail($id);
        $event->delete();
        return redirect()->back()->with('success', 'Cours supprimé !');
    }
}