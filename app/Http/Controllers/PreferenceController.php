<?php

namespace App\Http\Controllers;

use App\Models\Preference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PreferenceController extends Controller
{
    public function index()
    {
        $preferences = Preference::where('user_id', auth()->id())->first();
        return Inertia::render('Preferences/Index', ['preferences' => $preferences]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'wake_up_time' => 'required',
            'sleep_time' => 'required',
            'study_preference' => 'required|string',
            'concentration_hours' => 'required|integer',
            'desired_free_time' => 'required|integer',
        ]);

        Preference::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'wake_up_time' => $request->wake_up_time,
                'sleep_time' => $request->sleep_time,
                'study_preference' => $request->study_preference,
                'concentration_hours' => $request->concentration_hours,
                'desired_free_time' => $request->desired_free_time,
            ]
        );

        return redirect()->back()->with('success', 'Préférences sauvegardées !');
    }
}