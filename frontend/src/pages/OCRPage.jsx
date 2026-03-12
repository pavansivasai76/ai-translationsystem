/* Image OCR Translation Page — Drag-drop upload with side-by-side results */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { ocrAPI, downloadAPI } from '../services/api';
import { FileImage, Upload, Loader, Copy, Check, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OCRPage() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [targetLang, setTargetLang] = useState('en');

    const onDrop = useCallback((accepted) => {
        if (accepted.length) {
            setFile(accepted[0]);
            setPreview(URL.createObjectURL(accepted[0]));
            setResult(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'] }, maxFiles: 1, maxSize: 20 * 1024 * 1024,
    });

    const handleProcess = async () => {
        if (!file) return toast.error('Please upload an image first');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('target_language', targetLang);
            formData.append('ocr_language', 'hin+eng+nep');
            const res = await ocrAPI.translate(formData);
            setResult(res.data);
            toast.success('OCR + Translation complete!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'OCR processing failed');
        } finally {
            setLoading(false);
        }
    };

    const copy = (t) => {
        navigator.clipboard.writeText(t);
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async (format) => {
        if (!result) return;
        try {
            const fn = downloadAPI[format];
            const res = await fn({ content: `Original:\n${result.cleaned_text}\n\nTranslation:\n${result.translated_text}`, filename: 'ocr-translation' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url; a.download = `ocr-translation.${format === 'txt' ? 'txt' : format}`; a.click();
            URL.revokeObjectURL(url);
            toast.success(`Downloaded as ${format.toUpperCase()}`);
        } catch { toast.error('Download failed'); }
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Image OCR Translation</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Upload an image with text — we'll extract and translate it using AI-powered OCR.</p>
            </div>

            {/* Upload Area */}
            <motion.div {...getRootProps()} whileHover={{ scale: 1.01 }} className="glass-card" style={{
                padding: 48, textAlign: 'center', cursor: 'pointer', marginBottom: 20,
                border: isDragActive ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                background: isDragActive ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)',
            }}>
                <input {...getInputProps()} />
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Upload size={28} color="var(--primary)" />
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 4 }}>
                    {isDragActive ? 'Drop your image here...' : 'Drag & drop an image, or click to browse'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports PNG, JPG, BMP, TIFF, WebP (max 20MB)</p>
            </motion.div>

            {/* Preview + Controls */}
            {file && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileImage size={20} color="var(--accent)" />
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select className="select-field" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{ minWidth: 120 }}>
                            <option value="en">🇺🇸 English</option>
                            <option value="hi">🇮🇳 Hindi</option>
                            <option value="ne">🇳🇵 Nepali</option>
                            <option value="te">🇮🇳 Telugu</option>
                        </select>
                        <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} onClick={handleProcess} disabled={loading}>
                            {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Eye size={18} /> Extract & Translate</>}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Progress Bar */}
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Processing image...</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Please wait</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-glass)', overflow: 'hidden' }}>
                        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ width: '40%', height: '100%', borderRadius: 3, background: 'var(--gradient-primary)' }} />
                    </div>
                </motion.div>
            )}

            {/* Side-by-side Results */}
            <AnimatePresence>
                {(preview || result) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Image Preview */}
                        <div className="glass-card" style={{ padding: 20, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Original Image</span>
                            </div>
                            {preview && <img src={preview} alt="Uploaded" style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'contain' }} />}
                            {result && (
                                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Extracted Text:</span>
                                    <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{result.cleaned_text}</p>
                                </div>
                            )}
                        </div>

                        {/* Translation */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Translation</span>
                                {result && (
                                    <button onClick={() => copy(result.translated_text)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}>
                                        {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />} Copy
                                    </button>
                                )}
                            </div>
                            {result ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 200 }}>{result.translated_text}</p>
                                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <span className="badge badge-primary">{result.source_language} → {result.target_language}</span>
                                        <span className="badge badge-success">Confidence: {(result.confidence_score * 100).toFixed(1)}%</span>
                                    </div>
                                    {/* Downloads */}
                                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                        {['txt', 'docx', 'pdf'].map(f => (
                                            <motion.button key={f} whileHover={{ scale: 1.05 }} onClick={() => handleDownload(f)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                                <Download size={14} /> {f.toUpperCase()}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    Translation will appear here after processing...
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
