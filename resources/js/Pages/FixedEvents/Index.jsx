import React from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

export default function FixedEventsIndex({ fixedEvents }) {
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        day_of_week: 'Lundi',
        start_time: '09:00',
        end_time: '11:00',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/fixed-events', { onSuccess: () => reset() });
    };

    const handleDelete = (id) => {
        if (confirm('Supprimer ce cours ?')) {
            router.delete(`/fixed-events/${id}`);
        }
    };

    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const dayColors = {
        Lundi:    { bg: '#EEF2FF', color: '#4F46E5' },
        Mardi:    { bg: '#FDF2F8', color: '#DB2777' },
        Mercredi: { bg: '#ECFDF5', color: '#059669' },
        Jeudi:    { bg: '#FFF7ED', color: '#EA580C' },
        Vendredi: { bg: '#EFF6FF', color: '#2563EB' },
        Samedi:   { bg: '#F5F3FF', color: '#7C3AED' },
    };

    return (
        <AppLayout>
            <Head title="Cours fixes" />
            <div style={s.page}>

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}>Cours fixes</h1>
                        <p style={s.subtitle}>Ajoutez vos cours pour que l'IA génère votre planning</p>
                    </div>
                    <div style={s.statBadge}>
                        {fixedEvents?.length || 0} cours enregistrés
                    </div>
                </div>

                <div style={s.layout}>
                    {/* Formulaire */}
                    <div style={s.formCard}>
                        <div style={s.cardHeader}>
                            <div style={s.cardIcon}>
                                <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
                                </svg>
                            </div>
                            <h2 style={s.cardTitle}>Ajouter un cours</h2>
                        </div>
                        <form onSubmit={handleSubmit} style={s.form}>
                            <div style={s.field}>
                                <label style={s.label}>Matière</label>
                                <input
                                    type="text"
                                    style={s.input}
                                    placeholder="Ex: Mathématiques"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    required
                                />
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Jour</label>
                                <select
                                    style={s.input}
                                    value={data.day_of_week}
                                    onChange={e => setData('day_of_week', e.target.value)}
                                >
                                    {jours.map(j => <option key={j}>{j}</option>)}
                                </select>
                            </div>
                            <div style={s.fieldRow}>
                                <div style={s.field}>
                                    <label style={s.label}>Heure début</label>
                                    <input type="time" style={s.input} value={data.start_time} onChange={e => setData('start_time', e.target.value)} required />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Heure fin</label>
                                    <input type="time" style={s.input} value={data.end_time} onChange={e => setData('end_time', e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" style={s.submitBtn} disabled={processing}>
                                {processing ? 'Ajout en cours...' : '+ Ajouter le cours'}
                            </button>
                        </form>
                    </div>

                    {/* Liste des cours */}
                    <div style={s.listCard}>
                        <div style={s.cardHeader}>
                            <div style={s.cardIcon}>
                                <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <h2 style={s.cardTitle}>Liste des cours</h2>
                        </div>
                        <div style={s.listBody}>
                            {!fixedEvents || fixedEvents.length === 0 ? (
                                <div style={s.empty}>
                                    <p style={s.emptyText}>Aucun cours ajouté</p>
                                    <p style={s.emptyDesc}>Ajoutez votre premier cours avec le formulaire</p>
                                </div>
                            ) : (
                                fixedEvents.map(event => {
                                    const dc = dayColors[event.day_of_week] || dayColors.Lundi;
                                    return (
                                        <div key={event.id} style={s.eventRow}>
                                            <div style={{ ...s.dayBadge, background: dc.bg, color: dc.color }}>
                                                {event.day_of_week.slice(0, 3)}
                                            </div>
                                            <div style={s.eventInfo}>
                                                <span style={s.eventTitle}>{event.title}</span>
                                                <span style={s.eventTime}>
                                                    {event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <button onClick={() => handleDelete(event.id)} style={s.deleteBtn} title="Supprimer">
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

const s = {
    page: { padding: '32px', maxWidth: '900px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' },
    title: { fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: '#6B7280', margin: 0 },
    statBadge: {
        padding: '6px 14px', background: '#EEF2FF',
        color: '#4F46E5', borderRadius: '20px',
        fontSize: '13px', fontWeight: 600,
    },
    layout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' },
    formCard: {
        background: '#fff', border: '1px solid #F3F4F6',
        borderRadius: '14px', overflow: 'hidden',
    },
    listCard: {
        background: '#fff', border: '1px solid #F3F4F6',
        borderRadius: '14px', overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px', borderBottom: '1px solid #F9FAFB',
    },
    cardIcon: {
        width: '32px', height: '32px', background: '#EEF2FF',
        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    cardTitle: { fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 },
    form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
    fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 500, color: '#374151' },
    input: {
        padding: '9px 12px',
        border: '1px solid #E5E7EB', borderRadius: '8px',
        fontSize: '13px', color: '#111827', outline: 'none',
        width: '100%', boxSizing: 'border-box',
    },
    submitBtn: {
        padding: '11px', background: '#4F46E5', color: '#fff',
        border: 'none', borderRadius: '10px',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        width: '100%',
    },
    listBody: { padding: '8px 0' },
    empty: { padding: '40px 20px', textAlign: 'center' },
    emptyText: { fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 4px' },
    emptyDesc: { fontSize: '13px', color: '#9CA3AF', margin: 0 },
    eventRow: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 20px', borderBottom: '1px solid #F9FAFB',
    },
    dayBadge: {
        fontSize: '11px', fontWeight: 700,
        padding: '4px 10px', borderRadius: '20px',
        minWidth: '36px', textAlign: 'center',
    },
    eventInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
    eventTitle: { fontSize: '13px', fontWeight: 600, color: '#111827' },
    eventTime: { fontSize: '12px', color: '#9CA3AF' },
    deleteBtn: {
        background: 'none', border: '1px solid #FCA5A5',
        color: '#EF4444', borderRadius: '6px',
        padding: '5px 8px', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
    },
};
