import { Head } from "@inertiajs/react";
import AppLayout from "@/Pages/AppLayout";

export default function Statistics({ schedules = [], fixedEvents = [], user }) {

    // ── Compute stats from all schedules ──────────────────
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const activeSchedule = schedules.find(s => s.is_active) ?? schedules[0];
    const details = activeSchedule?.schedule?.details ?? {};
    const resume  = activeSchedule?.schedule?.resume  ?? {};

    // Hours per day
    const hoursPerDay = jours.map(jour => ({
        day:   jour.slice(0, 3),
        hours: details[jour]?.total_heures_etude ?? 0,
        sessions: (details[jour]?.sessions_etude ?? []).length,
        cours: (details[jour]?.cours_fixes ?? []).length,
    }));

    const maxHours = Math.max(...hoursPerDay.map(d => d.hours), 1);

    // Best day
    const bestDay = hoursPerDay.reduce((a, b) => a.hours > b.hours ? a : b, hoursPerDay[0]);

    // Total sessions per type
    const typeStats = schedules.map(s => ({
        type:     s.type,
        hours:    s.schedule?.resume?.total_heures_semaine ?? 0,
        sessions: s.schedule?.resume?.sessions_totales ?? 0,
        active:   s.is_active,
    }));

    // Subjects from all sessions
    const subjectMap = {};
    jours.forEach(jour => {
        (details[jour]?.sessions_etude ?? []).forEach(sess => {
            const raw = sess.matiere ?? '';
            // Remove prefix emoji
            const name = raw.replace(/^[🎯📖📚]\s*[^:]*:\s*/, '').trim();
            subjectMap[name] = (subjectMap[name] ?? 0) + (sess.duree ?? 60);
        });
    });
    const subjects = Object.entries(subjectMap)
        .map(([name, minutes]) => ({ name, hours: Math.round(minutes / 60 * 10) / 10 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);

    const totalSubjectHours = subjects.reduce((s, x) => s + x.hours, 0) || 1;

    const typeConfig = {
        intensif:  { label: 'Intensif',  color: '#EF4444', bg: '#FEF2F2', icon: '🔥' },
        equilibre: { label: 'Équilibré', color: '#10B981', bg: '#ECFDF5', icon: '⚖️' },
        leger:     { label: 'Léger',     color: '#3B82F6', bg: '#EFF6FF', icon: '🍃' },
    };

    const dayColors = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6'];

    if (schedules.length === 0) {
        return (
            <AppLayout>
                <Head title="Statistiques" />
                <div style={s.page}>
                    <div style={s.empty}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <h2 style={s.emptyTitle}>Aucune statistique disponible</h2>
                        <p style={s.emptySub}>Générez d'abord un planning pour voir vos statistiques</p>
                        <a href="/schedules" style={s.emptyBtn}>Générer un planning →</a>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Statistiques" />
            <div style={s.page}>

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}>Statistiques</h1>
                        <p style={s.subtitle}>Analyse de votre planning d'étude</p>
                    </div>
                    <div style={s.planningBadge}>
                        📊 Planning {typeConfig[activeSchedule?.type]?.label ?? 'actif'}
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={s.kpiRow}>
                    {[
                        { label: 'Heures / semaine', value: `${resume.total_heures_semaine ?? 0}h`, icon: '⏱️', color: '#4F46E5', bg: '#EEF2FF' },
                        { label: 'Sessions totales', value: resume.sessions_totales ?? 0,           icon: '📚', color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Moy. par jour',    value: `${resume.moyenne_par_jour ?? 0}h`,     icon: '📅', color: '#F59E0B', bg: '#FFFBEB' },
                        { label: 'Cours fixes',      value: fixedEvents.length,                      icon: '🎓', color: '#EF4444', bg: '#FEF2F2' },
                        { label: 'Meilleur jour',    value: bestDay?.day ?? '-',                     icon: '🏆', color: '#8B5CF6', bg: '#F5F3FF' },
                    ].map((kpi, i) => (
                        <div key={i} style={{ ...s.kpiCard, borderTop: `3px solid ${kpi.color}` }}>
                            <div style={{ ...s.kpiIcon, background: kpi.bg }}>{kpi.icon}</div>
                            <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value}</div>
                            <div style={s.kpiLabel}>{kpi.label}</div>
                        </div>
                    ))}
                </div>

                <div style={s.grid2}>

                    {/* Bar Chart — Hours per day */}
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>📊 Heures d'étude par jour</h2>
                        <p style={s.cardSub}>Distribution hebdomadaire des sessions</p>
                        <div style={s.barChart}>
                            {hoursPerDay.map((d, i) => (
                                <div key={i} style={s.barCol}>
                                    <div style={s.barWrap}>
                                        <div style={s.barBg}>
                                            <div style={{
                                                ...s.barFill,
                                                height: `${(d.hours / maxHours) * 100}%`,
                                                background: dayColors[i],
                                            }} />
                                        </div>
                                        <span style={s.barVal}>{d.hours}h</span>
                                    </div>
                                    <span style={s.barLabel}>{d.day}</span>
                                    <span style={s.barSessions}>{d.sessions} sess.</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Planning comparison */}
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>⚖️ Comparaison des plannings</h2>
                        <p style={s.cardSub}>Vos 3 types de planning générés</p>
                        <div style={s.compareList}>
                            {typeStats.map((t, i) => {
                                const cfg = typeConfig[t.type] ?? typeConfig.equilibre;
                                const maxH = Math.max(...typeStats.map(x => x.hours), 1);
                                return (
                                    <div key={i} style={s.compareItem}>
                                        <div style={s.compareHeader}>
                                            <span style={s.compareIcon}>{cfg.icon}</span>
                                            <span style={{ ...s.compareLabel, color: cfg.color }}>
                                                {cfg.label}
                                                {t.active && <span style={{ ...s.activePill, background: cfg.color }}>Actif</span>}
                                            </span>
                                            <span style={s.compareVal}>{t.hours}h</span>
                                        </div>
                                        <div style={s.progressBg}>
                                            <div style={{
                                                ...s.progressFill,
                                                width: `${(t.hours / maxH) * 100}%`,
                                                background: cfg.color,
                                            }} />
                                        </div>
                                        <div style={s.compareSub}>{t.sessions} sessions / semaine</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subjects breakdown */}
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>📚 Matières étudiées</h2>
                        <p style={s.cardSub}>Répartition du temps par matière</p>
                        {subjects.length === 0 ? (
                            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Aucune session d'étude trouvée</p>
                        ) : (
                            <div style={s.subjectList}>
                                {subjects.map((sub, i) => (
                                    <div key={i} style={s.subjectItem}>
                                        <div style={s.subjectHeader}>
                                            <span style={s.subjectDot(dayColors[i % dayColors.length])} />
                                            <span style={s.subjectName}>{sub.name}</span>
                                            <span style={s.subjectHours}>{sub.hours}h</span>
                                        </div>
                                        <div style={s.progressBg}>
                                            <div style={{
                                                ...s.progressFill,
                                                width: `${(sub.hours / totalSubjectHours) * 100}%`,
                                                background: dayColors[i % dayColors.length],
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Day detail */}
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>📅 Détail par jour</h2>
                        <p style={s.cardSub}>Cours fixes + sessions d'étude</p>
                        <div style={s.dayDetailList}>
                            {hoursPerDay.map((d, i) => (
                                <div key={i} style={s.dayDetailRow}>
                                    <div style={{ ...s.dayBadge, background: dayColors[i] + '20', color: dayColors[i] }}>
                                        {d.day}
                                    </div>
                                    <div style={s.dayDetailBar}>
                                        <div style={s.dayMiniStats}>
                                            <span style={s.dayMiniStat}>📘 {d.cours} cours</span>
                                            <span style={s.dayMiniStat}>📚 {d.sessions} sessions</span>
                                            <span style={{ ...s.dayMiniStat, fontWeight: 700, color: '#111827' }}>{d.hours}h étude</span>
                                        </div>
                                        <div style={s.progressBg}>
                                            <div style={{
                                                ...s.progressFill,
                                                width: `${(d.hours / maxHours) * 100}%`,
                                                background: dayColors[i],
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

const s = {
    page: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: '#6B7280', margin: 0 },
    planningBadge: { background: '#EEF2FF', color: '#4F46E5', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 },

    // KPI
    kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' },
    kpiCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' },
    kpiIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
    kpiValue: { fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' },
    kpiLabel: { fontSize: '11px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },

    // Grid
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '16px' },
    card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '22px 24px' },
    cardTitle: { fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    cardSub: { fontSize: '12px', color: '#9CA3AF', margin: '0 0 20px' },

    // Bar chart
    barChart: { display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', paddingBottom: '32px', position: 'relative' },
    barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' },
    barWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: '100%', gap: '4px' },
    barBg: { width: '100%', maxWidth: '36px', height: '120px', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' },
    barFill: { width: '100%', borderRadius: '6px 6px 0 0', transition: 'height 0.6s ease', minHeight: '4px' },
    barVal: { fontSize: '10px', fontWeight: 700, color: '#374151' },
    barLabel: { fontSize: '11px', fontWeight: 700, color: '#6B7280' },
    barSessions: { fontSize: '9px', color: '#9CA3AF' },

    // Compare
    compareList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    compareItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    compareHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
    compareIcon: { fontSize: '16px' },
    compareLabel: { flex: 1, fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
    compareVal: { fontSize: '13px', fontWeight: 700, color: '#111827' },
    compareSub: { fontSize: '11px', color: '#9CA3AF' },
    activePill: { fontSize: '10px', color: '#fff', padding: '1px 7px', borderRadius: '20px', fontWeight: 700 },

    // Progress
    progressBg: { height: '8px', background: '#F3F4F6', borderRadius: '20px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '20px', transition: 'width 0.8s ease' },

    // Subjects
    subjectList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    subjectItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    subjectHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
    subjectDot: (color) => ({ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }),
    subjectName: { flex: 1, fontSize: '13px', fontWeight: 500, color: '#374151' },
    subjectHours: { fontSize: '12px', fontWeight: 700, color: '#111827' },

    // Day detail
    dayDetailList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    dayDetailRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    dayBadge: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 },
    dayDetailBar: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
    dayMiniStats: { display: 'flex', gap: '10px' },
    dayMiniStat: { fontSize: '11px', color: '#6B7280' },

    // Empty
    empty: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    emptyTitle: { fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' },
    emptySub: { fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px' },
    emptyBtn: { display: 'inline-flex', padding: '10px 20px', background: '#4F46E5', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' },
};
