/* Signup Page */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Languages, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(form.username, form.email, form.password, form.fullName);
            toast.success('Account created! Welcome to TranslateAI Pro!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20%', right: '30%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(100px)' }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Languages size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Translate<span className="gradient-text">AI</span></span>
                </Link>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Create Account</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, fontSize: '0.95rem' }}>Start translating with AI today</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', marginBottom: 20, fontSize: '0.9rem' }}>
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    {[
                        { field: 'fullName', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
                        { field: 'username', label: 'Username', type: 'text', icon: User, placeholder: 'johndoe' },
                        { field: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
                        { field: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••' },
                    ].map(({ field, label, type, icon: Icon, placeholder }) => (
                        <div key={field} style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
                            <div style={{ position: 'relative' }}>
                                <Icon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type={type} className="input-field" placeholder={placeholder} value={form[field]} onChange={update(field)} style={{ paddingLeft: 42 }} required={field !== 'fullName'} />
                            </div>
                        </div>
                    ))}
                    <motion.button type="submit" className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: '1rem', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}
                    </motion.button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
