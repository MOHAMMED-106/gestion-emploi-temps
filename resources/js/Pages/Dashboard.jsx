import { Head, Link } from "@inertiajs/react";
import AppLayout, { useLang } from "./AppLayout";
import { useState, useEffect } from "react";



const T = {
    fr: {
        title:"Tableau de bord",
        greeting_am:"Bonjour", greeting_pm:"Bon après-midi", greeting_eve:"Bonsoir",
        tasks_week:"Tâches cette semaine", fixed_tasks:"Tâches fixes",
        study_time:"Temps d'étude / semaine", today:"Aujourd'hui", slots:"créneaux",
        today_schedule:"Programme du jour", see_all:"Voir tout →",
        in_progress:"En cours maintenant", until:"jusqu'à", no_tasks:"Aucune tâche planifiée aujourd'hui",
        generate:"Générer le planning", next_slot:"Prochain créneau", quick_actions:"Actions rapides",
        add_task:"Ajouter une tâche fixe", regenerate:"Regénérer le planning",
        edit_prefs:"Modifier les préférences", export:"Exporter / imprimer",
        week:"Semaine", detail:"Détail →", at:"à", dir:"ltr",
        days:{ monday:"Lun", tuesday:"Mar", wednesday:"Mer", thursday:"Jeu", friday:"Ven", saturday:"Sam", sunday:"Dim" },
    },
    en: {
        title:"Dashboard",
        greeting_am:"Good morning", greeting_pm:"Good afternoon", greeting_eve:"Good evening",
        tasks_week:"Tasks this week", fixed_tasks:"Fixed tasks",
        study_time:"Study time / week", today:"Today", slots:"slots",
        today_schedule:"Today's schedule", see_all:"See all →",
        in_progress:"In progress now", until:"until", no_tasks:"No tasks planned today",
        generate:"Generate schedule", next_slot:"Next slot", quick_actions:"Quick actions",
        add_task:"Add fixed task", regenerate:"Regenerate schedule",
        edit_prefs:"Edit preferences", export:"Export / print",
        week:"Week", detail:"Detail →", at:"at", dir:"ltr",
        days:{ monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri", saturday:"Sat", sunday:"Sun" },
    },
    ar: {
        title:"لوحة التحكم",
        greeting_am:"صباح الخير", greeting_pm:"مساء الخير", greeting_eve:"مساء الخير",
        tasks_week:"مهام هذا الأسبوع", fixed_tasks:"المهام الثابتة",
        study_time:"وقت الدراسة / أسبوع", today:"اليوم", slots:"فترات",
        today_schedule:"برنامج اليوم", see_all:"عرض الكل →",
        in_progress:"جارٍ الآن", until:"حتى", no_tasks:"لا توجد مهام اليوم",
        generate:"إنشاء الجدول", next_slot:"الفترة القادمة", quick_actions:"إجراءات سريعة",
        add_task:"إضافة مهمة ثابتة", regenerate:"إعادة إنشاء الجدول",
        edit_prefs:"تعديل التفضيلات", export:"تصدير / طباعة",
        week:"الأسبوع", detail:"التفاصيل →", at:"في", dir:"rtl",
        days:{ monday:"إث", tuesday:"ثلا", wednesday:"أرب", thursday:"خمي", friday:"جمع", saturday:"سبت", sunday:"أحد" },
    },
};

const TYPE_COLORS = {
    fixed: { bg:"#EEF2FF", text:"#4338CA", dot:"#6366F1" },
    study: { bg:"#F0FDF4", text:"#15803D", dot:"#22C55E" },
    break: { bg:"#FFFBEB", text:"#92400E", dot:"#F59E0B" },
    free:  { bg:"#F0F9FF", text:"#0369A1", dot:"#0EA5E9" },
    sleep: { bg:"#F5F3FF", text:"#5B21B6", dot:"#8B5CF6" },
};

function getTodayKey() {
    return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
}
function formatTime(t) { return t ? t.slice(0,5) : ""; }

function StatCard({ label, value, accent }) {
    return (
        <div style={s.statCard}>
            <span style={s.statLabel}>{label}</span>
            <span style={{ ...s.statVal, color: accent || "#111827" }}>{value}</span>
        </div>
    );
}

export default function Dashboard({ scheduleItems=[], fixedEvents=[], user, flash={} }) {
    const lang = (() => { try { return localStorage.getItem("smartplanner_lang") || "fr"; } catch { return "fr"; } })();
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";

    const todayKey  = getTodayKey();
    const todayItems = (scheduleItems||[])
        .filter(i => i.day_of_week === todayKey)
        .sort((a,b) => a.start_time.localeCompare(b.start_time));

    const now    = new Date();
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

    const totalStudy = (scheduleItems||[]).filter(i => i.type==="study").reduce((s,i) => {
        const [sh,sm] = i.start_time.split(":").map(Number);
        const [eh,em] = i.end_time.split(":").map(Number);
        return s + (eh*60+em - (sh*60+sm));
    }, 0);

    const fmtH = m => { const h=Math.floor(m/60), r=m%60; return r===0?`${h}h`:`${h}h${r}`; };

    const hour = now.getHours();
    const greeting = hour<12 ? tr.greeting_am : hour<18 ? tr.greeting_pm : tr.greeting_eve;
    const locale = lang==='ar' ? 'ar-MA' : lang==='en' ? 'en-US' : 'fr-FR';

    return (
        <AppLayout>
            <Head title={tr.title}/>
            <div style={{ ...s.page, direction: isRTL ? 'rtl' : 'ltr' }}>

                {flash.success && <div style={s.flash}>{flash.success}</div>}

                {/* Header */}
                <div style={{ ...s.header, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <h1 style={s.greeting}>{greeting}, {user?.name?.split(" ")[0] || "..."} 👋</h1>
                        <p style={s.date}>{now.toLocaleDateString(locale, { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
                    </div>
                    {scheduleItems.length === 0 && (
                        <Link href="/schedules" style={s.genBtn}>{tr.generate}</Link>
                    )}
                </div>

                {/* Stats */}
                <div style={s.statsRow}>
                    <StatCard label={tr.tasks_week}  value={scheduleItems.length} />
                    <StatCard label={tr.fixed_tasks}  value={fixedEvents.length} />
                    <StatCard label={tr.study_time}   value={fmtH(totalStudy)} accent="#16A34A" />
                    <StatCard label={tr.today}        value={`${todayItems.length} ${tr.slots}`} />
                </div>

                <div style={s.grid2}>
                    {/* Today schedule */}
                    <div style={s.card}>
                        <div style={{ ...s.cardHead, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <h2 style={s.cardTitle}>{tr.today_schedule}</h2>
                            <Link href="/schedules" style={s.cardLink}>{tr.see_all}</Link>
                        </div>

                        {currentItem && (
                            <div style={s.currentBanner}>
                                <div style={s.currentDot} />
                                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                    <p style={s.currentLabel}>{tr.in_progress}</p>
                                    <p style={s.currentTitle}>{currentItem.title}</p>
                                    <p style={s.currentTime}>{tr.until} {formatTime(currentItem.end_time)}</p>
                                </div>
                            </div>
                        )}

                        {todayItems.length === 0 ? (
                            <div style={s.emptyDay}>
                                <p style={s.emptyText}>{tr.no_tasks}</p>
                                <Link href="/schedules" style={s.miniBtn}>{tr.generate}</Link>
                            </div>
                        ) : (
                            <div style={s.timeline}>
                                {todayItems.map((item, i) => {
                                    const [sh,sm] = item.start_time.split(":").map(Number);
                                    const [eh,em] = item.end_time.split(":").map(Number);
                                    const isPast    = eh*60+em < nowMin;
                                    const isCurrent = currentItem?.id === item.id;
                                    const col = TYPE_COLORS[item.type] || TYPE_COLORS.fixed;
                                    return (
                                        <div key={item.id??i} style={{ ...s.timelineItem, opacity: isPast ? 0.45 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                            <div style={s.timelineTime}>
                                                <span style={s.timeStart}>{formatTime(item.start_time)}</span>
                                                <div style={{ ...s.timelineLine, background: isCurrent ? col.dot : "#E5E7EB" }} />
                                            </div>
                                            <div style={{
                                                ...s.tlContent,
                                                background: isCurrent ? col.bg : "#FAFAFA",
                                                borderLeft:  isRTL ? 'none' : `3px solid ${isCurrent ? col.dot : "#E5E7EB"}`,
                                                borderRight: isRTL ? `3px solid ${isCurrent ? col.dot : "#E5E7EB"}` : 'none',
                                            }}>
                                                <span style={{ ...s.tlDot, background: col.dot }} />
                                                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
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

                    {/* Right col */}
                    <div style={s.rightCol}>
                        {nextItem && (
                            <div style={s.card}>
                                <h2 style={{ ...s.cardTitle, textAlign: isRTL ? 'right' : 'left' }}>{tr.next_slot}</h2>
                                <div style={{ ...s.nextItem, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <div style={{ ...s.nextDot, background: (TYPE_COLORS[nextItem.type]||TYPE_COLORS.fixed).dot }} />
                                    <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                        <p style={s.nextTitle}>{nextItem.title}</p>
                                        <p style={s.nextTime}>{tr.at} {formatTime(nextItem.start_time)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div style={s.card}>
                            <h2 style={{ ...s.cardTitle, textAlign: isRTL ? 'right' : 'left' }}>{tr.quick_actions}</h2>
                            <div style={s.actions}>
                                {[
                                    { href:"/fixed-events", icon:"➕", label:tr.add_task },
                                    { href:"/schedules",    icon:"⚡", label:tr.regenerate },
                                    { href:"/preferences",  icon:"⚙️", label:tr.edit_prefs },
                                    { href:"/export",       icon:"📤", label:tr.export },
                                ].map(a => (
                                    <Link key={a.href} href={a.href} style={{ ...s.actionBtn, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                        <span style={s.actionIcon}>{a.icon}</span>
                                        <span style={s.actionLabel}>{a.label}</span>
                                        <svg width="14" height="14" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24"
                                            style={{ transform: isRTL ? 'rotate(180deg)' : 'none', marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Week mini */}
                        <div style={s.card}>
                            <div style={{ ...s.cardHead, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <h2 style={s.cardTitle}>{tr.week}</h2>
                                <Link href="/schedules" style={s.cardLink}>{tr.detail}</Link>
                            </div>
                            <div style={s.weekMini}>
                                {Object.entries(tr.days).map(([key, short]) => {
                                    const count = (scheduleItems||[]).filter(i => i.day_of_week===key).length;
                                    const isToday = key === todayKey;
                                    return (
                                        <div key={key} style={{ ...s.weekDay, background: isToday ? "#4F46E5" : "#F9FAFB", border: isToday ? "none" : "1px solid #E5E7EB" }}>
                                            <span style={{ ...s.weekShort, color: isToday ? "#C7D2FE" : "#9CA3AF" }}>{short}</span>
                                            <span style={{ ...s.weekCount, color: isToday ? "#fff" : "#374151" }}>{count}</span>
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
    page:{ maxWidth:"1100px", margin:"0 auto", padding:"2rem 1.25rem 4rem", fontFamily:"'DM Sans',sans-serif" },
    flash:{ background:"#ECFDF5", border:"1px solid #A7F3D0", color:"#065F46", borderRadius:"10px", padding:"11px 16px", fontSize:"13px", marginBottom:"1.5rem" },
    header:{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", marginBottom:"1.75rem" },
    greeting:{ fontSize:"26px", fontWeight:800, color:"#b5b7bce4", margin:"0 0 4px", letterSpacing:"-0.02em" },
    date:{ fontSize:"14px", color:"#9CA3AF", margin:0, textTransform:"capitalize" },
    genBtn:{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"10px 18px", background:"#4F46E5", color:"#fff", borderRadius:"10px", fontSize:"13px", fontWeight:600, textDecoration:"none" },
    statsRow:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px", marginBottom:"1.75rem" },
    statCard:{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:"12px", padding:"16px 18px", display:"flex", flexDirection:"column", gap:"4px" },
    statLabel:{ fontSize:"11px", fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" },
    statVal:{ fontSize:"24px", fontWeight:800, letterSpacing:"-0.02em" },
    grid2:{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"16px", alignItems:"start" },
    card:{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:"14px", padding:"1.25rem 1.5rem", marginBottom:"12px" },
    cardHead:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" },
    cardTitle:{ fontSize:"15px", fontWeight:700, color:"#111827", margin:0 },
    cardLink:{ fontSize:"12px", color:"#4F46E5", fontWeight:600, textDecoration:"none" },
    currentBanner:{ display:"flex", alignItems:"flex-start", gap:"12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"10px", padding:"12px 14px", marginBottom:"1rem" },
    currentDot:{ width:"10px", height:"10px", borderRadius:"50%", background:"#22C55E", flexShrink:0, marginTop:"4px" },
    currentLabel:{ fontSize:"10px", fontWeight:700, color:"#15803D", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 2px" },
    currentTitle:{ fontSize:"15px", fontWeight:700, color:"#111827", margin:"0 0 2px" },
    currentTime:{ fontSize:"12px", color:"#6B7280", margin:0 },
    emptyDay:{ textAlign:"center", padding:"2rem" },
    emptyText:{ fontSize:"14px", color:"#9CA3AF", marginBottom:"12px" },
    miniBtn:{ display:"inline-flex", padding:"8px 16px", background:"#EEF2FF", color:"#4F46E5", borderRadius:"8px", fontSize:"13px", fontWeight:600, textDecoration:"none" },
    timeline:{ display:"flex", flexDirection:"column", gap:0 },
    timelineItem:{ display:"flex", gap:"12px", alignItems:"flex-start" },
    timelineTime:{ display:"flex", flexDirection:"column", alignItems:"center", width:"36px", flexShrink:0 },
    timeStart:{ fontSize:"10px", fontWeight:700, color:"#9CA3AF", marginBottom:"4px", whiteSpace:"nowrap" },
    timelineLine:{ width:"1px", flex:1, minHeight:"32px" },
    tlContent:{ flex:1, display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px", borderRadius:"8px", marginBottom:"4px" },
    tlDot:{ width:"8px", height:"8px", borderRadius:"50%", flexShrink:0 },
    tlTitle:{ fontSize:"13px", fontWeight:600, margin:"0 0 2px" },
    tlTime:{ fontSize:"11px", color:"#9CA3AF", margin:0 },
    rightCol:{ display:"flex", flexDirection:"column" },
    nextItem:{ display:"flex", alignItems:"center", gap:"12px", background:"#FAFAFA", borderRadius:"10px", padding:"12px 14px", marginTop:"8px" },
    nextDot:{ width:"10px", height:"10px", borderRadius:"50%", flexShrink:0 },
    nextTitle:{ fontSize:"14px", fontWeight:600, color:"#111827", margin:"0 0 2px" },
    nextTime:{ fontSize:"12px", color:"#6B7280", margin:0 },
    actions:{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"8px" },
    actionBtn:{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"#FAFAFA", border:"1px solid #F3F4F6", borderRadius:"10px", textDecoration:"none" },
    actionIcon:{ fontSize:"16px", flexShrink:0 },
    actionLabel:{ flex:1, fontSize:"13px", fontWeight:500, color:"#374151" },
    weekMini:{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginTop:"10px" },
    weekDay:{ borderRadius:"8px", padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" },
    weekShort:{ fontSize:"8px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" },
    weekCount:{ fontSize:"15px", fontWeight:800 },
};


