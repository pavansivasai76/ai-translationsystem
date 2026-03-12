/* Landing Page — Premium hero section with feature cards & animations */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Languages, FileImage, FileText, Brain, Shield, Zap, BarChart3, Bot, ArrowRight, Sparkles } from 'lucide-react';

const features = [
    { icon: Languages, title: 'AI Translation', desc: 'Neural machine translation for Hindi, Nepali, Telugu & English with confidence scoring', color: '#6366f1' },
    { icon: FileImage, title: 'Image OCR', desc: 'Extract & translate text from images using advanced Tesseract OCR preprocessing', color: '#06b6d4' },
    { icon: FileText, title: 'PDF Processing', desc: 'Page-by-page PDF translation with OCR fallback for scanned documents', color: '#8b5cf6' },
    { icon: Brain, title: 'NLP Analysis', desc: 'AI summarization, sentiment analysis, and keyword extraction on translations', color: '#10b981' },
    { icon: Bot, title: 'AI Assistant', desc: 'Interactive chatbot for translation, analysis, and language exploration', color: '#f59e0b' },
    { icon: BarChart3, title: 'Analytics', desc: 'Track usage with visual graphs, language stats, and translation history', color: '#ec4899' },
];

const stats = [
    { value: '4+', label: 'Languages' },
    { value: 'AI', label: 'Powered' },
    { value: '∞', label: 'Documents' },
    { value: '99%', label: 'Accuracy' },
];

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* ── Navbar ──────────────────── */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', background: 'rgba(15,15,35,0.8)', borderBottom: '1px solid var(--border)' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Languages size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>Translate<span className="gradient-text">AI</span> Pro</span>
                </Link>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/login"><button className="btn-secondary" style={{ padding: '10px 20px' }}>Log In</button></Link>
                    <Link to="/signup"><button className="btn-primary" style={{ padding: '10px 20px' }}>Get Started <ArrowRight size={16} /></button></Link>
                </div>
            </nav>

            {/* ── Hero ───────────────────── */}
            <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative' }}>
                {/* Background glow */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 500, background: 'var(--gradient-hero)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 120, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', top: 200, right: '20%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', filter: 'blur(60px)' }} />

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--bg-glass)', marginBottom: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Sparkles size={14} color="var(--primary-light)" />
                        Powered by Advanced AI & Transformers
                    </motion.div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
                        Break Language Barriers<br />
                        <span className="gradient-text">with AI Translation</span>
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
                        Translate text, images, and documents between Hindi, Nepali, Telugu & English using state-of-the-art neural machine translation.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup">
                            <motion.button className="btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: 14 }}>
                                Start Translating Free <ArrowRight size={18} />
                            </motion.button>
                        </Link>
                        <Link to="/login">
                            <motion.button className="btn-secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: 14 }}>
                                View Dashboard
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats bar */}
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 64, flexWrap: 'wrap' }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{s.value}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ── Features Grid ──────────── */}
            <section style={{ padding: '60px 32px 100px', maxWidth: 1200, margin: '0 auto' }}>
                <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
                    Everything You Need
                </motion.h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 48, fontSize: '1.05rem' }}>
                    A complete AI-powered translation suite for text, images, and documents.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    {features.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card" style={{ padding: 32, cursor: 'default' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <f.icon size={26} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── CTA ────────────────────── */}
            <section style={{ padding: '80px 32px', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-card" style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.05) 100%)' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Ready to Break Language Barriers?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>Join TranslateAI Pro and experience the future of AI translation.</p>
                    <Link to="/signup">
                        <motion.button className="btn-primary" whileHover={{ scale: 1.05 }} style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: 14 }}>
                            Get Started Now <Sparkles size={18} />
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* ── Footer ─────────────────── */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                © 2026 TranslateAI Pro — AI-Powered Translation Platform. Built with ❤️ using FastAPI & React.
            </footer>
        </div>
    );
}
