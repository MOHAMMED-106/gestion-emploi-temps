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
    /**
     * Afficher la page des plannings
     */
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
            'schedules' => $schedules,
            'activeSchedule' => $activeSchedule
        ]);
    }
    
    /**
     * Générer les 3 types de plannings
     */
    public function generate(Request $request)
    {
        $userId = auth()->id();
        
        // Récupérer la date (aujourd'hui ou date personnalisée)
        $generatedFor = $request->input('date', now()->toDateString());
        
        // Récupérer les données input
        $fixedEvents = FixedEvent::where('user_id', $userId)->get();
        $tasks = ScheduleItem::where('user_id', $userId)->get();
        $prefs = Preference::where('user_id', $userId)->first();
        
        // Vérifier si l'utilisateur a des données
        if ($fixedEvents->isEmpty() && $tasks->isEmpty()) {
            return redirect()->back()->with('error', 'Veuillez d\'abord ajouter des cours ou des tâches.');
        }
        
        // Générer 3 types de planning
        $intensif = $this->generateByType($fixedEvents, $tasks, $prefs, 'intensif');
        $equilibre = $this->generateByType($fixedEvents, $tasks, $prefs, 'equilibre');
        $leger = $this->generateByType($fixedEvents, $tasks, $prefs, 'leger');
        
        // Sauvegarder avec date
        $this->saveSchedule($userId, 'intensif', $intensif, $generatedFor);
        $this->saveSchedule($userId, 'equilibre', $equilibre, $generatedFor);
        $this->saveSchedule($userId, 'leger', $leger, $generatedFor);
        
        return redirect()->back()->with('success', 'Plannings générés avec succès pour le ' . Carbon::parse($generatedFor)->format('d/m/Y'));
    }
    
    /**
     * Activer un planning spécifique
     */
    public function activate($id)
    {
        $userId = auth()->id();
        
        DB::beginTransaction();
        try {
            // Désactiver tous les plannings de l'utilisateur
            OptimizedSchedule::where('user_id', $userId)->update(['is_active' => false]);
            
            // Activer le planning choisi
            $schedule = OptimizedSchedule::where('id', $id)
                ->where('user_id', $userId)
                ->firstOrFail();
            
            $schedule->update(['is_active' => true]);
            
            DB::commit();
            return redirect()->back()->with('success', 'Planning "' . $schedule->type . '" activé !');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de l\'activation du planning.');
        }
    }
    
    /**
     * Supprimer un planning
     */
    public function destroy($id)
    {
        $schedule = OptimizedSchedule::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();
        
        $schedule->delete();
        
        return redirect()->back()->with('success', 'Planning supprimé avec succès.');
    }
    
    /**
     * Récupérer le planning actif (API)
     */
    public function getActive()
    {
        $activeSchedule = OptimizedSchedule::where('user_id', auth()->id())
            ->where('is_active', true)
            ->first();
        
        return response()->json($activeSchedule);
    }
    
    /**
     * Algorithme de génération selon le type
     */
    private function generateByType($fixedEvents, $tasks, $prefs, $type)
    {
        // Durée d'étude par session selon le type
        $studyDurations = [
            'intensif' => 120,   // 2 heures
            'equilibre' => 60,   // 1 heure
            'leger' => 30        // 30 minutes
        ];
        
        // Nombre max de sessions par jour
        $maxSessions = [
            'intensif' => 4,
            'equilibre' => 3,
            'leger' => 2
        ];
        
        // Récupérer les préférences utilisateur
        $wakeUpTime = $prefs?->wake_up_time ?? '08:00:00';
        $sleepTime = $prefs?->sleep_time ?? '22:00:00';
        $studyPreference = $prefs?->study_preference ?? 'morning';
        
        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $schedule = [];
        
        // Garder une trace des matières déjà suggérées (rotation)
        $lastSubjects = [];
        
        foreach ($jours as $jour) {
            // Récupérer les cours fixes du jour
            $jourFixed = $fixedEvents->where('day_of_week', $jour);
            
            // Récupérer les tâches du jour
            $jourTasks = $tasks->where('day_of_week', $jour);
            
            // Calculer les créneaux libres selon les préférences
            $freeSlots = $this->calculateFreeSlots($jourFixed, $prefs, $wakeUpTime, $sleepTime, $studyPreference);
            
            // Ajouter les sessions d'étude
            $studySessions = [];
            $sessionsCount = 0;
            $totalMinutes = 0;
            
            foreach ($freeSlots as $slot) {
                if ($sessionsCount >= $maxSessions[$type]) break;
                
                // Vérifier si le slot est assez long
                $slotDuration = $this->getDurationInMinutes($slot['start'], $slot['end']);
                if ($slotDuration >= $studyDurations[$type]) {
                    // Suggérer une matière avec rotation
                    $subjectData = $this->suggestSubject($fixedEvents, $jour, $type, $lastSubjects);
                    $lastSubjects = $subjectData['lastSubjects'];
                    
                    $studySessions[] = [
                        'debut' => $slot['start'],
                        'fin' => $this->addMinutes($slot['start'], $studyDurations[$type]),
                        'duree' => $studyDurations[$type],
                        'duree_formattee' => $studyDurations[$type] . ' min',
                        'matiere' => $subjectData['subject']
                    ];
                    $sessionsCount++;
                    $totalMinutes += $studyDurations[$type];
                }
            }
            
            // 🔥 AMÉLIORATION : Nettoyer les données pour JSON
            $schedule[$jour] = [
                'jour' => $jour,
                'cours_fixes' => $jourFixed->map(fn($e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'start_time' => $e->start_time,
                    'end_time' => $e->end_time,
                    'location' => $e->location ?? null
                ])->values(),
                'taches' => $jourTasks->map(fn($t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                    'start_time' => $t->start_time,
                    'end_time' => $t->end_time,
                    'type' => $t->type ?? 'task'
                ])->values(),
                'sessions_etude' => $studySessions,
                'total_heures_etude' => round($totalMinutes / 60, 1),
                'total_minutes' => $totalMinutes
            ];
        }
        
        // Ajouter un résumé global
        $totalStudyHours = array_sum(array_column($schedule, 'total_heures_etude'));
        $totalSessions = array_sum(array_map(fn($j) => count($j['sessions_etude']), $schedule));
        
        return [
            'type' => $type,
            'generated_at' => now()->toDateTimeString(),
            'details' => $schedule,
            'resume' => [
                'total_heures_semaine' => round($totalStudyHours, 1),
                'moyenne_par_jour' => round($totalStudyHours / 6, 1),
                'sessions_totales' => $totalSessions
            ]
        ];
    }
    
    /**
     * Calculer les créneaux libres (AMÉLIORÉ avec Carbon)
     */
    private function calculateFreeSlots($fixedEvents, $prefs, $wakeUpTime, $sleepTime, $studyPreference)
    {
        $freeSlots = [];
        
        // Définir les créneaux selon la préférence d'étude
        if ($studyPreference === 'morning') {
            $slotsConfig = [
                ['start' => $wakeUpTime, 'end' => '12:00:00'],
                ['start' => '14:00:00', 'end' => '18:00:00']
            ];
        } elseif ($studyPreference === 'night') {
            $slotsConfig = [
                ['start' => '14:00:00', 'end' => '18:00:00'],
                ['start' => '20:00:00', 'end' => $sleepTime]
            ];
        } else {
            $slotsConfig = [
                ['start' => '09:00:00', 'end' => '12:00:00'],
                ['start' => '14:00:00', 'end' => '18:00:00'],
                ['start' => '20:00:00', 'end' => '22:00:00']
            ];
        }
        
        // 🔥 AMÉLIORATION : Utilisation de Carbon pour comparer les heures
        foreach ($slotsConfig as $slot) {
            $slotStart = Carbon::createFromFormat('H:i:s', $slot['start']);
            $slotEnd = Carbon::createFromFormat('H:i:s', $slot['end']);
            
            $currentStart = clone $slotStart;
            
            // Trier les événements fixes par heure de début
            $sortedEvents = $fixedEvents->sortBy('start_time');
            
            foreach ($sortedEvents as $event) {
                $eventStart = Carbon::createFromFormat('H:i:s', $event->start_time);
                $eventEnd = Carbon::createFromFormat('H:i:s', $event->end_time);
                
                // Si le créneau libre commence avant l'événement
                if ($currentStart < $eventStart) {
                    $freeEnd = min($slotEnd, $eventStart);
                    if ($currentStart < $freeEnd) {
                        $freeSlots[] = [
                            'start' => $currentStart->format('H:i:s'),
                            'end' => $freeEnd->format('H:i:s')
                        ];
                    }
                }
                
                // Déplacer le curseur après l'événement
                $currentStart = max($currentStart, $eventEnd);
                if ($currentStart >= $slotEnd) break;
            }
            
            // Ajouter le dernier créneau après le dernier événement
            if ($currentStart < $slotEnd) {
                $freeSlots[] = [
                    'start' => $currentStart->format('H:i:s'),
                    'end' => $slotEnd->format('H:i:s')
                ];
            }
        }
        
        return $freeSlots;
    }
    
    /**
     * Suggérer une matière (AMÉLIORÉ avec rotation)
     */
    private function suggestSubject($fixedEvents, $jour, $type = 'equilibre', &$lastSubjects = [])
    {
        // Récupérer toutes les matières des cours
        $subjects = $fixedEvents
            ->where('day_of_week', $jour)
            ->pluck('title')
            ->toArray();
        
        // Si pas de matières pour ce jour, prendre les matières de tous les cours
        if (empty($subjects)) {
            $subjects = $fixedEvents->pluck('title')->unique()->toArray();
        }
        
        // Si toujours pas de matières, utiliser des matières par défaut
        if (empty($subjects)) {
            $defaultSubjects = [
                'Mathématiques', 'Français', 'Anglais', 'Physique', 
                'Histoire', 'SVT', 'Philosophie', 'Informatique'
            ];
            $subjects = $defaultSubjects;
        }
        
        // Éviter les répétitions (rotation)
        $availableSubjects = array_diff($subjects, $lastSubjects);
        
        if (empty($availableSubjects)) {
            $lastSubjects = [];
            $availableSubjects = $subjects;
        }
        
        // Choisir une matière aléatoire
        $selectedSubject = $availableSubjects[array_rand($availableSubjects)];
        
        // Mettre à jour l'historique
        $lastSubjects[] = $selectedSubject;
        if (count($lastSubjects) > 3) {
            array_shift($lastSubjects);
        }
        
        // Ajouter un préfixe selon le type de planning
        $prefix = match($type) {
            'intensif' => '🎯 Approfondissement : ',
            'leger' => '📖 Révision rapide : ',
            default => '📚 Étude : '
        };
        
        return [
            'subject' => $prefix . $selectedSubject,
            'lastSubjects' => $lastSubjects
        ];
    }
    
    /**
     * Calculer durée en minutes (AMÉLIORÉ avec Carbon)
     */
    private function getDurationInMinutes($start, $end)
    {
        $startTime = Carbon::createFromFormat('H:i:s', $start);
        $endTime = Carbon::createFromFormat('H:i:s', $end);
        return $endTime->diffInMinutes($startTime);
    }
    
    /**
     * Ajouter des minutes à une heure (AMÉLIORÉ avec Carbon)
     */
    private function addMinutes($time, $minutes)
    {
        $carbonTime = Carbon::createFromFormat('H:i:s', $time);
        $carbonTime->addMinutes($minutes);
        return $carbonTime->format('H:i:s');
    }
    
    /**
     * Sauvegarder un planning (version professionnelle)
     */
    private function saveSchedule($userId, $type, $schedule, $generatedFor)
    {
        // 🔥 Plus besoin de json_encode, grâce au cast dans le modèle
        OptimizedSchedule::updateOrCreate(
            [
                'user_id' => $userId, 
                'type' => $type,
                'generated_for' => $generatedFor
            ],
            [
                'schedule' => $schedule,  // L'array, Laravel gère le JSON
                'explanations' => "Planning " . $type . " généré le " . now()->format('d/m/Y à H:i'),
                'is_active' => false
            ]
        );
    }
}