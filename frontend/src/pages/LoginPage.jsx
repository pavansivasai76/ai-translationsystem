/* Login Page */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Languages, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24, position: 'relative' }}>
            {/* Background effects */}
            <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(100px)' }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(6,182,212,0.04)', filter: 'blur(80px)' }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 40, position: 'relative' }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Languages size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Translate<span className="gradient-text">AI</span></span>
                </Link>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, fontSize: '0.95rem' }}>Sign in to your account</p>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', marginBottom: 20, fontSize: '0.9rem' }}>
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: 42 }} required />
                        </div>
                    </div>
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: 42 }} required />
                        </div>
                    </div>
                    <motion.button type="submit" className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Signing in...' : <>Sign In <ArrowRight size={18} /></>}
                    </motion.button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
}
