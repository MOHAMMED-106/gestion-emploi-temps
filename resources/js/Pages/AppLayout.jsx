import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, usePage, router } from "@inertiajs/react";

const TRANSLATIONS = {
    fr: { nav_section:"Navigation", dashboard:"Tableau de bord", planning:"Mon planning", fixed_events:"Tâches fixes", preferences:"Préférences", statistics:"Statistiques", export:"Exporter", generate_btn:"Générer le planning", profile_title:"Profil", logout:"Déconnexion", dir:"ltr" },
    en: { nav_section:"Navigation", dashboard:"Dashboard", planning:"My Schedule", fixed_events:"Fixed Tasks", preferences:"Preferences", statistics:"Statistics", export:"Export", generate_btn:"Generate Schedule", profile_title:"Profile", logout:"Logout", dir:"ltr" },
    ar: { nav_section:"التنقل", dashboard:"لوحة التحكم", planning:"جدولي", fixed_events:"المهام الثابتة", preferences:"التفضيلات", statistics:"الإحصائيات", export:"تصدير", generate_btn:"إنشاء الجدول", profile_title:"الملف الشخصي", logout:"تسجيل الخروج", dir:"rtl" },
};

export const LangContext = createContext({ lang: "fr", t: TRANSLATIONS.fr, setLang: () => {} });
export const useLang = () => useContext(LangContext);

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [dark, setDark] = useState(() => {
        try { return localStorage.getItem("smartplanner_dark") === "true"; }
        catch { return false; }
    });

    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem("smartplanner_lang") || "fr"; }
        catch { return "fr"; }
    });

    const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    const isRTL = t.dir === "rtl";

    const setLang = (l) => {
        setLangState(l);
        try { localStorage.setItem("smartplanner_lang", l); } catch {}
    };

    useEffect(() => {
        try { localStorage.setItem("smartplanner_dark", dark); } catch {}
        document.body.style.background = dark ? "#0F172A" : "#F9FAFB";
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [dark, isRTL]);

    const toggleDark = () => setDark(d => !d);
    const handleLogout = () => router.post('/logout');

    const tk = dark ? {
        root:"#0F172A", sidebar:"#1E293B", border:"#334155",
        navActive:"#312E81", navActiveText:"#A5B4FC", navText:"#94A3B8",
        logo:"#F1F5F9", section:"#475569",
        userBg:"#1E293B", userName:"#F1F5F9", userEmail:"#64748B",
        main:"#0F172A", mobileBar:"#1E293B", mobileLogo:"#F1F5F9",
        overlay:"rgba(0,0,0,0.6)", settingsBg:"#334155",
    } : {
        root:"#F9FAFB", sidebar:"#ffffff", border:"#F3F4F6",
        navActive:"#F5F3FF", navActiveText:"#4F46E5", navText:"#6B7280",
        logo:"#111827", section:"#D1D5DB",
        userBg:"#ffffff", userName:"#111827", userEmail:"#9CA3AF",
        main:"#F9FAFB", mobileBar:"#ffffff", mobileLogo:"#111827",
        overlay:"rgba(0,0,0,0.3)", settingsBg:"#F3F4F6",
    };

    const NAV = [
        { href:"/dashboard",    label:t.dashboard,    icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
        { href:"/schedules",    label:t.planning,     icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
        { href:"/fixed-events", label:t.fixed_events, icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
        { href:"/preferences",  label:t.preferences,  icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg> },
        { href:"/statistics",   label:t.statistics,   icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
        { href:"/export",       label:t.export,       icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> },
    ];

    function isActive(href) { return url === href || url.startsWith(href + '/'); }

    const LogoutBtn = () => (
        <button
            onClick={handleLogout}
            title={t.logout}
            style={{
                width:"28px", height:"28px", borderRadius:"7px",
                background:"#FEF2F2", border:"1px solid #FECACA",
                cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0, transition:"all 0.2s",
            }}
        >
            <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
        </button>
    );

    const SidebarContent = ({ mobile = false }) => (
        <>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"16px 14px", borderBottom:`1px solid ${tk.border}`, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:0 }}>
                    <div style={{ width:"32px", height:"32px", background:"#4F46E5", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <span style={{ fontSize:"14px", fontWeight:800, color:tk.logo, letterSpacing:"-0.02em" }}>SmartPlanner</span>
                </div>
                <button onClick={toggleDark} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.settingsBg, border:"none", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {dark ? "☀️" : "🌙"}
                </button>
            </div>

            {/* Language switcher */}
            <div style={{ padding:"10px 12px", borderBottom:`1px solid ${tk.border}` }}>
                <p style={{ fontSize:"10px", fontWeight:700, color:tk.section, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px", textAlign: isRTL ? 'right' : 'left' }}>
                    {lang==='ar' ? 'اللغة' : lang==='en' ? 'Language' : 'Langue'}
                </p>
                <div style={{ display:"flex", gap:"4px" }}>
                    {['fr','en','ar'].map(l => (
                        <button key={l} onClick={() => setLang(l)} style={{ flex:1, padding:"5px 0", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"16px", transition:"all 0.15s", background: lang===l ? '#4F46E5' : tk.settingsBg }}>
                            {l==='fr' ? '🇫🇷' : l==='en' ? '🇬🇧' : '🇲🇦'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:"2px", direction: isRTL ? 'rtl' : 'ltr' }}>
                <p style={{ fontSize:"10px", fontWeight:700, color:tk.section, textTransform:"uppercase", letterSpacing:"0.08em", padding:"0 8px", margin:"0 0 8px" }}>{t.nav_section}</p>
                {NAV.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.href} href={item.href} onClick={() => mobile && setSidebarOpen(false)}
                            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 10px", borderRadius:"8px", fontSize:"13px", fontWeight:500, textDecoration:"none", transition:"all 0.12s", position:"relative", color: active ? tk.navActiveText : tk.navText, background: active ? tk.navActive : "transparent", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <span style={{ color: active ? tk.navActiveText : tk.navText, flexShrink:0 }}>{item.icon}</span>
                            {item.label}
                            {active && <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:tk.navActiveText, flexShrink:0, marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0 }} />}
                        </Link>
                    );
                })}
            </nav>

            {/* CTA */}
            <div style={{ padding:"12px 16px", borderTop:`1px solid ${tk.border}` }}>
                <Link href="/schedules" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", width:"100%", padding:"10px", background:"#4F46E5", color:"#fff", borderRadius:"10px", fontSize:"13px", fontWeight:600, textDecoration:"none", boxSizing:"border-box", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    {t.generate_btn}
                </Link>
            </div>

            {/* User bar + LOGOUT */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 14px", borderTop:`1px solid ${tk.border}`, background:tk.userBg, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#EEF2FF", color:"#4F46E5", fontSize:"13px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", textAlign: isRTL ? 'right' : 'left' }}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:tk.userName, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || "Utilisateur"}</span>
                    <span style={{ fontSize:"11px", color:tk.userEmail, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email || ""}</span>
                </div>
                <Link href="/profile" title={t.profile_title} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.settingsBg, border:`1px solid ${tk.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, textDecoration:"none" }}>
                    <svg width="15" height="15" fill="none" stroke={tk.navText} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </Link>
                <LogoutBtn />
            </div>
        </>
    );

    return (
        <LangContext.Provider value={{ lang, t, setLang }}>
            <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", background:tk.root, direction: isRTL ? 'rtl' : 'ltr' }}>

                {/* Mobile sidebar */}
                <aside style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", top:0, left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', height:"100vh", overflowY:"auto", zIndex:40, transition:"transform 0.25s ease", position:"fixed", background:tk.sidebar, borderRight: isRTL ? 'none' : `1px solid ${tk.border}`, borderLeft: isRTL ? `1px solid ${tk.border}` : 'none', transform: sidebarOpen ? "translateX(0)" : isRTL ? "translateX(100%)" : "translateX(-100%)" }}>
                    <SidebarContent mobile />
                </aside>

                {/* Desktop sidebar */}
                <aside style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", zIndex:30, background:tk.sidebar, borderRight: isRTL ? 'none' : `1px solid ${tk.border}`, borderLeft: isRTL ? `1px solid ${tk.border}` : 'none', order: isRTL ? 2 : 0 }}>
                    <SidebarContent />
                </aside>

                {/* Overlay */}
                {sidebarOpen && <div style={{ position:"fixed", inset:0, background:tk.overlay, zIndex:35 }} onClick={() => setSidebarOpen(false)} />}

                {/* Main */}
                <main style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", background:tk.main }}>
                    {/* Mobile topbar */}
                    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", position:"sticky", top:0, zIndex:10, background:tk.mobileBar, borderBottom:`1px solid ${tk.border}`, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", display:"flex" }}>
                            <svg width="20" height="20" fill="none" stroke={dark ? "#94A3B8" : "#374151"} strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                        <span style={{ fontSize:"15px", fontWeight:800, color:tk.mobileLogo }}>SmartPlanner</span>
                        <div style={{ marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0, display:'flex', gap:'6px' }}>
                            <button onClick={toggleDark} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.settingsBg, border:"none", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                {dark ? "☀️" : "🌙"}
                            </button>
                            <LogoutBtn />
                        </div>
                    </div>
                    <div style={{ flex:1 }}>{children}</div>
                </main>
            </div>
        </LangContext.Provider>
    );
}
