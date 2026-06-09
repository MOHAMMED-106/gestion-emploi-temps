<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use App\Models\Preference;
use App\Models\OptimizedSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleGeneratorController extends Controller
{
    public function index()
    {
        $schedules = OptimizedSchedule::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules
        ]);
    }

    public function generate(Request $request)
    {
        $userId = auth()->id();

        $fixedEvents = FixedEvent::where('user_id', $userId)->get();
        $prefs = Preference::where('user_id', $userId)->first();

        if ($fixedEvents->isEmpty()) {
            return redirect()->back()->with('error', 'Ajoutez des cours d\'abord !');
        }

        // Delete ALL previous schedules and regenerate fresh for the full week
        OptimizedSchedule::where('user_id', $userId)->delete();

        $intensif  = $this->generateByType($fixedEvents, $prefs, 'intensif');
        $equilibre = $this->generateByType($fixedEvents, $prefs, 'equilibre');
        $leger     = $this->generateByType($fixedEvents, $prefs, 'leger');

        $this->saveSchedule($userId, 'intensif',  $intensif);
        $this->saveSchedule($userId, 'equilibre', $equilibre);
        $this->saveSchedule($userId, 'leger',     $leger);

        return redirect()->back()->with('success', 'Plannings générés avec succès !');
    }

    private function generateByType($fixedEvents, $prefs, $type)
    {
        $studyDurations = [
            'intensif'  => 120,
            'equilibre' => 60,
            'leger'     => 30
        ];

        $maxSessions = [
            'intensif'  => 4,
            'equilibre' => 3,
            'leger'     => 2
        ];

        $wakeUpTime = $prefs?->wake_up_time ?? '08:00:00';
        $sleepTime  = $prefs?->sleep_time ?? '22:00:00';
        $studyPref  = $prefs?->study_preference ?? 'morning';

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $schedule = [];
        $lastSubjects = [];

        foreach ($jours as $jour) {
            $jourFixed = $fixedEvents->where('day_of_week', $jour);
            $freeSlots = $this->calculateFreeSlots($jourFixed, $wakeUpTime, $sleepTime);

            $studySessions = [];
            $sessionsCount = 0;
            $totalMinutes = 0;

            foreach ($freeSlots as $slot) {
                if ($sessionsCount >= $maxSessions[$type]) break;

                $slotDuration = $this->toMinutes($slot['end']) - $this->toMinutes($slot['start']);

                if ($slotDuration >= $studyDurations[$type]) {
                    $subjectData = $this->suggestSubject($fixedEvents, $jour, $type, $lastSubjects);
                    $lastSubjects = $subjectData['lastSubjects'];

                    $debut = $slot['start'];
                    $fin = $this->addMinutesToTime($debut, $studyDurations[$type]);

                    $studySessions[] = [
                        'debut'   => $debut,
                        'fin'     => $fin,
                        'duree'   => $studyDurations[$type],
                        'matiere' => $subjectData['subject'],
                    ];
                    $sessionsCount++;
                    $totalMinutes += $studyDurations[$type];
                }
            }

            $schedule[$jour] = [
                'cours_fixes'         => $jourFixed->values(),
                'sessions_etude'      => $studySessions,
                'total_heures_etude'  => round($totalMinutes / 60, 1),
            ];
        }

        return [
            'type'    => $type,
            'details' => $schedule,
            'resume'  => [
                'total_heures_semaine' => round(array_sum(array_column($schedule, 'total_heures_etude')), 1),
                'moyenne_par_jour'     => round(array_sum(array_column($schedule, 'total_heures_etude')) / 6, 1),
                'sessions_totales'     => array_sum(array_map(fn($j) => count($j['sessions_etude']), $schedule)),
            ],
        ];
    }

    private function calculateFreeSlots($fixedEvents, $wakeUpTime, $sleepTime)
    {
        $wake  = $this->toMinutes($wakeUpTime);
        $sleep = $this->toMinutes($sleepTime);

        if ($wake >= $sleep) {
            $wake  = 420;
            $sleep = 1380;
        }

        $occupied = [];
        foreach ($fixedEvents as $event) {
            $start = max($this->toMinutes($event->start_time), $wake);
            $end   = min($this->toMinutes($event->end_time), $sleep);
            if ($start < $end) {
                $occupied[] = ['start' => $start, 'end' => $end];
            }
        }

        usort($occupied, fn($a, $b) => $a['start'] - $b['start']);

        $merged = [];
        foreach ($occupied as $block) {
            if (empty($merged) || $block['start'] > $merged[count($merged)-1]['end']) {
                $merged[] = $block;
            } else {
                $merged[count($merged)-1]['end'] = max($merged[count($merged)-1]['end'], $block['end']);
            }
        }

        $freeSlots = [];
        $cursor = $wake;

        foreach ($merged as $block) {
            if ($block['start'] > $cursor) {
                $freeSlots[] = [
                    'start' => $this->minutesToTime($cursor),
                    'end'   => $this->minutesToTime($block['start']),
                ];
            }
            $cursor = max($cursor, $block['end']);
        }

        if ($cursor < $sleep) {
            $freeSlots[] = [
                'start' => $this->minutesToTime($cursor),
                'end'   => $this->minutesToTime($sleep),
            ];
        }

        return $freeSlots;
    }

    public function moveSession(Request $request, $id)
    {
        $schedule = OptimizedSchedule::where('user_id', auth()->id())->findOrFail($id);
        $data = $schedule->schedule;

        $jour     = $request->jour;
        $idx      = $request->session_index;
        $newStart = $request->new_start;

        $session  = $data['details'][$jour]['sessions_etude'][$idx];
        $duration = $session['duree'];

        $fixedEventsOnDay = FixedEvent::where('user_id', auth()->id())
            ->where('day_of_week', $jour)
            ->get();

        $newStartMinutes = $this->toMinutes($newStart);
        $newEndMinutes   = $newStartMinutes + $duration;

        foreach ($fixedEventsOnDay as $event) {
            $eventStart = $this->toMinutes($event->start_time);
            $eventEnd   = $this->toMinutes($event->end_time);
            if ($newStartMinutes < $eventEnd && $newEndMinutes > $eventStart) {
                return redirect()->back()->with('error', 'Ce créneau chevauche un cours fixe !');
            }
        }

        $session['debut'] = $newStart;
        $session['fin']   = $this->addMinutesToTime($newStart, $duration);
        $data['details'][$jour]['sessions_etude'][$idx] = $session;

        $totalMinutes = 0;
        foreach ($data['details'][$jour]['sessions_etude'] as $s) {
            $totalMinutes += $s['duree'];
        }
        $data['details'][$jour]['total_heures_etude'] = round($totalMinutes / 60, 1);

        $totalHeuresSemaine = 0;
        $totalSessions = 0;
        foreach ($data['details'] as $day) {
            $totalHeuresSemaine += $day['total_heures_etude'];
            $totalSessions      += count($day['sessions_etude']);
        }
        $data['resume']['total_heures_semaine'] = round($totalHeuresSemaine, 1);
        $data['resume']['moyenne_par_jour']     = round($totalHeuresSemaine / 6, 1);
        $data['resume']['sessions_totales']     = $totalSessions;

        $schedule->schedule = $data;
        $schedule->save();

        return redirect()->back()->with('success', 'Session déplacée avec succès !');
    }

    public function activate($id)
    {
        OptimizedSchedule::where('user_id', auth()->id())->update(['is_active' => false]);
        $schedule = OptimizedSchedule::where('user_id', auth()->id())->findOrFail($id);
        $schedule->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Planning activé avec succès !');
    }

    public function destroy($id)
    {
        $schedule = OptimizedSchedule::where('user_id', auth()->id())->findOrFail($id);
        $schedule->delete();

        return redirect()->back()->with('success', 'Planning supprimé avec succès !');
    }

    public function getActive()
    {
        $active = OptimizedSchedule::where('user_id', auth()->id())
            ->where('is_active', true)
            ->first();

        return response()->json($active);
    }

    private function saveSchedule($userId, $type, $data)
    {
        // Store Monday of the current week so filtering by week is easy
        $mondayOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString();

        OptimizedSchedule::create([
            'user_id'       => $userId,
            'type'          => $type,
            'schedule'      => $data,
            'generated_for' => $mondayOfWeek,
            'is_active'     => false,
        ]);
    }

    private function toMinutes($time)
    {
        if (is_string($time)) {
            $parts = explode(':', $time);
            return (int)$parts[0] * 60 + (int)$parts[1];
        }
        return $time;
    }

    private function minutesToTime($minutes)
    {
        $hours = floor($minutes / 60);
        $mins  = $minutes % 60;
        return sprintf('%02d:%02d', $hours, $mins);
    }

    private function addMinutesToTime($time, $minutes)
    {
        $totalMinutes = $this->toMinutes($time) + $minutes;
        return $this->minutesToTime($totalMinutes);
    }

    private function suggestSubject($fixedEvents, $jour, $type, &$lastSubjects)
    {
        $subjects = $fixedEvents->where('day_of_week', $jour)->pluck('title')->unique()->values()->toArray();

        if (empty($subjects)) {
            $allSubjects = $fixedEvents->pluck('title')->unique()->values()->toArray();
            $subjects = !empty($allSubjects) ? $allSubjects : ['Révision générale'];
        }

        $lastSubject = $lastSubjects[$jour] ?? null;
        if ($lastSubject && count($subjects) > 1) {
            $subjects = array_values(array_filter($subjects, fn($s) => $s !== $lastSubject));
        }

        $selected = $subjects[array_rand($subjects)];
        $lastSubjects[$jour] = $selected;

        return [
            'subject'      => $selected,
            'lastSubjects' => $lastSubjects
        ];
    }
}
