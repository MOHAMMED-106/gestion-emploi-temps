import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Pages/AppLayout";
import { useState } from "react";

const T = {
  fr: {
    export: {
      title: "Exporter le planning",
      subtitle: "Téléchargez votre planning en PDF ou Excel",
      emptyTitle: "Aucun planning disponible",
      emptySub: "Générez d'abord un planning depuis la page \"Mon planning\"",
      emptyBtn: "Aller à Mon planning →",
      step1_title: "1. Choisir le planning",
      step1_sub: "Sélectionnez le planning à exporter",
      planningIntensif: "Intensif",
      planningEquilibre: "Équilibré",
      planningLeger: "Léger",
      activeBadge: "Actif",
      generatedFor: "Généré pour le {date}",
      previewTitle: "Aperçu du planning sélectionné",
      perWeek: "/ semaine",
      sessions: "sessions",
      avgPerDay: "moy/jour",
      step2_title: "2. Choisir le format",
      step2_sub: "Cliquez sur le format souhaité pour télécharger",
      exportPdf: "Exporter en PDF",
      pdfOpening: "Ouverture...",
      pdfDesc: "S'ouvre dans un nouvel onglet · Imprimable",
      exportExcel: "Exporter en Excel",
      excelDownloading: "Téléchargement...",
      excelDesc: "Fichier .csv · Compatible Excel & LibreOffice",
      infoPdf: "PDF :",
      infoExcel: "Excel :",
      infoText: "S'ouvre dans un nouvel onglet. Utilisez Ctrl+P ou le bouton \"Imprimer\" pour sauvegarder en PDF.",
      infoExcelText: "Le fichier .csv se télécharge directement et s'ouvre dans Excel.",
    },
  },
  en: {
    export: {
      title: "Export Schedule",
      subtitle: "Download your schedule as PDF or Excel",
      emptyTitle: "No schedule available",
      emptySub: "First generate a schedule from the \"My Schedule\" page",
      emptyBtn: "Go to My Schedule →",
      step1_title: "1. Choose schedule",
      step1_sub: "Select the schedule to export",
      planningIntensif: "Intensive",
      planningEquilibre: "Balanced",
      planningLeger: "Light",
      activeBadge: "Active",
      generatedFor: "Generated for {date}",
      previewTitle: "Selected schedule preview",
      perWeek: "/ week",
      sessions: "sessions",
      avgPerDay: "avg/day",
      step2_title: "2. Choose format",
      step2_sub: "Click the desired format to download",
      exportPdf: "Export as PDF",
      pdfOpening: "Opening...",
      pdfDesc: "Opens in new tab · Printable",
      exportExcel: "Export as Excel",
      excelDownloading: "Downloading...",
      excelDesc: ".csv file · Compatible with Excel & LibreOffice",
      infoPdf: "PDF:",
      infoExcel: "Excel:",
      infoText: "Opens in a new tab. Use Ctrl+P or the Print button to save as PDF.",
      infoExcelText: "The .csv file downloads directly and opens in Excel.",
    },
  },
  ar: {
    export: {
      title: "تصدير الجدول",
      subtitle: "قم بتنزيل جدولك بصيغة PDF أو Excel",
      emptyTitle: "لا يوجد جدول متاح",
      emptySub: "قم أولاً بإنشاء جدول من صفحة \"جدولي\"",
      emptyBtn: "الذهاب إلى جدولي →",
      step1_title: "١. اختر الجدول",
      step1_sub: "حدد الجدول الذي تريد تصديره",
      planningIntensif: "مكثف",
      planningEquilibre: "متوازن",
      planningLeger: "خفيف",
      activeBadge: "نشط",
      generatedFor: "تم إنشاؤه لـ {date}",
      previewTitle: "معاينة الجدول المحدد",
      perWeek: "/ أسبوع",
      sessions: "جلسات",
      avgPerDay: "معدل/يوم",
      step2_title: "٢. اختر الصيغة",
      step2_sub: "انقر على الصيغة المطلوبة للتنزيل",
      exportPdf: "تصدير بصيغة PDF",
      pdfOpening: "جاري الفتح...",
      pdfDesc: "يفتح في علامة تبويب جديدة · قابل للطباعة",
      exportExcel: "تصدير بصيغة Excel",
      excelDownloading: "جاري التنزيل...",
      excelDesc: "ملف .csv · متوافق مع Excel و LibreOffice",
      infoPdf: "PDF:",
      infoExcel: "Excel:",
      infoText: "يفتح في علامة تبويب جديدة. استخدم Ctrl+P أو زر الطباعة للحفظ بصيغة PDF.",
      infoExcelText: "يتم تنزيل ملف .csv مباشرة ويفتح في Excel.",
    },
  },
};

