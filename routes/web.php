<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleGeneratorController;
use App\Http\Controllers\FixedEventController;
use App\Http\Controllers\PreferenceController;
use Carbon\Carbon;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Page d'accueil
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// Dashboard (protégé)
Route::get('/dashboard', function () {
    $user = auth()->user();

    $activeSchedule = \App\Models\OptimizedSchedule::where('user_id', $user->id)
        ->where('is_active', true)
        ->first();

    $schedules = \App\Models\OptimizedSchedule::where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    // French day names used as keys in the schedule JSON
    $frDayMap = [
        1 => 'Lundi',
        2 => 'Mardi',
        3 => 'Mercredi',
        4 => 'Jeudi',
        5 => 'Vendredi',
        6 => 'Samedi',
        7 => 'Dimanche', // Sunday — no sessions, but map it cleanly
    ];

    $todayName    = $frDayMap[Carbon::now()->isoWeekday()]    ?? null;
    $tomorrowName = $frDayMap[Carbon::now()->addDay()->isoWeekday()] ?? null;

    $todaySessions    = [];
    $tomorrowSessions = [];
    $weekSummary      = [
        'Lundi' => 0, 'Mardi' => 0, 'Mercredi' => 0,
        'Jeudi' => 0, 'Vendredi' => 0, 'Samedi' => 0,
    ];

    if ($activeSchedule) {
        $details = $activeSchedule->schedule['details'] ?? [];

        foreach (array_keys($weekSummary) as $jour) {
            $weekSummary[$jour] = count($details[$jour]['sessions_etude'] ?? []);
        }

        if ($todayName && isset($details[$todayName])) {
            $todaySessions = $details[$todayName]['sessions_etude'] ?? [];
        }
        if ($tomorrowName && isset($details[$tomorrowName])) {
            $tomorrowSessions = $details[$tomorrowName]['sessions_etude'] ?? [];
        }
    }

    return Inertia::render('Dashboard', [
        'activeSchedule'   => $activeSchedule,
        'schedules'        => $schedules,
        'fixedEventsCount' => \App\Models\FixedEvent::where('user_id', $user->id)->count(),
        'todaySessions'    => $todaySessions,
        'tomorrowSessions' => $tomorrowSessions,
        'weekSummary'      => $weekSummary,
        'todayName'        => $todayName,
        'tomorrowName'     => $tomorrowName,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Routes protégées par authentification
Route::middleware('auth')->group(function () {

    // ROUTES POUR LES COURS FIXES
    Route::resource('fixed-events', FixedEventController::class)
        ->only(['index', 'store', 'destroy']);

    // ROUTES POUR LES PRÉFÉRENCES
    Route::get('/preferences',  [PreferenceController::class, 'index'])->name('preferences.index');
    Route::post('/preferences', [PreferenceController::class, 'store'])->name('preferences.store');

    // ROUTES POUR LES PLANNINGS
    Route::get('/schedules',                          [ScheduleGeneratorController::class, 'index'])->name('schedules.index');
    Route::post('/schedules/generate',                [ScheduleGeneratorController::class, 'generate'])->name('schedules.generate');
    Route::post('/schedules/activate/{id}',           [ScheduleGeneratorController::class, 'activate'])->name('schedules.activate');
    Route::delete('/schedules/{id}',                  [ScheduleGeneratorController::class, 'destroy'])->name('schedules.destroy');
    Route::get('/schedules/active',                   [ScheduleGeneratorController::class, 'getActive'])->name('schedules.active');
    Route::post('/schedules/{id}/move-session',       [ScheduleGeneratorController::class, 'moveSession'])->name('schedules.moveSession');

    // ROUTES POUR LE PROFIL
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
