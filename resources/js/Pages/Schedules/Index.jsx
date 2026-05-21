import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

const T = {
  fr: {
    schedules: {
      title: "Mes plannings d'étude",
      subtitle: "Générez et activez votre planning personnalisé par IA",
      generate: "Générer les plannings",
      generating: "Génération en cours...",
      loadingTitle: "L'IA génère vos plannings...",
      loadingSub: "Analyse de vos cours et préférences en cours",
      emptyTitle: "Aucun planning généré",
      emptyText: "Ajoutez d'abord vos cours fixes, puis cliquez sur 'Générer les plannings'",
      generateNow: "Générer maintenant",
      planningLabel: "Planning {type}",
      active: "Actif",
      hoursPerWeek: "/ semaine",
      sessions: "sessions",
      avgPerDay: "/ jour moy.",
      showDetail: "Voir le détail",
      hideDetail: "Masquer le détail",
      noSession: "Aucune session",
      activate: "Activer ce planning",
      activeLabel: "✓ Planning actif",
      delete: "Supprimer",
      deleteConfirm: "Supprimer ce planning ?",
      // Types
      typeIntensif: "Intensif",
      typeEquilibre: "Équilibré",
      typeLeger: "Léger",
      descIntensif: "2h/session · 4 sessions/jour max",
      descEquilibre: "1h/session · 3 sessions/jour max",
      descLeger: "30min/session · 2 sessions/jour max",
      // Days
      days: {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
      },
    },
  },
  en: {
    schedules: {
      title: "My study schedules",
      subtitle: "Generate and activate your AI‑powered personalised schedule",
      generate: "Generate schedules",
      generating: "Generating...",
      loadingTitle: "AI is generating your schedules...",
      loadingSub: "Analysing your fixed courses and preferences",
      emptyTitle: "No schedules generated",
      emptyText: "First add your fixed courses, then click 'Generate schedules'",
      generateNow: "Generate now",
      planningLabel: "{type} schedule",
      active: "Active",
      hoursPerWeek: "/ week",
      sessions: "sessions",
      avgPerDay: "/ day avg.",
      showDetail: "Show details",
      hideDetail: "Hide details",
      noSession: "No session",
      activate: "Activate this schedule",
      activeLabel: "✓ Schedule active",
      delete: "Delete",
      deleteConfirm: "Delete this schedule?",
      typeIntensif: "Intensive",
      typeEquilibre: "Balanced",
      typeLeger: "Light",
      descIntensif: "2h/session · 4 sessions/day max",
      descEquilibre: "1h/session · 3 sessions/day max",
      descLeger: "30min/session · 2 sessions/day max",
      days: {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
      },
    },
  },
  ar: {
    schedules: {
      title: "جداول دراستي",
      subtitle: "قم بإنشاء وتفعيل جدولك الشخصي المدعوم بالذكاء الاصطناعي",
      generate: "إنشاء الجداول",
      generating: "جاري الإنشاء...",
      loadingTitle: "الذكاء الاصطناعي ينشئ جداولك...",
      loadingSub: "تحليل دروسك الثابتة وتفضيلاتك",
      emptyTitle: "لم يتم إنشاء أي جدول",
      emptyText: "أضف دروسك الثابتة أولاً، ثم انقر على 'إنشاء الجداول'",
      generateNow: "إنشاء الآن",
      planningLabel: "جدول {type}",
      active: "نشط",
      hoursPerWeek: "/ أسبوع",
      sessions: "جلسات",
      avgPerDay: "/ يوم (متوسط)",
      showDetail: "عرض التفاصيل",
      hideDetail: "إخفاء التفاصيل",
      noSession: "لا توجد جلسة",
      activate: "تفعيل هذا الجدول",
      activeLabel: "✓ الجدول نشط",
      delete: "حذف",
      deleteConfirm: "هل تريد حذف هذا الجدول؟",
      typeIntensif: "مكثف",
      typeEquilibre: "متوازن",
      typeLeger: "خفيف",
      descIntensif: "ساعتان/جلسة · 4 جلسات/يوم كحد أقصى",
      descEquilibre: "ساعة/جلسة · 3 جلسات/يوم كحد أقصى",
      descLeger: "30 دقيقة/جلسة · جلسات/يوم كحد أقصى 2",
      days: {
        monday: "الاثنين",
        tuesday: "الثلاثاء",
        wednesday: "الأربعاء",
        thursday: "الخميس",
        friday: "الجمعة",
        saturday: "السبت",
      },
    },
  },
};

