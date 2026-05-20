<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use App\Models\ScheduleItem;
use App\Models\Preference;
use App\Models\OptimizedSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScheduleGeneratorController extends Controller
{
    public function index()
    {
        $schedules = OptimizedSchedule::where('user_id', auth()->id())
            ->orderBy('generated_for', 'desc')
            ->orderBy('type')
            ->get();

        $activeSchedule = OptimizedSchedule::where('user_id', auth()->id())
            ->where('is_active', true)
            ->first();

        return Inertia::render('Schedules/Index', [
            'schedules'      => $schedules,
            'activeSchedule' => $activeSchedule,
        ]);
    }

    public function generate(Request $request)
    {
        $userId       = auth()->id();
        $generatedFor = $request->input('date', now()->toDateString());

        $fixedEvents = FixedEvent::where('user_id', $userId)->get();
        $tasks       = ScheduleItem::where('user_id', $userId)->get();
        $prefs       = Preference::where('user_id', $userId)->first();

        if ($fixedEvents->isEmpty() && $tasks->isEmpty()) {
            return redirect()->back()->with('error', 'Veuillez d\'abord ajouter des cours ou des tâches.');
        }

        // Delete old schedules for same date to avoid duplicates
        OptimizedSchedule::where('user_id', $userId)
            ->where('generated_for', $generatedFor)
            ->delete();

        $intensif  = $this->generateByType($fixedEvents, $tasks, $prefs, 'intensif');
        $equilibre = $this->generateByType($fixedEvents, $tasks, $prefs, 'equilibre');
        $leger     = $this->generateByType($fixedEvents, $tasks, $prefs, 'leger');

        $this->saveSchedule($userId, 'intensif',  $intensif,  $generatedFor);
        $this->saveSchedule($userId, 'equilibre', $equilibre, $generatedFor);
        $this->saveSchedule($userId, 'leger',     $leger,     $generatedFor);

        return redirect()->back()->with('success', 'Plannings générés avec succès pour le ' . Carbon::parse($generatedFor)->format('d/m/Y'));
    }

    public function activate($id)
    {
        $userId = auth()->id();
        DB::beginTransaction();
        try {
            OptimizedSchedule::where('user_id', $userId)->update(['is_active' => false]);
            $schedule = OptimizedSchedule::where('id', $id)->where('user_id', $userId)->firstOrFail();
            $schedule->update(['is_active' => true]);
            DB::commit();
            return redirect()->back()->with('success', 'Planning "' . $schedule->type . '" activé !');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de l\'activation.');
        }
    }

    public function destroy($id)
    {
        $schedule = OptimizedSchedule::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $schedule->delete();
        return redirect()->back()->with('success', 'Planning supprimé.');
    }

    public function getActive()
    {
        $activeSchedule = OptimizedSchedule::where('user_id', auth()->id())->where('is_active', true)->first();
        return response()->json($activeSchedule);
    }

    // ─────────────────────────────────────────────────────────────
    // CORE ALGORITHM
    // ─────────────────────────────────────────────────────────────

    private function generateByType($fixedEvents, $tasks, $prefs, $type)
    {
        $studyDurations = ['intensif' => 120, 'equilibre' => 60, 'leger' => 30];
        $maxSessions    = ['intensif' => 4,   'equilibre' => 3,  'leger' => 2];

        $wakeUpTime      = $prefs?->wake_up_time      ?? '07:00:00';
        $sleepTime       = $prefs?->sleep_time        ?? '23:00:00';
        $studyPreference = $prefs?->study_preference  ?? 'day';

        $jours        = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $schedule     = [];
        $lastSubjects = [];

        foreach ($jours as $jour) {
            $jourFixed = $fixedEvents->where('day_of_week', $jour);
            $jourTasks = $tasks->where('day_of_week', $jour);

            // Calculate free slots for this day
            $freeSlots = $this->calculateFreeSlots(
                $jourFixed, $wakeUpTime, $sleepTime, $studyPreference
            );

            $studySessions = [];
            $sessionsCount = 0;
            $totalMinutes  = 0;

            foreach ($freeSlots as $slot) {
                if ($sessionsCount >= $maxSessions[$type]) break;

                $slotDuration = $this->toMinutes($slot['end']) - $this->toMinutes($slot['start']);

                if ($slotDuration >= $studyDurations[$type]) {
                    $subjectData  = $this->suggestSubject($fixedEvents, $jour, $type, $lastSubjects);
                    $lastSubjects = $subjectData['lastSubjects'];

                    $debut = $slot['start'];
                    $fin   = $this->addMinutesToTime($slot['start'], $studyDurations[$type]);

                    $studySessions[] = [
                        'debut'          => $debut,
                        'fin'            => $fin,
                        'duree'          => $studyDurations[$type],
                        'duree_formattee'=> $studyDurations[$type] . ' min',
                        'matiere'        => $subjectData['subject'],
                    ];
                    $sessionsCount++;
                    $totalMinutes += $studyDurations[$type];
                }
            }

            $schedule[$jour] = [
                'jour'               => $jour,
                'cours_fixes'        => $jourFixed->map(fn($e) => [
                    'id'         => $e->id,
                    'title'      => $e->title,
                    'start_time' => $e->start_time,
                    'end_time'   => $e->end_time,
                    'location'   => $e->location ?? null,
                ])->values(),
                'taches'             => $jourTasks->map(fn($t) => [
                    'id'         => $t->id,
                    'title'      => $t->title,
                    'start_time' => $t->start_time,
                    'end_time'   => $t->end_time,
                    'type'       => $t->type ?? 'task',
                ])->values(),
                'sessions_etude'     => $studySessions,
                'total_heures_etude' => round($totalMinutes / 60, 1),
                'total_minutes'      => $totalMinutes,
            ];
        }

        $totalStudyHours = array_sum(array_column($schedule, 'total_heures_etude'));
        $totalSessions   = array_sum(array_map(fn($j) => count($j['sessions_etude']), $schedule));

        return [
            'type'         => $type,
            'generated_at' => now()->toDateTimeString(),
            'details'      => $schedule,
            'resume'       => [
                'total_heures_semaine' => round($totalStudyHours, 1),
                'moyenne_par_jour'     => round($totalStudyHours / 6, 1),
                'sessions_totales'     => $totalSessions,
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // FREE SLOTS — Fixed Carbon bug (no more min/max on objects)
    // ─────────────────────────────────────────────────────────────

    private function calculateFreeSlots($fixedEvents, $wakeUpTime, $sleepTime, $studyPreference)
    {
        // Define study windows based on preference
        if ($studyPreference === 'morning') {
            $windows = [
                [$wakeUpTime, '12:00:00'],
                ['13:00:00',  '18:00:00'],
            ];
        } elseif ($studyPreference === 'night') {
            $windows = [
                ['13:00:00', '18:00:00'],
                ['19:00:00', $sleepTime],
            ];
        } else {
            // day / journée
            $windows = [
                [$wakeUpTime, '12:00:00'],
                ['13:00:00',  '18:00:00'],
                ['19:00:00',  $sleepTime],
            ];
        }

        $freeSlots = [];

        foreach ($windows as [$winStart, $winEnd]) {
            $winStartMin = $this->toMinutes($winStart);
            $winEndMin   = $this->toMinutes($winEnd);

            // Sort fixed events by start time
            $events = $fixedEvents->sortBy('start_time')->values();

            // Build list of busy intervals inside this window
            $busyIntervals = [];
            foreach ($events as $event) {
                $eStart = $this->toMinutes($event->start_time);
                $eEnd   = $this->toMinutes($event->end_time);

                // Clamp to window
                $eStart = max($eStart, $winStartMin);
                $eEnd   = min($eEnd,   $winEndMin);

                if ($eStart < $eEnd) {
                    $busyIntervals[] = [$eStart, $eEnd];
                }
            }

            // Find free slots = gaps between busy intervals
            $cursor = $winStartMin;

            foreach ($busyIntervals as [$bStart, $bEnd]) {
                if ($cursor < $bStart) {
                    $freeSlots[] = [
                        'start' => $this->toTimeString($cursor),
                        'end'   => $this->toTimeString($bStart),
                    ];
                }
                if ($bEnd > $cursor) {
                    $cursor = $bEnd;
                }
            }

            // Last free slot after last event
            if ($cursor < $winEndMin) {
                $freeSlots[] = [
                    'start' => $this->toTimeString($cursor),
                    'end'   => $this->toTimeString($winEndMin),
                ];
            }
        }

        return $freeSlots;
    }

    // ─────────────────────────────────────────────────────────────
    // SUBJECT SUGGESTION
    // ─────────────────────────────────────────────────────────────

private function suggestSubject($fixedEvents, $jour, $type, &$lastSubjects)
{
    // Toutes les matières de TOUS les jours (pas seulement ce jour)
    $allSubjects = $fixedEvents->pluck('title')->unique()->values()->toArray();

    if (empty($allSubjects)) {
        $allSubjects = ['Mathématiques', 'Français', 'Anglais', 'Physique', 'Informatique'];
    }

    // Priorité : matière du jour suivant (pour préparer le prochain cours)
    $joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    $indexJour = array_search($jour, $joursOrdre);
    $jourSuivant = $joursOrdre[($indexJour + 1) % 6] ?? null;
    
    $matiereJourSuivant = null;
    if ($jourSuivant) {
        $coursJourSuivant = $fixedEvents->where('day_of_week', $jourSuivant)->pluck('title')->toArray();
        if (!empty($coursJourSuivant)) {
            $matiereJourSuivant = $coursJourSuivant[0];
        }
    }

    // Éviter les répétitions - choisir une matière différente des 2 dernières
    $available = array_values(array_diff($allSubjects, $lastSubjects));

    if (empty($available)) {
        $lastSubjects = [];
        $available = $allSubjects;
    }

    // Préférer la matière du jour suivant si disponible
    if ($matiereJourSuivant && in_array($matiereJourSuivant, $available)) {
        $selected = $matiereJourSuivant;
    } else {
        $selected = $available[array_rand($available)];
    }

    $lastSubjects[] = $selected;
    if (count($lastSubjects) > 2) array_shift($lastSubjects);

    $prefix = match($type) {
        'intensif' => '🎯 Approfondissement : ',
        'leger'    => '📖 Révision rapide : ',
        default    => '📚 Étude : ',
    };

    return ['subject' => $prefix . $selected, 'lastSubjects' => $lastSubjects];
}

    // ─────────────────────────────────────────────────────────────
    // HELPERS — Pure integer math, no Carbon bugs
    // ─────────────────────────────────────────────────────────────

    /** "08:30:00" → 510 (minutes since midnight) */
    private function toMinutes(string $time): int
    {
        $parts = explode(':', $time);
        return (int)$parts[0] * 60 + (int)$parts[1];
    }

    /** 510 → "08:30:00" */
    private function toTimeString(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d:00', $h, $m);
    }

    /** Add minutes to a time string */
    private function addMinutesToTime(string $time, int $minutes): string
    {
        return $this->toTimeString($this->toMinutes($time) + $minutes);
    }

    // ─────────────────────────────────────────────────────────────
    // SAVE
    // ─────────────────────────────────────────────────────────────

    private function saveSchedule($userId, $type, $schedule, $generatedFor)
    {
        OptimizedSchedule::updateOrCreate(
            ['user_id' => $userId, 'type' => $type, 'generated_for' => $generatedFor],
            [
                'schedule'     => $schedule,
                'explanations' => "Planning $type généré le " . now()->format('d/m/Y à H:i'),
                'is_active'    => false,
            ]
        );
    }
}
