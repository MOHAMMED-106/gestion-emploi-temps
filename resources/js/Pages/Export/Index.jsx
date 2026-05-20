import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Pages/AppLayout";
import { useState } from "react";

export default function ExportIndex({ activeSchedule, allSchedules, fixedEvents, user }) {
    const [selectedId, setSelectedId] = useState(activeSchedule?.id ?? "");
    const [loading, setLoading] = useState(null);

    const typeConfig = {
        intensif:  { label: "Intensif",   color: "#EF4444", bg: "#FEF2F2", icon: "🔥" },
        equilibre: { label: "Équilibré",  color: "#10B981", bg: "#ECFDF5", icon: "⚖️" },
        leger:     { label: "Léger",      color: "#3B82F6", bg: "#EFF6FF", icon: "🍃" },
    };

    const handleExportPdf = () => {
        setLoading("pdf");
        const params = selectedId ? `?schedule_id=${selectedId}` : "";
        // Open in new tab so user can print/save
        window.open(`/export/pdf${params}`, "_blank");
        setTimeout(() => setLoading(null), 1500);
    };

    const handleExportExcel = () => {
        setLoading("excel");
        const params = selectedId ? `?schedule_id=${selectedId}` : "";
        window.location.href = `/export/excel${params}`;
        setTimeout(() => setLoading(null), 1500);
    };

    const selectedSchedule = allSchedules?.find(s => s.id == selectedId) ?? activeSchedule;
    const resume = selectedSchedule?.schedule?.resume ?? null;
    const cfg = selectedSchedule ? (typeConfig[selectedSchedule.type] ?? typeConfig.equilibre) : null;

    return (
        <AppLayout>
            <Head title="Exporter le planning" />
            <div style={s.page}>

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}>Exporter le planning</h1>
                        <p style={s.subtitle}>Téléchargez votre planning en PDF ou Excel</p>
                    </div>
                </div>

                {allSchedules?.length === 0 ? (
                    <div style={s.empty}>
                        <div style={s.emptyIcon}>📭</div>
                        <p style={s.emptyTitle}>Aucun planning disponible</p>
                        <p style={s.emptySub}>Générez d'abord un planning depuis la page "Mon planning"</p>
                        <a href="/schedules" style={s.emptyBtn}>Aller à Mon planning →</a>
                    </div>
                ) : (
                    <div style={s.grid}>

                        {/* Left: Select planning */}
                        <div style={s.card}>
                            <h2 style={s.cardTitle}>1. Choisir le planning</h2>
                            <p style={s.cardSub}>Sélectionnez le planning à exporter</p>

                            <div style={s.selectList}>
                                {allSchedules?.map(plan => {
                                    const c = typeConfig[plan.type] ?? typeConfig.equilibre;
                                    const isSelected = plan.id == selectedId;
                                    return (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedId(plan.id)}
                                            style={{
                                                ...s.selectItem,
                                                border: isSelected ? `2px solid ${c.color}` : "2px solid #E5E7EB",
                                                background: isSelected ? c.bg : "#fff",
                                            }}
                                        >
                                            <span style={s.selectIcon}>{c.icon}</span>
                                            <div style={s.selectInfo}>
                                                <span style={{ ...s.selectLabel, color: isSelected ? c.color : "#374151" }}>
                                                    Planning {c.label}
                                                    {plan.is_active && (
                                                        <span style={{ ...s.activeBadge, background: c.color }}>Actif</span>
                                                    )}
                                                </span>
                                                <span style={s.selectDate}>
                                                    Généré pour le {plan.generated_for ?? ""}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <svg width="18" height="18" fill="none" stroke={c.color} strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Export options */}
                        <div>
                            {/* Preview card */}
                            {selectedSchedule && resume && (
                                <div style={{ ...s.card, marginBottom: "16px", borderLeft: `4px solid ${cfg.color}` }}>
                                    <h2 style={s.cardTitle}>Aperçu du planning sélectionné</h2>
                                    <div style={s.previewRow}>
                                        <div style={s.previewStat}>
                                            <span style={s.previewVal}>{resume.total_heures_semaine}h</span>
                                            <span style={s.previewKey}>/ semaine</span>
                                        </div>
                                        <div style={s.previewStat}>
                                            <span style={s.previewVal}>{resume.sessions_totales}</span>
                                            <span style={s.previewKey}>sessions</span>
                                        </div>
                                        <div style={s.previewStat}>
                                            <span style={s.previewVal}>{resume.moyenne_par_jour}h</span>
                                            <span style={s.previewKey}>moy/jour</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Export buttons */}
                            <div style={s.card}>
                                <h2 style={s.cardTitle}>2. Choisir le format</h2>
                                <p style={s.cardSub}>Cliquez sur le format souhaité pour télécharger</p>

                                <div style={s.exportBtns}>
                                    {/* PDF */}
                                    <button
                                        onClick={handleExportPdf}
                                        disabled={!selectedId && !activeSchedule}
                                        style={{
                                            ...s.exportBtn,
                                            opacity: (!selectedId && !activeSchedule) ? 0.5 : 1,
                                        }}
                                    >
                                        <div style={{ ...s.exportBtnIcon, background: "#FEF2F2" }}>
                                            <svg width="28" height="28" fill="none" stroke="#EF4444" strokeWidth="1.8" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4"/>
                                            </svg>
                                        </div>
                                        <div style={s.exportBtnInfo}>
                                            <span style={s.exportBtnTitle}>
                                                {loading === "pdf" ? "Ouverture..." : "Exporter en PDF"}
                                            </span>
                                            <span style={s.exportBtnDesc}>S'ouvre dans un nouvel onglet · Imprimable</span>
                                        </div>
                                        <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>

                                    {/* Excel */}
                                    <button
                                        onClick={handleExportExcel}
                                        disabled={!selectedId && !activeSchedule}
                                        style={{
                                            ...s.exportBtn,
                                            opacity: (!selectedId && !activeSchedule) ? 0.5 : 1,
                                        }}
                                    >
                                        <div style={{ ...s.exportBtnIcon, background: "#F0FDF4" }}>
                                            <svg width="28" height="28" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                                            </svg>
                                        </div>
                                        <div style={s.exportBtnInfo}>
                                            <span style={s.exportBtnTitle}>
                                                {loading === "excel" ? "Téléchargement..." : "Exporter en Excel"}
                                            </span>
                                            <span style={s.exportBtnDesc}>Fichier .csv · Compatible Excel & LibreOffice</span>
                                        </div>
                                        <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Info box */}
                            <div style={s.infoBox}>
                                <svg width="16" height="16" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                                </svg>
                                <div style={{ fontSize: "12px", color: "#4338CA" }}>
                                    <strong>PDF :</strong> S'ouvre dans un nouvel onglet. Utilisez Ctrl+P ou le bouton "Imprimer" pour sauvegarder en PDF.<br/>
                                    <strong>Excel :</strong> Le fichier .csv se télécharge directement et s'ouvre dans Excel.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

const s = {
    page: { maxWidth: "960px", margin: "0 auto", padding: "32px 24px 60px", fontFamily: "'DM Sans', sans-serif" },
    header: { marginBottom: "28px" },
    title: { fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" },
    subtitle: { fontSize: "14px", color: "#6B7280", margin: 0 },

    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" },

    card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px", padding: "20px 22px", marginBottom: 0 },
    cardTitle: { fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 4px" },
    cardSub: { fontSize: "12px", color: "#9CA3AF", margin: "0 0 16px" },

    // Select list
    selectList: { display: "flex", flexDirection: "column", gap: "8px" },
    selectItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", cursor: "pointer", transition: "all 0.12s" },
    selectIcon: { fontSize: "20px", flexShrink: 0 },
    selectInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
    selectLabel: { fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
    selectDate: { fontSize: "11px", color: "#9CA3AF" },
    activeBadge: { fontSize: "10px", color: "#fff", padding: "1px 7px", borderRadius: "20px", fontWeight: 700 },

    // Preview
    previewRow: { display: "flex", gap: "0", marginTop: "12px", borderTop: "1px solid #F3F4F6", paddingTop: "12px" },
    previewStat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid #F3F4F6", padding: "0" },
    previewVal: { fontSize: "18px", fontWeight: 800, color: "#111827" },
    previewKey: { fontSize: "11px", color: "#9CA3AF" },

    // Export buttons
    exportBtns: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" },
    exportBtn: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: "12px", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.12s" },
    exportBtnIcon: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    exportBtnInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "3px" },
    exportBtnTitle: { fontSize: "14px", fontWeight: 600, color: "#111827" },
    exportBtnDesc: { fontSize: "11px", color: "#9CA3AF" },

    // Info box
    infoBox: { display: "flex", gap: "10px", alignItems: "flex-start", background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "10px", padding: "12px 14px", marginTop: "12px" },

    // Empty state
    empty: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "60px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    emptyIcon: { fontSize: "48px" },
    emptyTitle: { fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 },
    emptySub: { fontSize: "13px", color: "#9CA3AF", margin: 0 },
    emptyBtn: { display: "inline-flex", padding: "10px 20px", background: "#4F46E5", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", marginTop: "4px" },
};
