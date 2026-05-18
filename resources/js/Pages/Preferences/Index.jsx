import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

export default function PreferencesIndex({ preferences }) {
    const { data, setData, post, processing, errors } = useForm({
        wake_up_time: preferences?.wake_up_time?.slice(0, 5) || '08:00',
        sleep_time: preferences?.sleep_time?.slice(0, 5) || '22:00',
        study_preference: preferences?.study_preference || 'morning',
        concentration_hours: preferences?.concentration_hours || 2,
        desired_free_time: preferences?.desired_free_time || 2,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/preferences');
    };

    return (
        <AppLayout>
            <Head title="Préférences" />
            <div style={s.page}>
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}>Préférences</h1>
                        <p style={s.subtitle}>Configurez vos habitudes d'étude pour un planning personnalisé</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={s.grid}>

                        {/* Horaires */}
                        <div style={s.card}>
                            <div style={s.cardHeader}>
                                <div style={s.cardIcon}>
                                    <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                                    </svg>
                                </div>
                                <h2 style={s.cardTitle}>Horaires de la journée</h2>
                            </div>
                            <div style={s.cardBody}>
                                <div style={s.fieldRow}>
                                    <div style={s.field}>
                                        <label style={s.label}>Heure de réveil</label>
                                        <input
                                            type="time"
                                            style={s.input}
                                            value={data.wake_up_time}
                                            onChange={e => setData('wake_up_time', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div style={s.field}>
                                        <label style={s.label}>Heure de coucher</label>
                                        <input
                                            type="time"
                                            style={s.input}
                                            value={data.sleep_time}
                                            onChange={e => setData('sleep_time', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rythme d'étude */}
                        <div style={s.card}>
                            <div style={s.cardHeader}>
                                <div style={s.cardIcon}>
                                    <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                    </svg>
                                </div>
                                <h2 style={s.cardTitle}>Rythme d'étude</h2>
                            </div>
                            <div style={s.cardBody}>
                                <div style={s.field}>
                                    <label style={s.label}>Moment préféré pour étudier</label>
                                    <div style={s.radioGroup}>
                                        {[
                                            { value: 'morning', label: 'Matin', desc: 'Productif tôt le matin' },
                                            { value: 'normal', label: 'Journée', desc: 'Réparti sur la journée' },
                                            { value: 'night', label: 'Soir', desc: 'Productif en soirée' },
                                        ].map(opt => (
                                            <div
                                                key={opt.value}
                                                style={{
                                                    ...s.radioCard,
                                                    ...(data.study_preference === opt.value ? s.radioCardActive : {})
                                                }}
                                                onClick={() => setData('study_preference', opt.value)}
                                            >
                                                <div style={s.radioDot}>
                                                    {data.study_preference === opt.value && <div style={s.radioDotInner}/>}
                                                </div>
                                                <div>
                                                    <div style={s.radioLabel}>{opt.label}</div>
                                                    <div style={s.radioDesc}>{opt.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Durées */}
                        <div style={s.card}>
                            <div style={s.cardHeader}>
                                <div style={s.cardIcon}>
                                    <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                    </svg>
                                </div>
                                <h2 style={s.cardTitle}>Durées quotidiennes</h2>
                            </div>
                            <div style={s.cardBody}>
                                <div style={s.fieldRow}>
                                    <div style={s.field}>
                                        <label style={s.label}>Heures d'étude par jour</label>
                                        <div style={s.numberWrapper}>
                                            <button type="button" style={s.numBtn} onClick={() => setData('concentration_hours', Math.max(1, data.concentration_hours - 1))}>−</button>
                                            <span style={s.numValue}>{data.concentration_hours}h</span>
                                            <button type="button" style={s.numBtn} onClick={() => setData('concentration_hours', Math.min(12, data.concentration_hours + 1))}>+</button>
                                        </div>
                                    </div>
                                    <div style={s.field}>
                                        <label style={s.label}>Temps libre souhaité</label>
                                        <div style={s.numberWrapper}>
                                            <button type="button" style={s.numBtn} onClick={() => setData('desired_free_time', Math.max(0, data.desired_free_time - 1))}>−</button>
                                            <span style={s.numValue}>{data.desired_free_time}h</span>
                                            <button type="button" style={s.numBtn} onClick={() => setData('desired_free_time', Math.min(8, data.desired_free_time + 1))}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div style={s.footer}>
                        <button type="submit" style={s.saveBtn} disabled={processing}>
                            {processing ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

const s = {
    page: { padding: '32px', maxWidth: '860px' },
    header: { marginBottom: '28px' },
    title: { fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: '#6B7280', margin: 0 },
    grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: {
        background: '#fff',
        border: '1px solid #F3F4F6',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px',
        borderBottom: '1px solid #F9FAFB',
    },
    cardIcon: {
        width: '32px', height: '32px',
        background: '#EEF2FF',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    cardTitle: { fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 },
    cardBody: { padding: '20px' },
    fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: 500, color: '#374151' },
    input: {
        padding: '9px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111827',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    radioGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    radioCard: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 14px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    radioCardActive: {
        border: '1.5px solid #6366F1',
        background: '#F5F3FF',
    },
    radioDot: {
        width: '16px', height: '16px',
        border: '2px solid #D1D5DB',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    radioDotInner: {
        width: '8px', height: '8px',
        background: '#4F46E5', borderRadius: '50%',
    },
    radioLabel: { fontSize: '13px', fontWeight: 600, color: '#111827' },
    radioDesc: { fontSize: '12px', color: '#9CA3AF' },
    numberWrapper: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '8px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        width: 'fit-content',
    },
    numBtn: {
        width: '28px', height: '28px',
        background: '#F3F4F6',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600,
        color: '#374151',
    },
    numValue: { fontSize: '16px', fontWeight: 700, color: '#111827', minWidth: '32px', textAlign: 'center' },
    footer: { marginTop: '24px' },
    saveBtn: {
        padding: '11px 28px',
        background: '#4F46E5',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};
