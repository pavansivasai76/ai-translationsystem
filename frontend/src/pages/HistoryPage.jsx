/* History Page — View past translations with filtering */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { historyAPI } from '../services/api';
import { Clock, Trash2, Filter, ChevronDown, Type, FileImage, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcons = { text: Type, ocr: FileImage, pdf: FileText, batch: Type };
const typeColors = { text: '#6366f1', ocr: '#06b6d4', pdf: '#8b5cf6', batch: '#10b981' };

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [expanded, setExpanded] = useState(null);

    const fetchHistory = () => {
        setLoading(true);
        historyAPI.getAll({ limit: 50, translation_type: filter || undefined })
            .then(res => setHistory(res.data))
            .catch(() => toast.error('Failed to load history'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchHistory(); }, [filter]);

    const handleDelete = async (id) => {
        try {
            await historyAPI.delete(id);
            setHistory(h => h.filter(t => t.id !== id));
            toast.success('Deleted');
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div>
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Translation History</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and manage your past translations.</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select className="select-field" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="text">Text</option>
                        <option value="ocr">OCR</option>
                        <option value="pdf">PDF</option>
                        <option value="batch">Batch</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : history.length === 0 ? (
                <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                    <Clock size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 4 }}>No translations yet</p>
                    <p style={{ color: 'var(--text-muted)' }}>Your translation history will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {history.map((item, i) => {
                        const Icon = typeIcons[item.translation_type] || Type;
                        const color = typeColors[item.translation_type] || '#6366f1';
                        const isExpanded = expanded === item.id;

                        return (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card" style={{ overflow: 'hidden' }}>
                                <div onClick={() => setExpanded(isExpanded ? null : item.id)} style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={20} color={color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.source_text.substring(0, 100)}
                                        </p>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            <span>{item.source_language} → {item.target_language}</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className={`badge badge-${item.translation_type === 'text' ? 'primary' : item.translation_type === 'ocr' ? 'warning' : 'success'}`} style={{ flexShrink: 0 }}>
                                        {item.translation_type}
                                    </span>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                        <ChevronDown size={18} color="var(--text-muted)" />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ borderTop: '1px solid var(--border)' }}>
                                            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Source</span>
                                                    <p style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{item.source_text}</p>
                                                </div>
                                                <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Translation</span>
                                                    <p style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{item.translated_text}</p>
                                                </div>
                                            </div>
                                            <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'space-between' }}>
                                                {item.confidence_score && <span className="badge badge-success">Confidence: {(item.confidence_score * 100).toFixed(1)}%</span>}
                                                <motion.button whileHover={{ scale: 1.1 }} onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                                                    <Trash2 size={14} /> Delete
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
