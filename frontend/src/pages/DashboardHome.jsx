/* Dashboard Overview — Stats cards and recent activity */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services/api';
import { Type, FileImage, FileText, Hash, Clock, TrendingUp } from 'lucide-react';

export default function DashboardHome() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.stats()
            .then(res => setStats(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const statCards = stats ? [
        { icon: TrendingUp, label: 'Total Translations', value: stats.total_translations, color: '#6366f1' },
        { icon: Type, label: 'Text Translations', value: stats.text_translations, color: '#06b6d4' },
        { icon: FileImage, label: 'OCR Translations', value: stats.ocr_translations, color: '#8b5cf6' },
        { icon: FileText, label: 'PDF Processed', value: stats.pdf_translations, color: '#10b981' },
        { icon: Hash, label: 'Characters Processed', value: stats.total_characters.toLocaleString(), color: '#f59e0b' },
    ] : [];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's your translation activity overview.</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
                {statCards.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon size={22} color={s.color} />
                            </div>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Translations */}
            <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={20} color="var(--primary)" /> Recent Translations
                </h3>
                {stats?.recent_translations?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {stats.recent_translations.map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 18px', borderRadius: 10, background: 'var(--bg-glass)', border: '1px solid var(--border)',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>
                                        {t.source_text.substring(0, 80)}{t.source_text.length > 80 ? '...' : ''}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        {t.source_language} → {t.target_language} • {t.translation_type}
                                    </div>
                                </div>
                                <span className={`badge badge-${t.translation_type === 'text' ? 'primary' : t.translation_type === 'ocr' ? 'warning' : 'success'}`}>
                                    {t.translation_type}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No translations yet. Start translating to see your activity here!</p>
                )}
            </div>
        </div>
    );
}
