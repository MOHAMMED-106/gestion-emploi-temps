import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Inscription - SmartPlanner" />
            <div style={s.root}>

                {/* Left panel */}
                <div style={s.left}>
                    <div style={s.leftInner}>
                        <div style={s.brand}>
                            <div style={s.brandIcon}>
                                <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <span style={s.brandName}>SmartPlanner</span>
                        </div>

                        <h1 style={s.leftTitle}>Commencez à planifier gratuitement</h1>
                        <p style={s.leftSub}>Créez votre compte et laissez l'IA optimiser votre temps d'étude dès aujourd'hui.</p>

                        <div style={s.steps}>
                            {[
                                { num: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes' },
                                { num: '02', title: 'Ajoutez vos cours', desc: 'Entrez vos cours fixes et horaires' },
                                { num: '03', title: 'Générez votre planning', desc: "L'IA crée 3 plannings personnalisés" },
                            ].map((step, i) => (
                                <div key={i} style={s.step}>
                                    <div style={s.stepNum}>{step.num}</div>
                                    <div>
                                        <div style={s.stepTitle}>{step.title}</div>
                                        <div style={s.stepDesc}>{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={s.leftBlob1} />
                    <div style={s.leftBlob2} />
                </div>

                {/* Right panel */}
                <div style={s.right}>
                    <div style={s.formBox}>

                        <div style={s.formHeader}>
                            <h2 style={s.formTitle}>Créer un compte 🎓</h2>
                            <p style={s.formSub}>Rejoignez SmartPlanner — c'est gratuit !</p>
                        </div>

                        <form onSubmit={submit} style={s.form}>

                            <div style={s.field}>
                                <label style={s.label}>Nom complet</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Mohammed Ouarib"
                                    style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
                                    autoFocus
                                />
                                {errors.name && <span style={s.error}>{errors.name}</span>}
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Adresse email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="votre@email.com"
                                    style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                                />
                                {errors.email && <span style={s.error}>{errors.email}</span>}
                            </div>

                            <div style={s.row2}>
                                <div style={s.field}>
                                    <label style={s.label}>Mot de passe</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                                    />
                                    {errors.password && <span style={s.error}>{errors.password}</span>}
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>Confirmer</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        style={{ ...s.input, ...(errors.password_confirmation ? s.inputError : {}) }}
                                    />
                                    {errors.password_confirmation && <span style={s.error}>{errors.password_confirmation}</span>}
                                </div>
                            </div>

                            <button type="submit" disabled={processing} style={{ ...s.submitBtn, opacity: processing ? 0.7 : 1 }}>
                                {processing ? (
                                    <span style={s.btnLoading}><Spinner /> Création du compte...</span>
                                ) : '🚀 Créer mon compte gratuit'}
                            </button>

                        </form>

                        <p style={s.switchText}>
                            Déjà un compte ?{' '}
                            <Link href={route('login')} style={s.switchLink}>
                                Se connecter
                            </Link>
                        </p>

                    </div>
                </div>

            </div>
        </>
    );
}

function Spinner() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: 'spin 0.8s linear infinite' }}>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );
}

const s = {
    root: { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    left: { width: '45%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    leftInner: { padding: '48px', position: 'relative', zIndex: 2, maxWidth: '400px' },
    brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
    brandIcon: { width: '42px', height: '42px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    brandName: { fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
    leftTitle: { fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' },
    leftSub: { fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 40px' },
    steps: { display: 'flex', flexDirection: 'column', gap: '20px' },
    step: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
    stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    stepTitle: { fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '2px' },
    stepDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.65)' },
    leftBlob1: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-80px' },
    leftBlob2: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: '-60px', left: '-40px' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '32px' },
    formBox: { width: '100%', maxWidth: '440px' },
    formHeader: { marginBottom: '28px' },
    formTitle: { fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' },
    formSub: { fontSize: '14px', color: '#6B7280', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
    input: {
        padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid #E5E7EB', fontSize: '14px',
        background: '#fff', color: '#111827', outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
    },
    inputError: { borderColor: '#FCA5A5' },
    error: { fontSize: '12px', color: '#EF4444', fontWeight: 500 },
    submitBtn: {
        padding: '13px', background: '#4F46E5', color: '#fff',
        border: 'none', borderRadius: '12px', fontSize: '14px',
        fontWeight: 700, cursor: 'pointer', marginTop: '4px',
        fontFamily: "'DM Sans', sans-serif",
    },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    switchText: { textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '20px' },
    switchLink: { color: '#4F46E5', fontWeight: 600, textDecoration: 'none' },
};
