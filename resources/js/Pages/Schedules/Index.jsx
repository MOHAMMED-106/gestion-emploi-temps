import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

export default function SchedulesIndex({ schedules, activeSchedule }) {
    const { post, processing } = useForm();
    const [expanded, setExpanded] = useState(null);

    const handleGenerate = () => {
        post('/schedules/generate');
    };

    const handleActivate = (id) => {
        router.post(`/schedules/activate/${id}`);
    };

    const handleDelete = (id) => {
        if (confirm('Supprimer ce planning ?')) {
            router.delete(`/schedules/${id}`);
        }
    };

    const typeConfig = {
        intensif:  { label: 'Intensif',  color: '#EF4444', bg: '#FEF2F2', icon: '🔥', desc: '2h/session · 4 sessions/jour max' },
        equilibre: { label: 'Équilibré', color: '#10B981', bg: '#ECFDF5', icon: '⚖️', desc: '1h/session · 3 sessions/jour max' },
        leger:     { label: 'Léger',     color: '#3B82F6', bg: '#EFF6FF', icon: '🍃', desc: '30min/session · 2 sessions/jour max' },
    };

    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    return (
        <AppLayout>
            <Head title="Mes plannings" />
            <div style={s.page}>

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}>Mes plannings d'étude</h1>
                        <p style={s.subtitle}>Générez et activez votre planning personnalisé par IA</p>
                    </div>
                    <button onClick={handleGenerate} style={s.generateBtn} disabled={processing}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        {processing ? 'Génération...' : 'Générer les plannings'}
                    </button>
                </div>

                {/* Pas de plannings */}
                {(!schedules || schedules.length === 0) && (
                    <div style={s.emptyCard}>
                        <div style={s.emptyIcon}>📅</div>
                        <p style={s.emptyTitle}>Aucun planning généré</p>
                        <p style={s.emptyText}>Ajoutez d'abord vos cours fixes, puis cliquez sur "Générer les plannings"</p>
                        <button onClick={handleGenerate} style={s.generateBtn} disabled={processing}>
                            Générer maintenant
                        </button>
                    </div>
                )}

                {/* Grille des 3 plannings */}
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
                                        <div style={s.cardTopLeft}>
                                            <span style={s.cardIcon}>{cfg.icon}</span>
                                            <div>
                                                <div style={{ ...s.cardLabel, color: cfg.color }}>
                                                    Planning {cfg.label}
                                                    {isActive && <span style={{ ...s.activeBadge, background: cfg.color }}>Actif</span>}
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
                                                <span style={s.resumeKey}>/ semaine</span>
                                            </div>
                                            <div style={s.resumeStat}>
                                                <span style={s.resumeVal}>{plan.schedule.resume.sessions_totales}</span>
                                                <span style={s.resumeKey}>sessions</span>
                                            </div>
                                            <div style={s.resumeStat}>
                                                <span style={s.resumeVal}>{plan.schedule.resume.moyenne_par_jour}h</span>
                                                <span style={s.resumeKey}>/ jour moy.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Détail par jour (expandable) */}
                                    <div style={s.cardBody}>
                                        <button
                                            style={s.expandBtn}
                                            onClick={() => setExpanded(isExpanded ? null : plan.id)}
                                        >
                                            {isExpanded ? 'Masquer le détail' : 'Voir le détail'}
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
                                                <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>

                                        {isExpanded && (
                                            <div style={s.dayList}>
                                                {jours.map(jour => {
                                                    const jourData = details[jour];
                                                    if (!jourData) return null;
                                                    const sessions = jourData.sessions_etude || [];
                                                    const cours = jourData.cours_fixes || [];
                                                    return (
                                                        <div key={jour} style={s.dayRow}>
                                                            <div style={s.dayName}>{jour}</div>
                                                            <div style={s.dayContent}>
                                                                {cours.map((c, i) => (
                                                                    <div key={i} style={s.coursTag}>
                                                                        📘 {c.title} {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}
                                                                    </div>
                                                                ))}
                                                                {sessions.length === 0 && cours.length === 0 && (
                                                                    <span style={s.noSession}>Aucune session</span>
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
                                    <div style={s.cardFooter}>
                                        {!isActive ? (
                                            <button onClick={() => handleActivate(plan.id)} style={{ ...s.activateBtn, background: cfg.color }}>
                                                Activer ce planning
                                            </button>
                                        ) : (
                                            <span style={{ ...s.activeLabel, color: cfg.color }}>✓ Planning actif</span>
                                        )}
                                        <button onClick={() => handleDelete(plan.id)} style={s.deleteBtn}>
                                            Supprimer
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
        cursor: 'pointer',
    },
    emptyCard: {
        background: '#fff', border: '1px solid #F3F4F6', borderRadius: '16px',
        padding: '60px 32px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    },
    emptyIcon: { fontSize: '48px' },
    emptyTitle: { fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 },
    emptyText: { fontSize: '13px', color: '#9CA3AF', margin: 0, maxWidth: '320px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
    card: {
        background: '#fff', border: '1px solid #F3F4F6',
        borderRadius: '14px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
    },
    cardTop: { padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTopLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    cardIcon: { fontSize: '22px' },
    cardLabel: { fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' },
    cardDesc: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px' },
    activeBadge: {
        fontSize: '10px', fontWeight: 700, color: '#fff',
        padding: '2px 8px', borderRadius: '20px',
    },
    resumeRow: {
        display: 'flex', gap: '0',
        borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6',
    },
    resumeStat: {
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 0', borderRight: '1px solid #F3F4F6',
    },
    resumeVal: { fontSize: '16px', fontWeight: 700, color: '#111827' },
    resumeKey: { fontSize: '11px', color: '#9CA3AF' },
    cardBody: { padding: '14px 18px', flex: 1 },
    expandBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', border: '1px solid #E5E7EB',
        borderRadius: '8px', padding: '7px 12px',
        fontSize: '12px', color: '#6B7280', cursor: 'pointer',
        width: '100%', justifyContent: 'center',
    },
    dayList: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
    dayRow: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
    dayName: {
        fontSize: '12px', fontWeight: 700, color: '#374151',
        minWidth: '64px', paddingTop: '4px',
    },
    dayContent: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
    coursTag: {
        fontSize: '11px', background: '#F3F4F6', color: '#374151',
        padding: '3px 8px', borderRadius: '6px',
    },
    sessionTag: {
        fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500,
    },
    noSession: { fontSize: '11px', color: '#D1D5DB' },
    cardFooter: {
        padding: '14px 18px', borderTop: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', gap: '10px',
    },
    activateBtn: {
        flex: 1, padding: '9px', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    },
    activeLabel: { flex: 1, fontSize: '13px', fontWeight: 600, textAlign: 'center' },
    deleteBtn: {
        padding: '9px 14px',
        background: 'none', border: '1px solid #FCA5A5',
        color: '#EF4444', borderRadius: '8px',
        fontSize: '12px', cursor: 'pointer',
    },
};