export default function ExportIndex({ activeSchedule, allSchedules, fixedEvents, user }) {
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.export || T.fr.export;
  const isRTL = lang === "ar";

  const [selectedId, setSelectedId] = useState(activeSchedule?.id ?? "");
  const [loading, setLoading] = useState(null);

  const typeConfig = {
    intensif:  { label: tr.planningIntensif,   color: "#EF4444", bg: "#FEF2F2", icon: "🔥" },
    equilibre: { label: tr.planningEquilibre,  color: "#10B981", bg: "#ECFDF5", icon: "⚖️" },
    leger:     { label: tr.planningLeger,      color: "#3B82F6", bg: "#EFF6FF", icon: "🍃" },
  };

  const handleExportPdf = () => {
    setLoading("pdf");
    const params = selectedId ? `?schedule_id=${selectedId}` : "";
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
      <Head title={tr.title} />
      <div style={{ ...s.page, direction: isRTL ? "rtl" : "ltr" }}>

        <div style={{ ...s.header, textAlign: isRTL ? "right" : "left" }}>
          <h1 style={s.title}>{tr.title}</h1>
          <p style={s.subtitle}>{tr.subtitle}</p>
        </div>

        {allSchedules?.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <p style={s.emptyTitle}>{tr.emptyTitle}</p>
            <p style={s.emptySub}>{tr.emptySub}</p>
            <a href="/schedules" style={s.emptyBtn}>{tr.emptyBtn}</a>
          </div>
        ) : (
          <div style={{ ...s.grid, flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Left: Select planning */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>{tr.step1_title}</h2>
              <p style={s.cardSub}>{tr.step1_sub}</p>
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
                        flexDirection: isRTL ? "row-reverse" : "row",
                      }}
                    >
                      <span style={s.selectIcon}>{c.icon}</span>
                      <div style={{ ...s.selectInfo, textAlign: isRTL ? "right" : "left" }}>
                        <span style={{ ...s.selectLabel, color: isSelected ? c.color : "#374151" }}>
                          {tr.planningIntensif && c.label} {/* c.label already translated */}
                          {plan.is_active && (
                            <span style={{ ...s.activeBadge, background: c.color }}>{tr.activeBadge}</span>
                          )}
                        </span>
                        <span style={s.selectDate}>
                          {tr.generatedFor.replace("{date}", plan.generated_for ?? "")}
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
              {selectedSchedule && resume && (
                <div style={{ ...s.card, marginBottom: "16px", borderLeft: isRTL ? "none" : `4px solid ${cfg.color}`, borderRight: isRTL ? `4px solid ${cfg.color}` : "none" }}>
                  <h2 style={s.cardTitle}>{tr.previewTitle}</h2>
                  <div style={s.previewRow}>
                    <div style={s.previewStat}>
                      <span style={s.previewVal}>{resume.total_heures_semaine}h</span>
                      <span style={s.previewKey}>{tr.perWeek}</span>
                    </div>
                    <div style={s.previewStat}>
                      <span style={s.previewVal}>{resume.sessions_totales}</span>
                      <span style={s.previewKey}>{tr.sessions}</span>
                    </div>
                    <div style={s.previewStat}>
                      <span style={s.previewVal}>{resume.moyenne_par_jour}h</span>
                      <span style={s.previewKey}>{tr.avgPerDay}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={s.card}>
                <h2 style={s.cardTitle}>{tr.step2_title}</h2>
                <p style={s.cardSub}>{tr.step2_sub}</p>
                <div style={s.exportBtns}>
                  <button
                    onClick={handleExportPdf}
                    disabled={!selectedId && !activeSchedule}
                    style={{
                      ...s.exportBtn,
                      opacity: (!selectedId && !activeSchedule) ? 0.5 : 1,
                      flexDirection: isRTL ? "row-reverse" : "row",
                    }}
                  >
                    <div style={{ ...s.exportBtnIcon, background: "#FEF2F2" }}>
                      <svg width="28" height="28" fill="none" stroke="#EF4444" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4"/>
                      </svg>
                    </div>
                    <div style={{ ...s.exportBtnInfo, textAlign: isRTL ? "right" : "left" }}>
                      <span style={s.exportBtnTitle}>
                        {loading === "pdf" ? tr.pdfOpening : tr.exportPdf}
                      </span>
                      <span style={s.exportBtnDesc}>{tr.pdfDesc}</span>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isRTL ? "rotate(180deg)" : "none" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={!selectedId && !activeSchedule}
                    style={{
                      ...s.exportBtn,
                      opacity: (!selectedId && !activeSchedule) ? 0.5 : 1,
                      flexDirection: isRTL ? "row-reverse" : "row",
                    }}
                  >
                    <div style={{ ...s.exportBtnIcon, background: "#F0FDF4" }}>
                      <svg width="28" height="28" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                      </svg>
                    </div>
                    <div style={{ ...s.exportBtnInfo, textAlign: isRTL ? "right" : "left" }}>
                      <span style={s.exportBtnTitle}>
                        {loading === "excel" ? tr.excelDownloading : tr.exportExcel}
                      </span>
                      <span style={s.exportBtnDesc}>{tr.excelDesc}</span>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isRTL ? "rotate(180deg)" : "none" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ ...s.infoBox, flexDirection: isRTL ? "row-reverse" : "row" }}>
                <svg width="16" height="16" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                <div style={{ fontSize: "12px", color: "#4338CA", textAlign: isRTL ? "right" : "left" }}>
                  <strong>{tr.infoPdf}</strong> {tr.infoText}<br/>
                  <strong>{tr.infoExcel}</strong> {tr.infoExcelText}
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
  selectList: { display: "flex", flexDirection: "column", gap: "8px" },
  selectItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", cursor: "pointer", transition: "all 0.12s" },
  selectIcon: { fontSize: "20px", flexShrink: 0 },
  selectInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  selectLabel: { fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
  selectDate: { fontSize: "11px", color: "#9CA3AF" },
  activeBadge: { fontSize: "10px", color: "#fff", padding: "1px 7px", borderRadius: "20px", fontWeight: 700 },
  previewRow: { display: "flex", gap: "0", marginTop: "12px", borderTop: "1px solid #F3F4F6", paddingTop: "12px" },
  previewStat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid #F3F4F6", padding: "0" },
  previewVal: { fontSize: "18px", fontWeight: 800, color: "#111827" },
  previewKey: { fontSize: "11px", color: "#9CA3AF" },
  exportBtns: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" },
  exportBtn: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: "12px", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.12s" },
  exportBtnIcon: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  exportBtnInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "3px" },
  exportBtnTitle: { fontSize: "14px", fontWeight: 600, color: "#111827" },
  exportBtnDesc: { fontSize: "11px", color: "#9CA3AF" },
  infoBox: { display: "flex", gap: "10px", alignItems: "flex-start", background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "10px", padding: "12px 14px", marginTop: "12px" },
  empty: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "60px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 },
  emptySub: { fontSize: "13px", color: "#9CA3AF", margin: 0 },
  emptyBtn: { display: "inline-flex", padding: "10px 20px", background: "#4F46E5", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", marginTop: "4px" },
};
