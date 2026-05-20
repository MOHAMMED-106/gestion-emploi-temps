<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleGeneratorController;
use App\Http\Controllers\FixedEventController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\ExportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StatisticsController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Route d'accueil
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// Dashboard — avec données
Route::get('/dashboard', function () {
    $user = auth()->user();

    $activeSchedule = \App\Models\OptimizedSchedule::where('user_id', $user->id)
        ->where('is_active', true)
        ->first();

    $scheduleItems = [];

    if ($activeSchedule && isset($activeSchedule->schedule['details'])) {
        foreach ($activeSchedule->schedule['details'] as $day => $data) {
            $dayKey = match($day) {
                'Lundi'    => 'monday',
                'Mardi'    => 'tuesday',
                'Mercredi' => 'wednesday',
                'Jeudi'    => 'thursday',
                'Vendredi' => 'friday',
                'Samedi'   => 'saturday',
                'Dimanche' => 'sunday',
                default    => strtolower($day),
            };

foreach (($data['cours_fixes'] ?? []) as $c) {
    $scheduleItems[] = [
        'id'          => $c['id'] ?? uniqid(),
        'title'       => $c['title'],
        'start_time'  => substr($c['start_time'], 0, 5),
        'end_time'    => substr($c['end_time'], 0, 5),
        'day_of_week' => $dayKey,
        'type'        => 'fixed',
    ];
}

foreach (($data['sessions_etude'] ?? []) as $s) {
    $scheduleItems[] = [
        'id'          => uniqid(),
        'title'       => $s['matiere'],
        'start_time'  => substr($s['debut'], 0, 5),
        'end_time'    => substr($s['fin'], 0, 5),
        'day_of_week' => $dayKey,
        'type'        => 'study',
    ];
}
        }
    }

    $fixedEvents = \App\Models\FixedEvent::where('user_id', $user->id)->get();

    return Inertia::render('Dashboard', [
        'scheduleItems' => $scheduleItems,
        'fixedEvents'   => $fixedEvents,
        'user'          => $user,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');


// Routes protégées par authentification
Route::middleware('auth')->group(function () {
   

Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics.index');

    // ── Profil ──────────────────────────────────────────────
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Export ──────────────────────────────────────────────
    Route::get('/export',       [ExportController::class, 'index'])->name('export.index');
    Route::get('/export/pdf',   [ExportController::class, 'exportPdf'])->name('export.pdf');
    Route::get('/export/excel', [ExportController::class, 'exportExcel'])->name('export.excel');

    // ── Plannings ───────────────────────────────────────────
    Route::get('/schedules',              [ScheduleGeneratorController::class, 'index'])->name('schedules.index');
    Route::post('/schedules/generate',    [ScheduleGeneratorController::class, 'generate'])->name('schedules.generate');
    Route::post('/schedules/activate/{id}', [ScheduleGeneratorController::class, 'activate'])->name('schedules.activate');
    Route::delete('/schedules/{id}',      [ScheduleGeneratorController::class, 'destroy'])->name('schedules.destroy');
    Route::get('/schedules/active',       [ScheduleGeneratorController::class, 'getActive'])->name('schedules.active');

    // ── Cours fixes ─────────────────────────────────────────
    Route::resource('fixed-events', FixedEventController::class)->only(['index', 'store', 'destroy']);

    // ── Préférences ─────────────────────────────────────────
    Route::get('/preferences',  [PreferenceController::class, 'index'])->name('preferences.index');
    Route::post('/preferences', [PreferenceController::class, 'store'])->name('preferences.store');

});

require __DIR__.'/auth.php';
