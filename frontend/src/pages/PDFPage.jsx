/* PDF Translation Page — Upload and page-by-page translation */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { pdfAPI, downloadAPI } from '../services/api';
import { FileText, Upload, Loader, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PDFPage() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [targetLang, setTargetLang] = useState('en');

    const onDrop = useCallback((accepted) => {
        if (accepted.length) { setFile(accepted[0]); setResult(null); setCurrentPage(0); }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, maxSize: 20 * 1024 * 1024,
    });

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('target_language', targetLang);
            const res = await pdfAPI.process(formData);
            setResult(res.data);
            toast.success(`Processed ${res.data.total_pages} pages!`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'PDF processing failed');
        } finally { setLoading(false); }
    };

    const page = result?.pages?.[currentPage];

    const handleDownload = async (format) => {
        if (!result) return;
        const content = result.pages.map(p => `--- Page ${p.page_number} ---\n${p.translated_text}`).join('\n\n');
        try {
            const res = await downloadAPI[format]({ content, filename: 'pdf-translation' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a'); a.href = url; a.download = `pdf-translation.${format}`; a.click();
            URL.revokeObjectURL(url);
        } catch { toast.error('Download failed'); }
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>PDF Document Translation</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Upload a PDF — extract text from each page and translate with OCR fallback.</p>
            </div>

            {/* Upload */}
            <motion.div {...getRootProps()} whileHover={{ scale: 1.01 }} className="glass-card" style={{
                padding: 48, textAlign: 'center', cursor: 'pointer', marginBottom: 20,
                border: isDragActive ? '2px dashed var(--primary)' : '2px dashed var(--border)',
            }}>
                <input {...getInputProps()} />
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <FileText size={28} color="#8b5cf6" />
                </div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{isDragActive ? 'Drop PDF here...' : 'Drag & drop a PDF, or click to browse'}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Maximum file size: 20MB</p>
            </motion.div>

            {file && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileText size={20} color="#8b5cf6" />
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select className="select-field" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                            <option value="en">🇺🇸 English</option>
                            <option value="hi">🇮🇳 Hindi</option>
                        </select>
                        <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} onClick={handleProcess} disabled={loading}>
                            {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <>Process PDF</>}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Progress */}
            {loading && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20, textAlign: 'center' }}>
                    <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                    <p style={{ fontWeight: 500 }}>Processing PDF pages...</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This may take a moment for large documents</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Results */}
            {result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Page navigation */}
                    <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="badge badge-primary">{result.total_pages} pages</span>
                            <span className="badge badge-success">{result.source_language} → {result.target_language}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="btn-secondary" style={{ padding: '6px 12px' }}>
                                <ChevronLeft size={18} />
                            </button>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: 80, textAlign: 'center' }}>
                                Page {currentPage + 1} / {result.total_pages}
                            </span>
                            <button onClick={() => setCurrentPage(Math.min(result.total_pages - 1, currentPage + 1))} disabled={currentPage >= result.total_pages - 1} className="btn-secondary" style={{ padding: '6px 12px' }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['txt', 'docx', 'pdf'].map(f => (
                                <motion.button key={f} whileHover={{ scale: 1.05 }} onClick={() => handleDownload(f)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                    <Download size={14} /> {f.toUpperCase()}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Page content */}
                    {page && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="glass-card" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Original (Page {page.page_number})</span>
                                    <span className={`badge ${page.method === 'ocr' ? 'badge-warning' : 'badge-primary'}`}>{page.method.toUpperCase()}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 500, overflow: 'auto' }}>{page.original_text}</p>
                            </div>
                            <div className="glass-card" style={{ padding: 24 }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>Translation (Page {page.page_number})</span>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 500, overflow: 'auto' }}>{page.translated_text}</p>
                            </div>
                        </div>
                    )}

                    {/* Page thumbnails */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', padding: '8px 0' }}>
                        {result.pages.map((p, i) => (
                            <motion.button key={i} whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(i)} style={{
                                padding: '8px 16px', borderRadius: 8, border: i === currentPage ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: i === currentPage ? 'rgba(99,102,241,0.1)' : 'var(--bg-glass)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
                            }}>
                                Page {p.page_number}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
