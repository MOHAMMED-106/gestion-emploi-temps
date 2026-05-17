<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleGeneratorController;
use App\Http\Controllers\FixedEventController;
use App\Http\Controllers\PreferenceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Route d'accueil (page welcome)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route du dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Routes protégées par authentification
Route::middleware('auth')->group(function () {
    // Routes de profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // ==============================================
    // ROUTES POUR LES PLANNINGS
    // ==============================================
    Route::get('/schedules', [ScheduleGeneratorController::class, 'index'])->name('schedules.index');
    Route::post('/schedules/generate', [ScheduleGeneratorController::class, 'generate'])->name('schedules.generate');
    Route::post('/schedules/activate/{id}', [ScheduleGeneratorController::class, 'activate'])->name('schedules.activate');
    Route::delete('/schedules/{id}', [ScheduleGeneratorController::class, 'destroy'])->name('schedules.destroy');
    Route::get('/schedules/active', [ScheduleGeneratorController::class, 'getActive'])->name('schedules.active');
    
    // ==============================================
    // ROUTES POUR LES COURS FIXES
    // ==============================================
    Route::resource('fixed-events', FixedEventController::class)->only(['index', 'store', 'destroy']);
    
    // ==============================================
    // ROUTES POUR LES PRÉFÉRENCES
    // ==============================================
    Route::get('/preferences', [PreferenceController::class, 'index'])->name('preferences.index');
    Route::post('/preferences', [PreferenceController::class, 'store'])->name('preferences.store');
});

// Inclure les routes d'authentification
require __DIR__.'/auth.php';