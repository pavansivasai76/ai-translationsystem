/* Analytics Dashboard — Charts and graphs for usage statistics */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Globe, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.analytics()
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Analytics Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Visualize your translation activity and usage patterns.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
                {/* Daily Usage */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={20} color="var(--primary)" /> Daily Activity (Last 7 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data?.daily_usage || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="translations" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Monthly Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={20} color="var(--accent)" /> Monthly Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data?.monthly_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Line type="monotone" dataKey="translations" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Language Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={20} color="#8b5cf6" /> Language Distribution
                    </h3>
                    {data?.language_distribution?.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={data.language_distribution} dataKey="count" nameKey="language" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                                    {data.language_distribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
                    )}
                </motion.div>

                {/* Type Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={20} color="var(--success)" /> Feature Usage
                    </h3>
                    {data?.type_distribution?.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.type_distribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis dataKey="type" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={60} />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {data.type_distribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
