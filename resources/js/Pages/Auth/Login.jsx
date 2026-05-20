import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Connexion - SmartPlanner" />
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

                        <h1 style={s.leftTitle}>Planifiez vos études intelligemment</h1>
                        <p style={s.leftSub}>L'IA génère votre planning personnalisé selon vos cours et préférences.</p>

                        <div style={s.features}>
                            {[
                                { icon: '🤖', text: 'Génération IA automatique' },
                                { icon: '📊', text: 'Statistiques détaillées' },
                                { icon: '📤', text: 'Export PDF & Excel' },
                                { icon: '🌙', text: 'Mode sombre inclus' },
                            ].map((f, i) => (
                                <div key={i} style={s.feature}>
                                    <span style={s.featureIcon}>{f.icon}</span>
                                    <span style={s.featureText}>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={s.leftBlob1} />
                    <div style={s.leftBlob2} />
                </div>

                {/* Right panel — form */}
                <div style={s.right}>
                    <div style={s.formBox}>

                        <div style={s.formHeader}>
                            <h2 style={s.formTitle}>Bon retour ! 👋</h2>
                            <p style={s.formSub}>Connectez-vous à votre compte SmartPlanner</p>
                        </div>

                        {status && (
                            <div style={s.successMsg}>{status}</div>
                        )}

                        <form onSubmit={submit} style={s.form}>

                            <div style={s.field}>
                                <label style={s.label}>Adresse email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="votre@email.com"
                                    style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                                    autoFocus
                                />
                                {errors.email && <span style={s.error}>{errors.email}</span>}
                            </div>

                            <div style={s.field}>
                                <div style={s.labelRow}>
                                    <label style={s.label}>Mot de passe</label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} style={s.forgotLink}>
                                            Mot de passe oublié ?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                                />
                                {errors.password && <span style={s.error}>{errors.password}</span>}
                            </div>

                            <label style={s.checkRow}>
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    style={s.checkbox}
                                />
                                <span style={s.checkLabel}>Se souvenir de moi</span>
                            </label>

                            <button type="submit" disabled={processing} style={{ ...s.submitBtn, opacity: processing ? 0.7 : 1 }}>
                                {processing ? (
                                    <span style={s.btnLoading}>
                                        <Spinner /> Connexion...
                                    </span>
                                ) : 'Se connecter →'}
                            </button>

                        </form>

                        <p style={s.switchText}>
                            Pas encore de compte ?{' '}
                            <Link href={route('register')} style={s.switchLink}>
                                Créer un compte gratuit
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

    // Left
    left: { width: '45%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    leftInner: { padding: '48px', position: 'relative', zIndex: 2, maxWidth: '400px' },
    brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
    brandIcon: { width: '42px', height: '42px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    brandName: { fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
    leftTitle: { fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' },
    leftSub: { fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 40px' },
    features: { display: 'flex', flexDirection: 'column', gap: '14px' },
    feature: { display: 'flex', alignItems: 'center', gap: '12px' },
    featureIcon: { fontSize: '20px', width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    featureText: { fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
    leftBlob1: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-80px' },
    leftBlob2: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: '-60px', left: '-40px' },

    // Right
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '32px' },
    formBox: { width: '100%', maxWidth: '400px' },
    formHeader: { marginBottom: '32px' },
    formTitle: { fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' },
    formSub: { fontSize: '14px', color: '#6B7280', margin: 0 },

    successMsg: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' },

    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
    forgotLink: { fontSize: '12px', color: '#4F46E5', textDecoration: 'none', fontWeight: 500 },
    input: {
        padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid #E5E7EB', fontSize: '14px',
        background: '#fff', color: '#111827',
        outline: 'none', transition: 'border-color 0.15s',
        fontFamily: "'DM Sans', sans-serif",
    },
    inputError: { borderColor: '#FCA5A5' },
    error: { fontSize: '12px', color: '#EF4444', fontWeight: 500 },

    checkRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    checkbox: { width: '16px', height: '16px', accentColor: '#4F46E5', cursor: 'pointer' },
    checkLabel: { fontSize: '13px', color: '#6B7280' },

    submitBtn: {
        padding: '13px', background: '#4F46E5', color: '#fff',
        border: 'none', borderRadius: '12px', fontSize: '14px',
        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: "'DM Sans', sans-serif",
    },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },

    switchText: { textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '24px' },
    switchLink: { color: '#4F46E5', fontWeight: 600, textDecoration: 'none' },

    // Mobile
    '@media(max-width:768px)': { left: { display: 'none' } },
};
