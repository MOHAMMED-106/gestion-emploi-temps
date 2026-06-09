<?php

namespace App\Http\Controllers;

use App\Models\OptimizedSchedule;
use App\Models\FixedEvent;
use App\Models\Preference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExportController extends Controller
{
    /**
     * Page d'export (React)
     */
    public function index()
    {
        $user = auth()->user();

        $activeSchedule = OptimizedSchedule::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        $allSchedules = OptimizedSchedule::where('user_id', $user->id)
            ->orderBy('generated_for', 'desc')
            ->get();

        $fixedEvents = FixedEvent::where('user_id', $user->id)->get();
        $preferences = Preference::where('user_id', $user->id)->first();

        return Inertia::render('Export/Index', [
            'activeSchedule' => $activeSchedule,
            'allSchedules'   => $allSchedules,
            'fixedEvents'    => $fixedEvents,
            'preferences'    => $preferences,
            'user'           => $user,
        ]);

    }

    /**
     * Export PDF - génère un HTML imprimable et le renvoie
     */
    public function exportPdf(Request $request)
    {
        $user = auth()->user();

        $scheduleId = $request->input('schedule_id');

        if ($scheduleId) {
            $schedule = OptimizedSchedule::where('id', $scheduleId)
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $schedule = OptimizedSchedule::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();
        }

        if (!$schedule) {
            return redirect()->back()->with('error', 'Aucun planning trouvé. Veuillez d\'abord générer un planning.');
        }

        $fixedEvents = FixedEvent::where('user_id', $user->id)->get();

        $html = $this->generatePdfHtml($schedule, $fixedEvents, $user);

        return response($html, 200)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    /**
     * Export Excel (CSV compatible Excel)
     */
    public function exportExcel(Request $request)
    {
        $user = auth()->user();

        $scheduleId = $request->input('schedule_id');

        if ($scheduleId) {
            $schedule = OptimizedSchedule::where('id', $scheduleId)
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $schedule = OptimizedSchedule::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();
        }

        if (!$schedule) {
            return redirect()->back()->with('error', 'Aucun planning trouvé.');
        }

        $csv = $this->generateCsv($schedule, $user);

        $filename = 'planning_' . $schedule->type . '_' . now()->format('Y-m-d') . '.csv';

        return response($csv, 200)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    // ─────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────

    private function generatePdfHtml($schedule, $fixedEvents, $user)
    {
        $details = $schedule->schedule['details'] ?? [];
        $resume  = $schedule->schedule['resume']  ?? [];
        $jours   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

        $typeLabels = [
            'intensif'  => ['label'=>'Intensif',   'color'=>'#EF4444'],
            'equilibre' => ['label'=>'Équilibré',  'color'=>'#10B981'],
            'leger'     => ['label'=>'Léger',      'color'=>'#3B82F6'],
        ];
        $cfg = $typeLabels[$schedule->type] ?? $typeLabels['equilibre'];

        $rowsHtml = '';
        foreach ($jours as $jour) {
            $jourData = $details[$jour] ?? null;
            if (!$jourData) continue;

            $coursHtml = '';
            foreach (($jourData['cours_fixes'] ?? []) as $c) {
                $start = substr($c['start_time'] ?? '', 0, 5);
                $end   = substr($c['end_time']   ?? '', 0, 5);
                $coursHtml .= "<span class='tag tag-cours'>📘 {$c['title']} {$start}–{$end}</span>";
            }

            $sessionsHtml = '';
            foreach (($jourData['sessions_etude'] ?? []) as $sess) {
                $start = substr($sess['debut'] ?? '', 0, 5);
                $end   = substr($sess['fin']   ?? '', 0, 5);
                $sessionsHtml .= "<span class='tag tag-study'>{$start}–{$end} · {$sess['matiere']}</span>";
            }

            $total = $jourData['total_heures_etude'] ?? 0;

            $rowsHtml .= "
            <tr>
                <td class='day-cell'>{$jour}</td>
                <td>{$coursHtml}</td>
                <td>{$sessionsHtml}</td>
                <td class='center'><strong>{$total}h</strong></td>
            </tr>";
        }

        $totalH     = $resume['total_heures_semaine'] ?? 0;
        $sessions   = $resume['sessions_totales']     ?? 0;
        $moyenne    = $resume['moyenne_par_jour']     ?? 0;
        $typeLabel  = $cfg['label'];
        $typeColor  = $cfg['color'];
        $genDate    = now()->format('d/m/Y à H:i');
        $userName   = $user->name;
        $userEmail  = $user->email;

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Planning SmartPlanner – {$typeLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#111827; font-size:13px; }
  .page { max-width:900px; margin:0 auto; padding:32px; }

  /* Header */
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #F3F4F6; }
  .logo { display:flex; align-items:center; gap:10px; }
  .logo-icon { width:36px; height:36px; background:#4F46E5; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; }
  .logo-text { font-size:20px; font-weight:800; color:#111827; letter-spacing:-0.02em; }
  .meta { text-align:right; font-size:12px; color:#6B7280; }
  .meta strong { color:#111827; }

  /* Badge type */
  .type-badge { display:inline-block; background:{$typeColor}; color:#fff; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; margin-bottom:16px; }

  /* Stats */
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
  .stat { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:14px 16px; text-align:center; }
  .stat-value { font-size:22px; font-weight:800; color:#111827; }
  .stat-label { font-size:11px; color:#9CA3AF; margin-top:2px; }

  /* Table */
  table { width:100%; border-collapse:collapse; }
  thead th { background:#F9FAFB; padding:10px 12px; text-align:left; font-size:11px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em; border-bottom:2px solid #E5E7EB; }
  tbody tr { border-bottom:1px solid #F3F4F6; }
  tbody tr:hover { background:#FAFAFA; }
  td { padding:10px 12px; vertical-align:top; }
  .day-cell { font-weight:700; color:#111827; white-space:nowrap; }
  .center { text-align:center; }

  /* Tags */
  .tag { display:inline-block; padding:3px 8px; border-radius:6px; font-size:11px; margin:2px 2px 2px 0; }
  .tag-cours { background:#EEF2FF; color:#4338CA; }
  .tag-study { background:#F0FDF4; color:#15803D; }

  /* Footer */
  .footer { margin-top:28px; padding-top:16px; border-top:1px solid #F3F4F6; display:flex; justify-content:space-between; font-size:11px; color:#9CA3AF; }

  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .no-print { display:none; }
    .page { padding:16px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Print button (hidden on print) -->
  <div class="no-print" style="text-align:right;margin-bottom:16px;">
    <button onclick="window.print()" style="background:#4F46E5;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
      🖨️ Imprimer / Sauvegarder PDF
    </button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="logo">
      <div class="logo-icon">⚡</div>
      <span class="logo-text">SmartPlanner</span>
    </div>
    <div class="meta">
      <div><strong>{$userName}</strong></div>
      <div>{$userEmail}</div>
      <div>Généré le {$genDate}</div>
    </div>
  </div>

  <span class="type-badge">Planning {$typeLabel}</span>
  <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:16px;">Planning hebdomadaire</h2>

  <!-- Stats -->
  <div class="stats">
    <div class="stat">
      <div class="stat-value">{$totalH}h</div>
      <div class="stat-label">Total / semaine</div>
    </div>
    <div class="stat">
      <div class="stat-value">{$sessions}</div>
      <div class="stat-label">Sessions d'étude</div>
    </div>
    <div class="stat">
      <div class="stat-value">{$moyenne}h</div>
      <div class="stat-label">Moyenne / jour</div>
    </div>
  </div>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th>Jour</th>
        <th>Cours fixes</th>
        <th>Sessions d'étude</th>
        <th>Total étude</th>
      </tr>
    </thead>
    <tbody>
      {$rowsHtml}
    </tbody>
  </table>

  <!-- Footer -->
  <div class="footer">
    <span>SmartPlanner – Planning d'étude intelligent</span>
    <span>Exporté le {$genDate}</span>
  </div>

</div>
</body>
</html>
HTML;
    }

    private function generateCsv($schedule, $user)
    {
        $details = $schedule->schedule['details'] ?? [];
        $resume  = $schedule->schedule['resume']  ?? [];
        $jours   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

        // BOM UTF-8 pour Excel
        $csv = "\xEF\xBB\xBF";

        // Infos générales
        $csv .= "SmartPlanner – Export Planning\n";
        $csv .= "Étudiant:,{$user->name}\n";
        $csv .= "Email:,{$user->email}\n";
        $csv .= "Type:,{$schedule->type}\n";
        $csv .= "Date export:," . now()->format('d/m/Y H:i') . "\n\n";

        // Résumé
        $csv .= "RÉSUMÉ\n";
        $csv .= "Total heures / semaine:,{$resume['total_heures_semaine']}h\n";
        $csv .= "Sessions totales:,{$resume['sessions_totales']}\n";
        $csv .= "Moyenne par jour:,{$resume['moyenne_par_jour']}h\n\n";

        // Détail
        $csv .= "DÉTAIL PAR JOUR\n";
        $csv .= "Jour,Type,Titre,Début,Fin,Durée\n";

        foreach ($jours as $jour) {
            $jourData = $details[$jour] ?? null;
            if (!$jourData) continue;

            foreach (($jourData['cours_fixes'] ?? []) as $c) {
                $title = str_replace(',', ';', $c['title'] ?? '');
                $start = substr($c['start_time'] ?? '', 0, 5);
                $end   = substr($c['end_time']   ?? '', 0, 5);
                $csv  .= "{$jour},Cours fixe,{$title},{$start},{$end},\n";
            }

            foreach (($jourData['sessions_etude'] ?? []) as $sess) {
                $matiere = str_replace(',', ';', $sess['matiere'] ?? '');
                $start   = substr($sess['debut'] ?? '', 0, 5);
                $end     = substr($sess['fin']   ?? '', 0, 5);
                $duree   = ($sess['duree'] ?? 0) . ' min';
                $csv    .= "{$jour},Session étude,{$matiere},{$start},{$end},{$duree}\n";
            }
        }

        return $csv;
    }
}