export default function SchedulesIndex({ schedules, activeSchedule }) {
  // Read language from localStorage
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.schedules || T.fr.schedules;
  const isRTL = lang === "ar";

  const { post, processing } = useForm();
  const [expanded, setExpanded] = useState(null);

  const handleGenerate = () => {
    post('/schedules/generate');
  };

  const handleActivate = (id) => {
    router.post(`/schedules/activate/${id}`);
  };

  const handleDelete = (id) => {
    if (confirm(tr.deleteConfirm)) {
      router.delete(`/schedules/${id}`);
    }
  };

  const typeConfig = {
    intensif:  { label: tr.typeIntensif,   color: '#EF4444', bg: '#FEF2F2', icon: '🔥', desc: tr.descIntensif },
    equilibre: { label: tr.typeEquilibre,  color: '#10B981', bg: '#ECFDF5', icon: '⚖️', desc: tr.descEquilibre },
    leger:     { label: tr.typeLeger,      color: '#3B82F6', bg: '#EFF6FF', icon: '🍃', desc: tr.descLeger },
  };

  const jours = [
    tr.days.monday,
    tr.days.tuesday,
    tr.days.wednesday,
    tr.days.thursday,
    tr.days.friday,
    tr.days.saturday,
  ];

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={{ ...s.page, direction: isRTL ? "rtl" : "ltr" }}>

        {/* Header */}
        <div style={{ ...s.header, flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div style={{ textAlign: isRTL ? "right" : "left" }}>
            <h1 style={s.title}>{tr.title}</h1>
            <p style={s.subtitle}>{tr.subtitle}</p>
          </div>
          <button onClick={handleGenerate} style={s.generateBtn} disabled={processing}>
            {processing ? (
              <>
                <Spinner />
                {tr.generating}
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {tr.generate}
              </>
            )}
          </button>
        </div>

        {/* Loading overlay */}
        {processing && (
          <div style={{ ...s.loadingBanner, flexDirection: isRTL ? "row-reverse" : "row" }}>
            <Spinner color="#4F46E5" />
            <div style={{ textAlign: isRTL ? "right" : "left" }}>
              <p style={s.loadingTitle}>{tr.loadingTitle}</p>
              <p style={s.loadingSub}>{tr.loadingSub}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!schedules || schedules.length === 0) && !processing && (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>📅</div>
            <p style={s.emptyTitle}>{tr.emptyTitle}</p>
            <p style={s.emptyText}>{tr.emptyText}</p>
            <button onClick={handleGenerate} style={s.generateBtn} disabled={processing}>
              {tr.generateNow}
            </button>
          </div>
        )}

        {/* Grid */}
        {schedules && schedules.length > 0 && (
          <div style={s.grid}>
            {schedules.map(plan => {
              const cfg = typeConfig[plan.type] || typeConfig.equilibre;
              const isActive = plan.is_active;
              const isExpanded = expanded === plan.id;
              const details = plan.schedule?.details || {};

              return (
                <div key={plan.id} style={{
                  ...s.card,
                  ...(isActive ? { border: `2px solid ${cfg.color}` } : {})
                }}>
                  {/* Card Header */}
                  <div style={{ ...s.cardTop, background: cfg.bg }}>
                    <div style={{ ...s.cardTopLeft, flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <span style={s.cardIcon}>{cfg.icon}</span>
                      <div>
                        <div style={{ ...s.cardLabel, color: cfg.color }}>
                          {tr.planningLabel.replace("{type}", cfg.label)}
                          {isActive && <span style={{ ...s.activeBadge, background: cfg.color }}>{tr.active}</span>}
                        </div>
                        <div style={s.cardDesc}>{cfg.desc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Résumé */}
                  {plan.schedule?.resume && (
                    <div style={s.resumeRow}>
                      <div style={s.resumeStat}>
                        <span style={s.resumeVal}>{plan.schedule.resume.total_heures_semaine}h</span>
                        <span style={s.resumeKey}>{tr.hoursPerWeek}</span>
                      </div>
                      <div style={s.resumeStat}>
                        <span style={s.resumeVal}>{plan.schedule.resume.sessions_totales}</span>
                        <span style={s.resumeKey}>{tr.sessions}</span>
                      </div>
                      <div style={s.resumeStat}>
                        <span style={s.resumeVal}>{plan.schedule.resume.moyenne_par_jour}h</span>
                        <span style={s.resumeKey}>{tr.avgPerDay}</span>
                      </div>
                    </div>
                  )}

                  {/* Détail expandable */}
                  <div style={s.cardBody}>
                    <button
                      style={{ ...s.expandBtn, flexDirection: isRTL ? "row-reverse" : "row" }}
                      onClick={() => setExpanded(isExpanded ? null : plan.id)}
                    >
                      {isExpanded ? tr.hideDetail : tr.showDetail}
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
                        <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    {isExpanded && (
                      <div style={s.dayList}>
                        {jours.map(jour => {
                          // Map translated day back to English key if backend uses English
                          const dayKey = Object.keys(tr.days).find(key => tr.days[key] === jour) || jour;
                          const jourData = details[dayKey] || details[jour];
                          if (!jourData) return null;
                          const sessions = jourData.sessions_etude || [];
                          const cours = jourData.cours_fixes || [];
                          return (
                            <div key={jour} style={{ ...s.dayRow, flexDirection: isRTL ? "row-reverse" : "row" }}>
                              <div style={{ ...s.dayName, textAlign: isRTL ? "right" : "left" }}>{jour}</div>
                              <div style={s.dayContent}>
                                {cours.map((c, i) => (
                                  <div key={i} style={s.coursTag}>
                                    📘 {c.title} {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}
                                  </div>
                                ))}
                                {sessions.length === 0 && cours.length === 0 && (
                                  <span style={s.noSession}>{tr.noSession}</span>
                                )}
                                {sessions.map((sess, i) => (
                                  <div key={i} style={{ ...s.sessionTag, background: cfg.bg, color: cfg.color }}>
                                    {sess.debut?.slice(0,5)}–{sess.fin?.slice(0,5)} · {sess.matiere}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ ...s.cardFooter, flexDirection: isRTL ? "row-reverse" : "row" }}>
                    {!isActive ? (
                      <button onClick={() => handleActivate(plan.id)} style={{ ...s.activateBtn, background: cfg.color }}>
                        {tr.activate}
                      </button>
                    ) : (
                      <span style={{ ...s.activeLabel, color: cfg.color }}>{tr.activeLabel}</span>
                    )}
                    <button onClick={() => handleDelete(plan.id)} style={s.deleteBtn}>
                      {tr.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Spinner component (unchanged)
function Spinner({ color = "#fff", size = 14 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

const s = {
  page: { padding: '32px', maxWidth: '1100px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#6B7280', margin: 0 },
  generateBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 20px',
    background: '#4F46E5', color: '#fff',
    border: 'none', borderRadius: '10px',
    fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', opacity: 1,
    transition: 'opacity 0.2s',
  },
  loadingBanner: {
    display: 'flex', alignItems: 'center', gap: '14px',
    background: '#EEF2FF', border: '1px solid #C7D2FE',
    borderRadius: '12px', padding: '16px 20px',
    marginBottom: '24px',
  },
  loadingTitle: { fontSize: '14px', fontWeight: 600, color: '#3730A3', margin: '0 0 2px' },
  loadingSub: { fontSize: '12px', color: '#6366F1', margin: 0 },
  emptyCard: {
    background: '#fff', border: '1px solid #F3F4F6', borderRadius: '16px',
    padding: '60px 32px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyIcon: { fontSize: '48px' },
  emptyTitle: { fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 },
  emptyText: { fontSize: '13px', color: '#9CA3AF', margin: 0, maxWidth: '320px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
  card: { background: '#fff', border: '1px solid #F3F4F6', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardTop: { padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTopLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardIcon: { fontSize: '22px' },
  cardLabel: { fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' },
  cardDesc: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px' },
  activeBadge: { fontSize: '10px', fontWeight: 700, color: '#fff', padding: '2px 8px', borderRadius: '20px' },
  resumeRow: { display: 'flex', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' },
  resumeStat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', borderRight: '1px solid #F3F4F6' },
  resumeVal: { fontSize: '16px', fontWeight: 700, color: '#111827' },
  resumeKey: { fontSize: '11px', color: '#9CA3AF' },
  cardBody: { padding: '14px 18px', flex: 1 },
  expandBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#6B7280', cursor: 'pointer', width: '100%', justifyContent: 'center' },
  dayList: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  dayRow: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  dayName: { fontSize: '12px', fontWeight: 700, color: '#374151', minWidth: '64px', paddingTop: '4px' },
  dayContent: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  coursTag: { fontSize: '11px', background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '6px' },
  sessionTag: { fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 },
  noSession: { fontSize: '11px', color: '#D1D5DB' },
  cardFooter: { padding: '14px 18px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '10px' },
  activateBtn: { flex: 1, padding: '9px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  activeLabel: { flex: 1, fontSize: '13px', fontWeight: 600, textAlign: 'center' },
  deleteBtn: { padding: '9px 14px', background: 'none', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' },
};
