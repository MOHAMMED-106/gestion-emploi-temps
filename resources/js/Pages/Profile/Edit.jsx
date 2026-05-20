import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { useState, useRef } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // ── Profile photo state ────────────────────────────────
    const [photoPreview, setPhotoPreview] = useState(null);
    const photoRef = useRef(null);

    // ── Forms ──────────────────────────────────────────────
    const profileForm = useForm({
        name:  user.name,
        email: user.email,
        photo: null,
    });

    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const deleteForm = useForm({ password: '' });
    const [showDelete, setShowDelete] = useState(false);

    // ── Handlers ───────────────────────────────────────────
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        profileForm.setData('photo', file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();
        deleteForm.delete(route('profile.destroy'));
    };

    const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const avatarSrc = photoPreview || user.profile_photo_url || null;

    return (
        <AppLayout>
            <Head title="Mon profil" />
            <div style={s.page}>

                {/* Header */}
                <div style={s.header}>
                    <h1 style={s.title}>Mon profil</h1>
                    <p style={s.subtitle}>Gérez vos informations personnelles et votre sécurité</p>
                </div>

                {/* Profile card */}
                <div style={s.card}>
                    <h2 style={s.cardTitle}>📸 Photo & Informations</h2>
                    <p style={s.cardSub}>Mettez à jour votre nom, email et photo de profil</p>

                    {status === 'profile-updated' && (
                        <div style={s.successMsg}>✅ Profil mis à jour avec succès !</div>
                    )}

                    <form onSubmit={submitProfile} style={s.form}>

                        {/* Avatar */}
                        <div style={s.avatarSection}>
                            <div style={s.avatarWrap}>
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Avatar" style={s.avatarImg} />
                                ) : (
                                    <div style={s.avatarFallback}>{initials}</div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => photoRef.current?.click()}
                                    style={s.avatarEditBtn}
                                    title="Changer la photo"
                                >
                                    📷
                                </button>
                            </div>
                            <input
                                ref={photoRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                            <div>
                                <p style={s.avatarName}>{user.name}</p>
                                <p style={s.avatarEmail}>{user.email}</p>
                                <button
                                    type="button"
                                    onClick={() => photoRef.current?.click()}
                                    style={s.changePhotoBtn}
                                >
                                    Changer la photo
                                </button>
                            </div>
                        </div>

                        {/* Fields */}
                        <div style={s.row2}>
                            <div style={s.field}>
                                <label style={s.label}>Nom complet</label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    style={{ ...s.input, ...(profileForm.errors.name ? s.inputError : {}) }}
                                />
                                {profileForm.errors.name && <span style={s.error}>{profileForm.errors.name}</span>}
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Adresse email</label>
                                <input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={e => profileForm.setData('email', e.target.value)}
                                    style={{ ...s.input, ...(profileForm.errors.email ? s.inputError : {}) }}
                                />
                                {profileForm.errors.email && <span style={s.error}>{profileForm.errors.email}</span>}
                            </div>
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div style={s.warningMsg}>
                                ⚠️ Votre adresse email n'est pas vérifiée.
                            </div>
                        )}

                        <div style={s.formFooter}>
                            <button type="submit" disabled={profileForm.processing} style={s.saveBtn}>
                                {profileForm.processing ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password card */}
                <div style={s.card}>
                    <h2 style={s.cardTitle}>🔐 Changer le mot de passe</h2>
                    <p style={s.cardSub}>Utilisez un mot de passe fort d'au moins 8 caractères</p>

                    {status === 'password-updated' && (
                        <div style={s.successMsg}>✅ Mot de passe mis à jour !</div>
                    )}

                    <form onSubmit={submitPassword} style={s.form}>
                        <div style={s.field}>
                            <label style={s.label}>Mot de passe actuel</label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                placeholder="••••••••"
                                style={{ ...s.input, ...(passwordForm.errors.current_password ? s.inputError : {}) }}
                            />
                            {passwordForm.errors.current_password && <span style={s.error}>{passwordForm.errors.current_password}</span>}
                        </div>

                        <div style={s.row2}>
                            <div style={s.field}>
                                <label style={s.label}>Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={e => passwordForm.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    style={{ ...s.input, ...(passwordForm.errors.password ? s.inputError : {}) }}
                                />
                                {passwordForm.errors.password && <span style={s.error}>{passwordForm.errors.password}</span>}
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Confirmer</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    style={{ ...s.input, ...(passwordForm.errors.password_confirmation ? s.inputError : {}) }}
                                />
                                {passwordForm.errors.password_confirmation && <span style={s.error}>{passwordForm.errors.password_confirmation}</span>}
                            </div>
                        </div>

                        <div style={s.formFooter}>
                            <button type="submit" disabled={passwordForm.processing} style={s.saveBtn}>
                                {passwordForm.processing ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Danger zone */}
                <div style={{ ...s.card, border: '1px solid #FECACA' }}>
                    <h2 style={{ ...s.cardTitle, color: '#EF4444' }}>⚠️ Zone dangereuse</h2>
                    <p style={s.cardSub}>La suppression de votre compte est irréversible.</p>

                    {!showDelete ? (
                        <button onClick={() => setShowDelete(true)} style={s.deleteBtn}>
                            Supprimer mon compte
                        </button>
                    ) : (
                        <form onSubmit={submitDelete} style={s.form}>
                            <div style={s.field}>
                                <label style={s.label}>Confirmez avec votre mot de passe</label>
                                <input
                                    type="password"
                                    value={deleteForm.data.password}
                                    onChange={e => deleteForm.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    style={{ ...s.input, borderColor: '#FCA5A5' }}
                                />
                                {deleteForm.errors.password && <span style={s.error}>{deleteForm.errors.password}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowDelete(false)} style={s.cancelBtn}>
                                    Annuler
                                </button>
                                <button type="submit" disabled={deleteForm.processing} style={s.confirmDeleteBtn}>
                                    {deleteForm.processing ? 'Suppression...' : 'Confirmer la suppression'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}

const s = {
    page: { maxWidth: '720px', margin: '0 auto', padding: '32px 24px 60px', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { marginBottom: '4px' },
    title: { fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: '#6B7280', margin: 0 },

    card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px 28px' },
    cardTitle: { fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    cardSub: { fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px' },

    successMsg: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    warningMsg: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' },

    // Avatar
    avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: '#F9FAFB', borderRadius: '12px' },
    avatarWrap: { position: 'relative', flexShrink: 0 },
    avatarImg: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #E5E7EB' },
    avatarFallback: { width: '72px', height: '72px', borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5', fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #E5E7EB' },
    avatarEditBtn: { position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#4F46E5', border: '2px solid #fff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    avatarName: { fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 2px' },
    avatarEmail: { fontSize: '13px', color: '#6B7280', margin: '0 0 10px' },
    changePhotoBtn: { background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', color: '#374151', cursor: 'pointer', fontWeight: 500 },

    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
    input: { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '14px', background: '#fff', color: '#111827', outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    inputError: { borderColor: '#FCA5A5' },
    error: { fontSize: '12px', color: '#EF4444', fontWeight: 500 },

    formFooter: { display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' },
    saveBtn: { padding: '10px 24px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

    deleteBtn: { padding: '10px 20px', background: 'none', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '10px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151' },
    confirmDeleteBtn: { flex: 1, padding: '10px', background: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff' },
};
