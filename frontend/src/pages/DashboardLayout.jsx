/* Dashboard Layout — Sidebar navigation + main content area */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Languages, Type, FileImage, FileText, Clock, BarChart3, Bot, Sun, Moon, LogOut, Menu, X, Home, ChevronRight } from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview', end: true },
    { path: '/dashboard/translate', icon: Type, label: 'Text Translation' },
    { path: '/dashboard/ocr', icon: FileImage, label: 'Image OCR' },
    { path: '/dashboard/pdf', icon: FileText, label: 'PDF Translation' },
    { path: '/dashboard/history', icon: Clock, label: 'History' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div style={{ padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Languages size={20} color="white" />
                </div>
                {sidebarOpen && <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Translate<span className="gradient-text">AI</span></span>}
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map(({ path, icon: Icon, label, end }) => (
                    <NavLink key={path} to={path} end={end} onClick={() => setMobileOpen(false)} style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
                        textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400, transition: 'all 0.2s',
                        background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                        border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                    })}>
                        <Icon size={20} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    {sidebarOpen && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
                    <LogOut size={20} />
                    {sidebarOpen && <span>Sign Out</span>}
                </button>
            </div>
        </>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Desktop Sidebar */}
            <motion.aside animate={{ width: sidebarOpen ? 260 : 72 }} transition={{ duration: 0.3 }} style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
                background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }} className="hidden-mobile">
                <SidebarContent />
            </motion.aside>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }} />
                        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} style={{
                            position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, zIndex: 50,
                            background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 72, transition: 'margin-left 0.3s', minHeight: '100vh' }}>
                {/* Top bar */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 30, height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 28px', background: 'var(--bg-primary)',
                    borderBottom: '1px solid var(--border)', backdropFilter: 'blur(10px)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                            <Menu size={22} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                            <div style={{ fontWeight: 600 }}>{user?.full_name || user?.username}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                        </div>
                    </div>
                </header>

                <div style={{ padding: 28 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
