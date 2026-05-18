import { Link, usePage } from "@inertiajs/react";

const NAV = [
    {
        href: "dashboard",
        label: "Tableau de bord",
        icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: "schedule.index",
        label: "Mon planning",
        icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        href: "fixed-events.index",
        label: "Tâches fixes",
        icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        href: "preferences.edit",
        label: "Préférences",
        icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
    },
    {
        href: "export.index",
        label: "Exporter",
        icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        ),
    },
];

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    function isActive(routeName) {
        try { return route().current(routeName); } catch { return false; }
    }

    return (
        <div style={s.root}>
            {/* ── Sidebar ── */}
            <aside style={{ ...s.sidebar, transform: sidebarOpen ? "translateX(0)" : undefined }}>
                {/* Logo */}
                <div style={s.logo}>
                    <div style={s.logoIcon}>
                        <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span style={s.logoText}>SmartPlanner</span>
                </div>

                {/* Nav */}
                <nav style={s.nav}>
                    <p style={s.navSection}>Navigation</p>
                    {NAV.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={''}
                                href={""}
                                style={{
                                    ...s.navLink,
                                    ...(active ? s.navLinkActive : {}),
                                }}
                            >
                                <span style={{ ...s.navIcon, color: active ? "#6366F1" : "#9CA3AF" }}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {active && <span style={s.navActiveDot} />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Generate CTA */}
                <div style={s.sidebarCta}>
                    <Link href={""} style={s.ctaBtn}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Générer le planning
                    </Link>
                </div>

                {/* User */}
                <div style={s.userBar}>
                    <div style={s.userAvatar}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div style={s.userInfo}>
                        <span style={s.userName}>{user?.name || "Utilisateur"}</span>
                        <span style={s.userEmail}>{user?.email || ""}</span>
                    </div>
                    <Link href={""} style={s.userSettings} title="Profil">
                        <svg width="15" height="15" fill="none" stroke="#9CA3AF" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </Link>
                </div>
            </aside>

            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    style={s.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main ── */}
            <main style={s.main}>
                {/* Mobile topbar */}
                <div style={s.mobileBar}>
                    <button onClick={() => setSidebarOpen(true)} style={s.menuBtn}>
                        <svg width="20" height="20" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span style={s.mobileLogo}>SmartPlanner</span>
                </div>

                <div style={s.content}>{children}</div>
            </main>
        </div>
    );
}

import React from "react";

const s = {
    root: {
        display: "flex",
        minHeight: "100vh",
        background: "#F9FAFB",
        fontFamily: "'DM Sans', sans-serif",
    },
    sidebar: {
        width: "240px",
        flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #F3F4F6",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 30,
        "@media(max-width:768px)": {
            position: "fixed",
            left: 0,
            top: 0,
            transform: "translateX(-100%)",
            transition: "transform 0.25s ease",
        },
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "20px 20px 16px",
        borderBottom: "1px solid #F3F4F6",
    },
    logoIcon: {
        width: "32px",
        height: "32px",
        background: "#4F46E5",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    logoText: {
        fontSize: "15px",
        fontWeight: 800,
        color: "#111827",
        letterSpacing: "-0.02em",
    },
    nav: {
        flex: 1,
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    navSection: {
        fontSize: "10px",
        fontWeight: 700,
        color: "#D1D5DB",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "0 8px",
        margin: "0 0 8px",
    },
    navLink: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 10px",
        borderRadius: "8px",
        fontSize: "13.5px",
        fontWeight: 500,
        color: "#6B7280",
        textDecoration: "none",
        transition: "all 0.12s",
        position: "relative",
    },
    navLinkActive: {
        background: "#F5F3FF",
        color: "#4F46E5",
        fontWeight: 600,
    },
    navIcon: {
        flexShrink: 0,
        display: "flex",
    },
    navActiveDot: {
        marginLeft: "auto",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#6366F1",
    },
    sidebarCta: {
        padding: "12px 16px",
        borderTop: "1px solid #F3F4F6",
    },
    ctaBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        width: "100%",
        padding: "10px",
        background: "#4F46E5",
        color: "#fff",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
        textDecoration: "none",
        boxSizing: "border-box",
    },
    userBar: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 16px",
        borderTop: "1px solid #F3F4F6",
    },
    userAvatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#EEF2FF",
        color: "#4F46E5",
        fontSize: "13px",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
    },
    userName: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#111827",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    userEmail: {
        fontSize: "11px",
        color: "#9CA3AF",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    userSettings: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "6px",
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        textDecoration: "none",
    },
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        zIndex: 20,
    },
    main: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
    },
    mobileBar: {
        display: "none",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: "#fff",
        borderBottom: "1px solid #F3F4F6",
        position: "sticky",
        top: 0,
        zIndex: 10,
        "@media(max-width:768px)": { display: "flex" },
    },
    menuBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
    },
    mobileLogo: {
        fontSize: "15px",
        fontWeight: 800,
        color: "#111827",
    },
    content: {
        flex: 1,
    },
};
