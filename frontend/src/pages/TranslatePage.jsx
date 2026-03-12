/* Text Translation Page — Main translation interface with NLP analysis */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translateAPI } from '../services/api';
import { Languages, ArrowRight, Copy, Check, Wand2, Brain, Hash, MessageSquare, Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function TranslatePage() {
    const [text, setText] = useState('');
    const [sourceLang, setSourceLang] = useState('');
    const [targetLang, setTargetLang] = useState('en');
    const [result, setResult] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleTranslate = async () => {
        if (!text.trim()) return toast.error('Please enter text to translate');
        setLoading(true);
        setResult(null);
        setAnalysis(null);
        try {
            const res = await translateAPI.translate({
                text: text.trim(),
                source_language: sourceLang || null,
                target_language: targetLang,
            });
            setResult(res.data);
            toast.success('Translation complete!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Translation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        const analyzeText = result?.translated_text || text;
        if (!analyzeText) return;
        setAnalyzing(true);
        try {
            const res = await translateAPI.analyze({ text: analyzeText, target_language: 'en' });
            setAnalysis(res.data);
        } catch (err) {
            toast.error('Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const copyToClipboard = (t) => {
        navigator.clipboard.writeText(t);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const swapLanguages = () => {
        if (sourceLang && targetLang) {
            setSourceLang(targetLang);
            setTargetLang(sourceLang);
            if (result) setText(result.translated_text);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>AI Text Translation</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Translate text between Hindi, Nepali, Telugu & English with confidence scoring.</p>
            </div>

            {/* Language Selector Bar */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>SOURCE</label>
                    <select className="select-field" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                        <option value="">Auto Detect</option>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                    </select>
                </div>
                <motion.button whileHover={{ rotate: 180 }} onClick={swapLanguages} style={{ marginTop: 20, width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={18} />
                </motion.button>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>TARGET</label>
                    <select className="select-field" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Translation Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Input */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Source Text</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{text.length} chars</span>
                    </div>
                    <textarea className="textarea-field" placeholder="Enter text to translate... (e.g. नमस्ते, मैं ठीक हूँ)" value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 200 }} />
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTranslate} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                            {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Translating...</> : <><Wand2 size={18} /> Translate</>}
                        </motion.button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                </div>

                {/* Output */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Translation</span>
                        {result && (
                            <button onClick={() => copyToClipboard(result.translated_text)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}>
                                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    </div>
                    <div className="textarea-field" style={{ minHeight: 200, display: 'flex', alignItems: 'flex-start', whiteSpace: 'pre-wrap' }}>
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', margin: 'auto' }}>
                                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Translating...
                                </motion.div>
                            ) : result ? (
                                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
                                    <p>{result.translated_text}</p>
                                </motion.div>
                            ) : (
                                <motion.p key="placeholder" style={{ color: 'var(--text-muted)', margin: 'auto' }}>Translation will appear here...</motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Confidence & Meta */}
                    {result && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span className="badge badge-primary">{result.source_language} → {result.target_language}</span>
                            <span className="badge badge-success">Confidence: {(result.confidence_score * 100).toFixed(1)}%</span>
                            <span className="badge badge-warning">{result.character_count} chars</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Confidence Bar */}
            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Translation Confidence</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: result.confidence_score > 0.8 ? 'var(--success)' : result.confidence_score > 0.5 ? 'var(--warning)' : 'var(--error)' }}>
                            {(result.confidence_score * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-glass)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence_score * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{
                            height: '100%', borderRadius: 4,
                            background: result.confidence_score > 0.8 ? 'var(--success)' : result.confidence_score > 0.5 ? 'var(--warning)' : 'var(--error)',
                        }} />
                    </div>
                </motion.div>
            )}

            {/* NLP Analysis Button & Results */}
            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={20} color="var(--accent)" /> AI Analysis</h3>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAnalyze} disabled={analyzing} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            {analyzing ? 'Analyzing...' : 'Run Analysis'}
                        </motion.button>
                    </div>
                    {analysis && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                            <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>📝 Summary</div>
                                <p style={{ fontSize: '0.9rem' }}>{analysis.summary}</p>
                            </div>
                            <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>💭 Sentiment</div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                    {analysis.sentiment === 'positive' ? '😊' : analysis.sentiment === 'negative' ? '😞' : '😐'} {analysis.sentiment}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score: {analysis.sentiment_score}</p>
                            </div>
                            <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>🔑 Keywords</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {analysis.keywords?.map((kw, i) => (
                                        <span key={i} className="badge badge-primary">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
