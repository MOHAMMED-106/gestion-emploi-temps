import { Head, Link } from "@inertiajs/react";
import AppLayout from "./AppLayout";

const DAY_LABELS = { monday:"Lun", tuesday:"Mar", wednesday:"Mer", thursday:"Jeu", friday:"Ven", saturday:"Sam", sunday:"Dim" };
const TYPE_COLORS = {
    fixed:  { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
    study:  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
    break:  { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
    free:   { bg: "#F0F9FF", text: "#0369A1", dot: "#0EA5E9" },
    sleep:  { bg: "#F5F3FF", text: "#5B21B6", dot: "#8B5CF6" },
};

function getTodayKey() {
    return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
}

function formatTime(t) { return t ? t.slice(0,5) : ""; }

function StatCard({ label, value, sub, accent }) {
    return (
        <div style={s.statCard}>
            <span style={s.statLabel}>{label}</span>
            <span style={{ ...s.statValue, color: accent || "#111827" }}>{value}</span>
            {sub && <span style={s.statSub}>{sub}</span>}
        </div>
    );
}

export default function Dashboard({ scheduleItems = [], fixedEvents = [], user, flash = {} }) {
    const todayKey = getTodayKey();
    const todayItems = (scheduleItems || [])
        .filter(i => i.day_of_week === todayKey)
        .sort((a,b) => a.start_time.localeCompare(b.start_time));

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const currentItem = todayItems.find(i => {
        const [sh,sm] = i.start_time.split(":").map(Number);
        const [eh,em] = i.end_time.split(":").map(Number);
        return nowMin >= sh*60+sm && nowMin < eh*60+em;
    });

    const nextItem = todayItems.find(i => {
        const [sh,sm] = i.start_time.split(":").map(Number);
        return sh*60+sm > nowMin;
    });

    // Stats
    const totalStudy = (scheduleItems||[]).filter(i=>i.type==="study")
        .reduce((s,i)=>{
            const [sh,sm]=i.start_time.split(":").map(Number);
            const [eh,em]=i.end_time.split(":").map(Number);
            return s+(eh*60+em-(sh*60+sm));
        },0);

    const fmtH = min => { const h=Math.floor(min/60), m=min%60; return m===0?`${h}h`:`${h}h${m}`; };

    const greetingHour = now.getHours();
    const greeting = greetingHour < 12 ? "Bonjour" : greetingHour < 18 ? "Bon après-midi" : "Bonsoir";

    return (
        <AppLayout>
            <Head title="Tableau de bord" />
            <div style={s.page}>

                {/* Flash */}
                {flash.success && (
                    <div style={s.flash}>{flash.success}</div>
                )}

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.greeting}>{greeting}, {user?.name?.split(" ")[0] || "vous"} 👋</h1>
                        <p style={s.date}>{now.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
                    </div>
                    {scheduleItems.length === 0 && (
                        <Link href={""} style={s.genBtn}>
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            Générer mon planning
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div style={s.statsRow}>
                    <StatCard label="Tâches cette semaine" value={scheduleItems.length} />
                    <StatCard label="Tâches fixes" value={fixedEvents.length} />
                    <StatCard label="Temps d'étude / semaine" value={fmtH(totalStudy)} accent="#16A34A" />
                    <StatCard label="Aujourd'hui" value={`${todayItems.length} créneaux`} />
                </div>

                <div style={s.grid2}>
                    {/* Today's schedule */}
                    <div style={s.card}>
                        <div style={s.cardHead}>
                            <h2 style={s.cardTitle}>Programme du jour</h2>
                            <Link href={""} style={s.cardLink}>Voir tout →</Link>
                        </div>

                        {/* Current / next */}
                        {currentItem && (
                            <div style={s.currentBanner}>
                                <div style={s.currentDot} />
                                <div>
                                    <p style={s.currentLabel}>En cours maintenant</p>
                                    <p style={s.currentTitle}>{currentItem.title}</p>
                                    <p style={s.currentTime}>jusqu'à {formatTime(currentItem.end_time)}</p>
                                </div>
                            </div>
                        )}

                        {todayItems.length === 0 ? (
                            <div style={s.emptyDay}>
                                <p style={s.emptyDayText}>Aucune tâche planifiée aujourd'hui</p>
                                {scheduleItems.length === 0 && (
                                    <Link href={""} style={s.miniBtn}>Générer le planning</Link>
                                )}
                            </div>
                        ) : (
                            <div style={s.timeline}>
                                {todayItems.map((item, i) => {
                                    const [sh,sm] = item.start_time.split(":").map(Number);
                                    const isPast = sh*60+sm+((()=>{const[eh,em]=item.end_time.split(":").map(Number);return eh*60+em-(sh*60+sm)})()) < nowMin;
                                    const isCurrent = currentItem?.id === item.id;
                                    const col = TYPE_COLORS[item.type] || TYPE_COLORS.fixed;
                                    return (
                                        <div key={item.id ?? i} style={{ ...s.timelineItem, opacity: isPast ? 0.45 : 1 }}>
                                            <div style={s.timelineTime}>
                                                <span style={s.timeStart}>{formatTime(item.start_time)}</span>
                                                <div style={{ ...s.timelineLine, background: isCurrent ? col.dot : "#E5E7EB" }} />
                                            </div>
                                            <div style={{
                                                ...s.timelineContent,
                                                background: isCurrent ? col.bg : "#FAFAFA",
                                                borderLeft: isCurrent ? `3px solid ${col.dot}` : "3px solid #E5E7EB",
                                            }}>
                                                <span style={{ ...s.tlDot, background: col.dot }} />
                                                <div>
                                                    <p style={{ ...s.tlTitle, color: isCurrent ? col.text : "#374151" }}>{item.title}</p>
                                                    <p style={s.tlTime}>{formatTime(item.start_time)} – {formatTime(item.end_time)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div style={s.rightCol}>
                        {/* Next up */}
                        {nextItem && (
                            <div style={s.card}>
                                <h2 style={s.cardTitle}>Prochain créneau</h2>
                                <div style={s.nextItem}>
                                    <div style={{ ...s.nextDot, background: (TYPE_COLORS[nextItem.type]||TYPE_COLORS.fixed).dot }} />
                                    <div>
                                        <p style={s.nextTitle}>{nextItem.title}</p>
                                        <p style={s.nextTime}>à {formatTime(nextItem.start_time)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div style={s.card}>
                            <h2 style={s.cardTitle}>Actions rapides</h2>
                            <div style={s.actions}>
                                {[
                                    { href: "fixed-events.create", icon: "➕", label: "Ajouter une tâche fixe" },
                                    { href: "schedule.generate",   icon: "⚡", label: "Regénérer le planning" },
                                    { href: "preferences.edit",    icon: "⚙️", label: "Modifier les préférences" },
                                    { href: "export.index",        icon: "📤", label: "Exporter / imprimer" },
                                ].map(a => (
                                    <Link key={a.href} href={""} style={s.actionBtn}>
                                        <span style={s.actionIcon}>{a.icon}</span>
                                        <span style={s.actionLabel}>{a.label}</span>
                                        <svg width="14" height="14" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Week overview mini */}
                        <div style={s.card}>
                            <div style={s.cardHead}>
                                <h2 style={s.cardTitle}>Semaine</h2>
                                <Link href={""} style={s.cardLink}>Détail →</Link>
                            </div>
                            <div style={s.weekMini}>
                                {Object.entries(DAY_LABELS).map(([key, short]) => {
                                    const count = (scheduleItems||[]).filter(i=>i.day_of_week===key).length;
                                    const isToday = key === todayKey;
                                    return (
                                        <div key={key} style={{ ...s.weekDay, background: isToday ? "#4F46E5" : "#F9FAFB", border: isToday ? "none" : "1px solid #E5E7EB" }}>
                                            <span style={{ ...s.weekDayShort, color: isToday ? "#C7D2FE" : "#9CA3AF" }}>{short}</span>
                                            <span style={{ ...s.weekDayCount, color: isToday ? "#fff" : "#374151" }}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

const s = {
    page: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.25rem 4rem", fontFamily: "'DM Sans', sans-serif" },
    flash: { background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", marginBottom: "1.5rem" },
    header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" },
    greeting: { fontSize: "26px", fontWeight: 800, color: "#111827", margin: "0 0 4px", letterSpacing: "-0.02em" },
    date: { fontSize: "14px", color: "#9CA3AF", margin: 0, textTransform: "capitalize" },
    genBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#4F46E5", color: "#fff", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "1.75rem" },
    statCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" },
    statLabel: { fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" },
    statValue: { fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" },
    statSub: { fontSize: "12px", color: "#9CA3AF" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", alignItems: "start" },
    card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "12px" },
    cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
    cardTitle: { fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 },
    cardLink: { fontSize: "12px", color: "#4F46E5", fontWeight: 600, textDecoration: "none" },
    currentBanner: { display: "flex", alignItems: "flex-start", gap: "12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "12px 14px", marginBottom: "1rem" },
    currentDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E", flexShrink: 0, marginTop: "4px", animation: "pulse 2s infinite" },
    currentLabel: { fontSize: "10px", fontWeight: 700, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" },
    currentTitle: { fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 2px" },
    currentTime: { fontSize: "12px", color: "#6B7280", margin: 0 },
    emptyDay: { textAlign: "center", padding: "2rem", },
    emptyDayText: { fontSize: "14px", color: "#9CA3AF", marginBottom: "12px" },
    miniBtn: { display: "inline-flex", padding: "8px 16px", background: "#EEF2FF", color: "#4F46E5", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" },
    timeline: { display: "flex", flexDirection: "column", gap: "0" },
    timelineItem: { display: "flex", gap: "12px", alignItems: "flex-start" },
    timelineTime: { display: "flex", flexDirection: "column", alignItems: "center", width: "36px", flexShrink: 0 },
    timeStart: { fontSize: "10px", fontWeight: 700, color: "#9CA3AF", marginBottom: "4px", whiteSpace: "nowrap" },
    timelineLine: { width: "1px", flex: 1, minHeight: "32px" },
    timelineContent: { flex: 1, display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", marginBottom: "4px" },
    tlDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    tlTitle: { fontSize: "13px", fontWeight: 600, margin: "0 0 2px" },
    tlTime: { fontSize: "11px", color: "#9CA3AF", margin: 0 },
    rightCol: { display: "flex", flexDirection: "column" },
    nextItem: { display: "flex", alignItems: "center", gap: "12px", background: "#FAFAFA", borderRadius: "10px", padding: "12px 14px", marginTop: "8px" },
    nextDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
    nextTitle: { fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 2px" },
    nextTime: { fontSize: "12px", color: "#6B7280", margin: 0 },
    actions: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" },
    actionBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#FAFAFA", border: "1px solid #F3F4F6", borderRadius: "10px", textDecoration: "none", transition: "border-color 0.12s" },
    actionIcon: { fontSize: "16px", flexShrink: 0 },
    actionLabel: { flex: 1, fontSize: "13px", fontWeight: 500, color: "#374151" },
    weekMini: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginTop: "10px" },
    weekDay: { borderRadius: "8px", padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
    weekDayShort: { fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" },
    weekDayCount: { fontSize: "15px", fontWeight: 800 },
};
