import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QRContentState, QRContentType, QRDesignState, QRModuleStyle, QREyeStyle, QRFrame, PanelMode, QRHistoryEntry } from '../types';

import { getBrandConfig } from '../services/brandAssets';
import { getModulePath, getFinderPatternPath, isFinderPattern } from '../services/qrUtils';
import AppsHub from './AppsHub';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import {
    Type, Link, Mail, Wifi, Phone, User, MapPin,
    Palette, Image as ImageIcon, Wand2, Loader2,
    Calendar, MessageSquare, Send, DollarSign, Bitcoin,
    Share2, CreditCard, Layers, ChevronRight, Check,
    Lock, Unlock, Globe, Youtube, Facebook, Twitter, Instagram, Linkedin,
    Crop, LayoutTemplate, Info, Github, Code2, Heart, ShieldCheck, Zap, Infinity, Ban, ArrowRight, CheckCircle2, HelpCircle, Map,
    RotateCcw, ToggleLeft, ToggleRight, AlertTriangle, Smartphone, Camera, Award, FileImage, Settings,
    ShoppingBag, Coffee, MessageCircle, Navigation, LayoutGrid, X, Search, MoreHorizontal, QrCode,
    History, Trash2, RotateCw, Star, Apple, Download, Clock, Barcode, Scan
} from 'lucide-react';
import QRCodeLib from 'qrcode';

interface ControlPanelProps {
    content: QRContentState;
    setContent: (c: QRContentState) => void;
    design: QRDesignState;
    setDesign: (d: React.SetStateAction<QRDesignState>) => void;
    activeMode: PanelMode;
    setActiveMode: (mode: PanelMode) => void;
    onReset: () => void;
    history: QRHistoryEntry[];
    onSaveToHistory: () => void;
    onRestoreHistory: (entry: QRHistoryEntry) => void;
    onDeleteHistory: (id: string) => void;
    onClearHistory: () => void;
}

// Custom Google Play Store icon — filled play-button triangle
const PlayStoreIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3.18 23.76c.38.21.84.22 1.24.02L19.1 13.5c.36-.2.59-.58.59-.99s-.23-.79-.59-1L4.42.24C4.02.03 3.56.04 3.18.25A1.17 1.17 0 0 0 2.57 1.3v21.4c0 .44.23.84.61 1.06z" />
    </svg>
);

// Custom filled barcode icon — clearly visible at any size/color
const BarcodeQRIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <rect x="1"  y="3" width="2" height="18" rx="0.5" />
        <rect x="4"  y="3" width="1" height="18" rx="0.5" />
        <rect x="6"  y="3" width="3" height="18" rx="0.5" />
        <rect x="10" y="3" width="1" height="18" rx="0.5" />
        <rect x="12" y="3" width="2" height="18" rx="0.5" />
        <rect x="15" y="3" width="1" height="18" rx="0.5" />
        <rect x="17" y="3" width="3" height="18" rx="0.5" />
        <rect x="21" y="3" width="2" height="18" rx="0.5" />
    </svg>
);

// Categories for grouping
const CATEGORIES = [
    {
        id: 'essential',
        label: 'Essentials',
        types: [QRContentType.URL, QRContentType.TEXT, QRContentType.WIFI, QRContentType.APP_STORE, QRContentType.PLAY_STORE]
    },
    {
        id: 'contact',
        label: 'Contact & Social',
        types: [QRContentType.EMAIL, QRContentType.PHONE, QRContentType.VCARD, QRContentType.SOCIAL, QRContentType.WHATSAPP, QRContentType.TELEGRAM, QRContentType.SMS]
    },
    {
        id: 'finance',
        label: 'Finance & Crypto',
        types: [QRContentType.UPI, QRContentType.PAYPAL, QRContentType.CRYPTO]
    },
    {
        id: 'misc',
        label: 'Location & Event',
        types: [QRContentType.GEO, QRContentType.EVENT]
    },
    {
        id: 'advanced',
        label: 'Advanced',
        types: [QRContentType.BARCODE_QR]
    }
];

const TYPE_CONFIG: Record<QRContentType, { icon: React.ElementType, label: string, desc: string }> = {
    [QRContentType.URL]: { icon: Link, label: 'Website URL', desc: 'Link to any page' },
    [QRContentType.TEXT]: { icon: Type, label: 'Plain Text', desc: 'Simple message' },
    [QRContentType.WIFI]: { icon: Wifi, label: 'WiFi Network', desc: 'Join automatically' },
    [QRContentType.EMAIL]: { icon: Mail, label: 'Email', desc: 'Send a mail' },
    [QRContentType.VCARD]: { icon: User, label: 'vCard', desc: 'Digital contact' },
    [QRContentType.PHONE]: { icon: Phone, label: 'Call', desc: 'Dial a number' },
    [QRContentType.SMS]: { icon: MessageSquare, label: 'SMS', desc: 'Send text' },
    [QRContentType.WHATSAPP]: { icon: MessageSquare, label: 'WhatsApp', desc: 'Start chat' },
    [QRContentType.TELEGRAM]: { icon: Send, label: 'Telegram', desc: 'Open channel' },
    [QRContentType.EVENT]: { icon: Calendar, label: 'Event', desc: 'Add to calendar' },
    [QRContentType.GEO]: { icon: MapPin, label: 'Location', desc: 'Open Maps' },
    [QRContentType.UPI]: { icon: CreditCard, label: 'UPI Pay', desc: 'India payments' },
    [QRContentType.PAYPAL]: { icon: DollarSign, label: 'PayPal', desc: 'Global payments' },
    [QRContentType.CRYPTO]: { icon: Bitcoin, label: 'Crypto', desc: 'Wallet address' },
    [QRContentType.SOCIAL]: { icon: Share2, label: 'Social', desc: 'Profile link' },
    [QRContentType.APP_STORE]: { icon: Apple, label: 'iOS App Store', desc: 'Apple App Store link' },
    [QRContentType.PLAY_STORE]: { icon: PlayStoreIcon, label: 'Play Store', desc: 'Google Play link' },
    [QRContentType.BARCODE_QR]: { icon: BarcodeQRIcon, label: 'Barcode QR', desc: 'Scan QR → see barcode' },
};

// --- Mini QR Preview Component ---
interface MiniQRProps {
    moduleStyle: QRModuleStyle;
    eyeStyle: QREyeStyle;
    label: string;
    isSelected: boolean;
    onClick: () => void;
    focus: 'module' | 'eye';
}

const MiniQRPreview: React.FC<MiniQRProps> = React.memo(({ moduleStyle, eyeStyle, label, isSelected, onClick, focus }) => {
    const [paths, setPaths] = useState({ modules: '', finder: '' });

    useEffect(() => {
        try {
            const qr = QRCode.create('A', { errorCorrectionLevel: 'M' });
            const matrix = qr.modules.data;
            const size = qr.modules.size;
            const cellSize = 10;

            let mp = '';
            let fp = '';

            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (matrix[r * size + c]) {
                        if (isFinderPattern(r, c, size)) continue;
                        mp += getModulePath(r, c, cellSize, moduleStyle);
                    }
                }
            }

            fp += getFinderPatternPath(0, 0, cellSize, eyeStyle, size);
            fp += getFinderPatternPath(0, size - 7, cellSize, eyeStyle, size);
            fp += getFinderPatternPath(size - 7, 0, cellSize, eyeStyle, size);

            setPaths({ modules: mp, finder: fp });

        } catch (e) {
            console.error("Preview Gen Error", e);
        }
    }, [moduleStyle, eyeStyle]);

    const viewBox = `0 0 210 210`;

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${isSelected ? 'bg-indigo-50/50 border-indigo-500/50 ring-2 ring-indigo-500/20 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
        >
            <div className={`w-16 h-16 relative p-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>
                <svg viewBox={viewBox} className="w-full h-full drop-shadow-sm">
                    <path d={paths.modules} fill={focus === 'module' ? '#4f46e5' : '#94a3b8'} />
                    <path d={paths.finder} fill={focus === 'eye' ? '#4f46e5' : '#94a3b8'} />
                </svg>
            </div>
            <span className={`text-xs font-semibold tracking-wide ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>{label}</span>
        </button>
    );
});

// --- UI Components ---
const SectionHeader = ({ title, desc }: { title: string, desc: string }) => (
    <div className="mb-6 px-1">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </div>
);

const InputGroup = ({ label, children, icon: Icon }: { label: string, children: React.ReactNode, icon?: React.ElementType }) => (
    <div className="group">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500" size={18} />}
            {children}
        </div>
    </div>
);

const inputClass = `w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm hover:border-slate-300`;
const inputWithIconClass = `${inputClass} pl-11`;

const renderToggleGroup = <T extends string>(
    options: { value: T; label: string; icon?: React.ElementType }[],
    current: T,
    onChange: (val: T) => void
) => (
    <div className="flex p-1.5 bg-slate-100/80 rounded-xl gap-1 border border-slate-200/50">
        {options.map((opt) => {
            const isActive = current === opt.value;
            return (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${isActive
                        ? 'bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5'
                        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                        }`}
                >
                    {opt.icon && <opt.icon size={14} className={isActive ? 'text-indigo-500' : 'text-slate-400'} />}
                    {opt.label}
                </button>
            );
        })}
    </div>
);

// --- History Mini QR Thumbnail ---
const HistoryQRThumbnail: React.FC<{ value: string }> = ({ value }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current || !value) return;
        QRCodeLib.toCanvas(canvasRef.current, value.slice(0, 500), { width: 80, margin: 1, color: { dark: '#1e293b', light: '#ffffff' } }).catch(() => {});
    }, [value]);
    return <canvas ref={canvasRef} width={80} height={80} className="rounded-lg" />;
};

// --- History Panel ---
interface HistoryPanelProps {
    history: QRHistoryEntry[];
    onRestore: (entry: QRHistoryEntry) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
    onSave: () => void;
    onBack: () => void;
    currentQrValue: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore, onDelete, onClear, onSave, onBack, currentQrValue }) => {
    const formatTime = (ts: number) => {
        const d = new Date(ts);
        const now = new Date();
        const diffMs = now.getTime() - ts;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="flex-1 h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200/60 px-8 pt-8 pb-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">History</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">{history.length} saved QR code{history.length !== 1 ? 's' : ''} — stored locally in your browser.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentQrValue && (
                            <button
                                onClick={onSave}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                                <Star size={14} />
                                Save Current
                            </button>
                        )}
                        {history.length > 0 && (
                            <button
                                onClick={() => window.confirm('Clear all history?') && onClear()}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
                            >
                                <Trash2 size={14} />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6">
                            <Clock size={40} className="text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No history yet</h3>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">QR codes are saved automatically when you click <strong>Save</strong>, or click <strong>Save Current</strong> above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-[1600px]">
                        {history.map((entry) => (
                            <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-lg transition-all duration-200 group flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                        <HistoryQRThumbnail value={entry.qrValue} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                                {entry.contentType}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 truncate leading-tight mt-1">{entry.label}</p>
                                        <p className="text-xs text-slate-400 mt-1">{formatTime(entry.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRestore(entry)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors"
                                    >
                                        <RotateCw size={12} />
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors flex-shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Barcode inline preview sub-component ──────────────────────────────────────
const BarcodeInlinePreview: React.FC<{ data: string; format: string }> = ({ data, format }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!svgRef.current || !data.trim()) return;
        try {
            JsBarcode(svgRef.current, data, {
                format,
                width: 1.5,
                height: 60,
                displayValue: true,
                fontSize: 12,
                margin: 8,
                background: '#ffffff',
                lineColor: '#1e293b',
            });
            setError(null);
        } catch (e: unknown) {
            setError((e as Error).message?.replace(/^JsBarcode:\s*/i, '') ?? 'Invalid');
        }
    }, [data, format]);

    if (!data.trim()) return (
        <div className="flex items-center justify-center h-[90px] bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Enter barcode data to preview</p>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-[90px] bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs text-red-500 font-medium px-3 text-center">{error}</p>
        </div>
    );

    return (
        <div className="flex items-center justify-center bg-white rounded-xl border border-slate-200 overflow-hidden py-2">
            <svg ref={svgRef} className="max-w-full" />
        </div>
    );
};
// ──────────────────────────────────────────────────────────────────────────────

const ControlPanel: React.FC<ControlPanelProps> = ({ content, setContent, design, setDesign, activeMode, setActiveMode, onReset, history, onSaveToHistory, onRestoreHistory, onDeleteHistory, onClearHistory }) => {
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);

    const update = useCallback((updates: Partial<QRContentState>) => {
        setContent(prev => ({ ...prev, ...updates }));
    }, [setContent]);

    const applyAutoBrand = (type: QRContentType, subType?: string) => {
        const brandStyle = getBrandConfig(type, subType);
        setDesign(prev => ({
            ...prev,
            isBranded: true,
            fgColor: brandStyle.fgColor,
            bgColor: brandStyle.bgColor,
            eyeStyle: brandStyle.eyeStyle,
            logoUrl: brandStyle.logoUrl || null,
            logoSize: 0.22
        }));
    };



    const recolorLogo = (color: string) => {
        if (!design.logoUrl || !design.logoUrl.includes('image/svg+xml')) return;
        const parts = design.logoUrl.split(',');
        if (parts.length < 2) return;
        try {
            const decoded = atob(parts[1]);
            const newSvg = decoded.replace(/fill="[^"]*"/g, `fill="${color}"`);
            setDesign(prev => ({ ...prev, logoUrl: `${parts[0]},${btoa(newSvg)}` }));
        } catch (e) {
            console.error("Failed to recolor SVG", e);
        }
    };

    useEffect(() => {
        let newVal = content.value;
        switch (content.type) {
            case QRContentType.WIFI:
                if (content.wifi) newVal = `WIFI:S:${content.wifi.ssid};T:${content.wifi.encryption};P:${content.wifi.pass};;`;
                break;
            case QRContentType.EMAIL:
                if (content.email) newVal = `mailto:${content.email.to}?subject=${encodeURIComponent(content.email.subject)}&body=${encodeURIComponent(content.email.body)}`;
                break;
            case QRContentType.PHONE:
                if (content.phone) newVal = `tel:${content.phone}`;
                break;
            case QRContentType.SMS:
                if (content.sms) newVal = `smsto:${content.sms.phone}:${content.sms.message}`;
                break;
            case QRContentType.WHATSAPP:
                if (content.whatsapp) newVal = `https://wa.me/${content.whatsapp.phone.replace(/\+/g, '')}?text=${encodeURIComponent(content.whatsapp.message)}`;
                break;
            case QRContentType.TELEGRAM:
                if (content.telegram) newVal = `https://t.me/${content.telegram}`;
                break;
            case QRContentType.GEO:
                if (content.geo?.mode === 'url') {
                    newVal = content.geo.url || '';
                } else if (content.geo) {
                    newVal = `geo:${content.geo.lat},${content.geo.lng}`;
                }
                break;
            case QRContentType.EVENT:
                if (content.event) {
                    const formatTime = (d: string) => d.replace(/[-:]/g, '') + '00';
                    newVal = `BEGIN:VEVENT\nSUMMARY:${content.event.title}\nLOCATION:${content.event.location}\nDESCRIPTION:${content.event.notes}\nDTSTART:${formatTime(content.event.start)}\nDTEND:${formatTime(content.event.end)}\nEND:VEVENT`;
                }
                break;
            case QRContentType.UPI:
                if (content.upi) newVal = `upi://pay?pa=${content.upi.id}&pn=${encodeURIComponent(content.upi.name)}&am=${content.upi.amount}&tn=${encodeURIComponent(content.upi.note)}`;
                break;
            case QRContentType.PAYPAL:
                if (content.paypal) newVal = `https://paypal.me/${content.paypal.username}`;
                break;
            case QRContentType.CRYPTO:
                if (content.crypto) newVal = `${content.crypto.coin}:${content.crypto.address}?amount=${content.crypto.amount}`;
                break;
            case QRContentType.SOCIAL:
                if (content.social) {
                    const { platform, handle } = content.social;
                    if (platform === 'linkedin') {
                        if (handle.includes('linkedin.com')) {
                            newVal = handle;
                        } else {
                            newVal = `https://linkedin.com/in/${handle}`;
                        }
                    } else {
                        const bases: Record<string, string> = {
                            twitter: 'https://twitter.com/',
                            facebook: 'https://facebook.com/',
                            instagram: 'https://instagram.com/',
                            linkedin: 'https://linkedin.com/in/',
                            youtube: 'https://youtube.com/@'
                        };
                        newVal = `${bases[platform]}${handle}`;
                    }
                }
                break;
            case QRContentType.VCARD:
                if (content.vcard) {
                    const v = content.vcard;
                    newVal = `BEGIN:VCARD\nVERSION:3.0\nN:${v.lastName};${v.firstName};;;\nFN:${v.firstName} ${v.lastName}\nORG:${v.org}\nTITLE:${v.title}\nTEL:${v.phone}\nEMAIL:${v.email}\nADR:;;${v.street};${v.city};;;${v.country}\nURL:${v.url}\nEND:VCARD`;
                }
                break;
            // APP_STORE and PLAY_STORE use content.value directly (set by their URL inputs)
            case QRContentType.APP_STORE:
            case QRContentType.PLAY_STORE:
                newVal = content.value;
                break;
            case QRContentType.BARCODE_QR:
                if (content.barcodeQR?.data) {
                    const base = `${window.location.origin}/barcode-viewer.html`;
                    const encoded = btoa(unescape(encodeURIComponent(content.barcodeQR.data)));
                    newVal = `${base}?d=${encoded}&f=${content.barcodeQR.format || 'CODE128'}`;
                }
                break;
        }

        if (newVal !== content.value) {
            update({ value: newVal });
        }
    }, [content.type, content.wifi, content.email, content.phone, content.sms, content.whatsapp, content.telegram, content.geo, content.event, content.upi, content.paypal, content.crypto, content.social, content.vcard, content.appStore, content.barcodeQR]);

    // Keep Barcode QR center icon color in sync with the QR's fgColor
    useEffect(() => {
        if (content.type !== QRContentType.BARCODE_QR) return;
        if (!design.logoUrl || !design.logoUrl.includes('image/svg+xml')) return;
        const parts = design.logoUrl.split(',');
        if (parts.length < 2) return;
        try {
            const decoded = atob(parts[1]);
            const recolored = decoded.replace(/fill="[^"]*"/g, `fill="${design.fgColor}"`);
            const newLogoUrl = `${parts[0]},${btoa(recolored)}`;
            if (newLogoUrl !== design.logoUrl) {
                setDesign(prev => ({ ...prev, logoUrl: newLogoUrl }));
            }
        } catch (e) { /* ignore encode errors */ }
    }, [design.fgColor, content.type]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setDesign(prev => ({ ...prev, logoUrl: evt.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const changeType = (t: QRContentType) => {
        setContent({
            ...content,
            type: t,
            value: '',
            wifi: t === QRContentType.WIFI ? { ssid: '', pass: '', encryption: 'WPA' } : content.wifi,
            email: t === QRContentType.EMAIL ? { to: '', subject: '', body: '' } : content.email,
            sms: t === QRContentType.SMS ? { phone: '', message: '' } : content.sms,
            whatsapp: t === QRContentType.WHATSAPP ? { phone: '', message: '' } : content.whatsapp,
            vcard: t === QRContentType.VCARD ? { firstName: '', lastName: '', phone: '', email: '', org: '', title: '', url: '', street: '', city: '', country: '' } : content.vcard,
            event: t === QRContentType.EVENT ? { title: '', location: '', start: '', end: '', notes: '' } : content.event,
            geo: t === QRContentType.GEO ? { lat: '', lng: '', url: '', mode: 'url' } : content.geo,
            upi: t === QRContentType.UPI ? { id: '', name: '', amount: '', note: '' } : content.upi,
            paypal: t === QRContentType.PAYPAL ? { email: '', amount: '', currency: 'USD', note: '' } : content.paypal,
            crypto: t === QRContentType.CRYPTO ? { coin: 'bitcoin', address: '', amount: '' } : content.crypto,
            social: t === QRContentType.SOCIAL ? { platform: 'twitter', handle: '' } : content.social,
            barcodeQR: t === QRContentType.BARCODE_QR ? { data: '', format: 'CODE128' } : content.barcodeQR,
        });

        applyAutoBrand(t);
        setIsTypeSelectorOpen(false);
    };

    const renderForm = () => {
        switch (content.type) {
            case QRContentType.URL:
                return (
                    <div className="space-y-6">
                        <InputGroup label="Website URL" icon={Globe}>
                            <input type="url" value={content.value} onChange={(e) => update({ value: e.target.value })} placeholder="https://example.com" className={inputWithIconClass} autoFocus />
                        </InputGroup>
                    </div>
                );
            case QRContentType.TEXT:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Plain Text</label>
                        </div>
                        <textarea rows={6} value={content.value} onChange={(e) => update({ value: e.target.value })} placeholder="Enter your text here..." className={inputClass} />
                    </div>
                );
            case QRContentType.WIFI:
                return (
                    <div className="space-y-6">
                        <InputGroup label="Network Name (SSID)" icon={Wifi}>
                            <input value={content.wifi?.ssid} onChange={(e) => update({ wifi: { ...content.wifi!, ssid: e.target.value } })} className={inputWithIconClass} placeholder="MyWiFi" />
                        </InputGroup>
                        <InputGroup label="Password" icon={Lock}>
                            <input type="text" value={content.wifi?.pass} onChange={(e) => update({ wifi: { ...content.wifi!, pass: e.target.value } })} className={inputWithIconClass} placeholder="••••••••" />
                        </InputGroup>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Security Type</label>
                            {renderToggleGroup([
                                { value: 'WPA', label: 'WPA/WPA2', icon: Lock },
                                { value: 'WEP', label: 'WEP', icon: ShieldCheck },
                                { value: 'nopass', label: 'Open', icon: Unlock },
                            ], content.wifi?.encryption || 'WPA', (v) => update({ wifi: { ...content.wifi!, encryption: v as any } }))}
                        </div>
                    </div>
                );
            case QRContentType.EMAIL:
                return (
                    <div className="space-y-6">
                        <InputGroup label="Recipient" icon={Mail}>
                            <input type="email" value={content.email?.to} onChange={(e) => update({ email: { ...content.email!, to: e.target.value } })} className={inputWithIconClass} placeholder="friend@example.com" />
                        </InputGroup>
                        <InputGroup label="Subject" icon={Type}>
                            <input type="text" value={content.email?.subject} onChange={(e) => update({ email: { ...content.email!, subject: e.target.value } })} className={inputWithIconClass} placeholder="Hello!" />
                        </InputGroup>
                        <InputGroup label="Message">
                            <textarea rows={4} value={content.email?.body} onChange={(e) => update({ email: { ...content.email!, body: e.target.value } })} className={inputClass} placeholder="Type your message..." />
                        </InputGroup>
                    </div>
                );
            case QRContentType.GEO:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Location Method</label>
                            {renderToggleGroup([
                                { value: 'url', label: 'Map Link (Easy)', icon: Link },
                                { value: 'coords', label: 'Coordinates', icon: MapPin },
                            ], content.geo?.mode || 'url', (v) => update({ geo: { ...content.geo!, mode: v as any } }))}
                        </div>

                        {content.geo?.mode === 'url' ? (
                            <div className="space-y-2">
                                <InputGroup label="Google Maps Link" icon={Map}>
                                    <input
                                        value={content.geo?.url}
                                        onChange={(e) => update({ geo: { ...content.geo!, url: e.target.value } })}
                                        className={inputWithIconClass}
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </InputGroup>
                                <p className="text-[10px] text-slate-400 pl-1">Go to Google Maps, click 'Share', and paste the link here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Latitude">
                                    <input value={content.geo?.lat} onChange={(e) => update({ geo: { ...content.geo!, lat: e.target.value } })} className={inputClass} placeholder="40.7128" />
                                </InputGroup>
                                <InputGroup label="Longitude">
                                    <input value={content.geo?.lng} onChange={(e) => update({ geo: { ...content.geo!, lng: e.target.value } })} className={inputClass} placeholder="-74.0060" />
                                </InputGroup>
                            </div>
                        )}
                    </div>
                );
            case QRContentType.VCARD:
                return (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="First Name"><input value={content.vcard?.firstName} onChange={(e) => update({ vcard: { ...content.vcard!, firstName: e.target.value } })} className={inputClass} placeholder="John" /></InputGroup>
                            <InputGroup label="Last Name"><input value={content.vcard?.lastName} onChange={(e) => update({ vcard: { ...content.vcard!, lastName: e.target.value } })} className={inputClass} placeholder="Doe" /></InputGroup>
                        </div>
                        <InputGroup label="Mobile" icon={Phone}><input value={content.vcard?.phone} onChange={(e) => update({ vcard: { ...content.vcard!, phone: e.target.value } })} className={inputWithIconClass} placeholder="+1 555 000 0000" /></InputGroup>
                        <InputGroup label="Email" icon={Mail}><input value={content.vcard?.email} onChange={(e) => update({ vcard: { ...content.vcard!, email: e.target.value } })} className={inputWithIconClass} placeholder="john@work.com" /></InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Company"><input value={content.vcard?.org} onChange={(e) => update({ vcard: { ...content.vcard!, org: e.target.value } })} className={inputClass} placeholder="Acme Corp" /></InputGroup>
                            <InputGroup label="Job Title"><input value={content.vcard?.title} onChange={(e) => update({ vcard: { ...content.vcard!, title: e.target.value } })} className={inputClass} placeholder="Manager" /></InputGroup>
                        </div>
                        <InputGroup label="Website" icon={Globe}><input value={content.vcard?.url} onChange={(e) => update({ vcard: { ...content.vcard!, url: e.target.value } })} className={inputWithIconClass} placeholder="https://..." /></InputGroup>
                        <InputGroup label="Address" icon={MapPin}><input value={content.vcard?.street} onChange={(e) => update({ vcard: { ...content.vcard!, street: e.target.value } })} className={inputWithIconClass} placeholder="Street" /></InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="City"><input value={content.vcard?.city} onChange={(e) => update({ vcard: { ...content.vcard!, city: e.target.value } })} className={inputClass} placeholder="City" /></InputGroup>
                            <InputGroup label="Country"><input value={content.vcard?.country} onChange={(e) => update({ vcard: { ...content.vcard!, country: e.target.value } })} className={inputClass} placeholder="Country" /></InputGroup>
                        </div>
                    </div>
                );
            case QRContentType.SOCIAL:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Platform</label>
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    { id: 'twitter', icon: Twitter },
                                    { id: 'facebook', icon: Facebook },
                                    { id: 'instagram', icon: Instagram },
                                    { id: 'linkedin', icon: Linkedin },
                                    { id: 'youtube', icon: Youtube }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            update({ social: { ...content.social!, platform: p.id as any } });
                                            applyAutoBrand(QRContentType.SOCIAL, p.id);
                                        }}
                                        className={`aspect-square rounded-2xl border flex items-center justify-center transition-all duration-300 ${content.social?.platform === p.id ? 'bg-indigo-50 border-indigo-500 text-indigo-600 ring-2 ring-indigo-500/20 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-indigo-200'}`}
                                    >
                                        <p.icon size={24} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <InputGroup label={content.social?.platform === 'linkedin' ? 'Profile URL or Username' : 'Username / Handle'} icon={User}>
                            <input
                                value={content.social?.handle}
                                onChange={(e) => update({ social: { ...content.social!, handle: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder={content.social?.platform === 'linkedin' ? "https://linkedin.com/in/name" : "username"}
                            />
                        </InputGroup>
                    </div>
                );
            case QRContentType.UPI:
                return (
                    <div className="space-y-6">
                        <InputGroup label="UPI ID" icon={CreditCard}>
                            <input
                                value={content.upi?.id}
                                onChange={(e) => update({ upi: { ...content.upi!, id: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="yourname@upi"
                            />
                        </InputGroup>
                        <InputGroup label="Payee Name" icon={User}>
                            <input
                                value={content.upi?.name}
                                onChange={(e) => update({ upi: { ...content.upi!, name: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="Your Business Name"
                            />
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Amount (₹)" icon={DollarSign}>
                                <input
                                    type="number"
                                    value={content.upi?.amount}
                                    onChange={(e) => update({ upi: { ...content.upi!, amount: e.target.value } })}
                                    className={inputWithIconClass}
                                    placeholder="100.00"
                                    step="0.01"
                                />
                            </InputGroup>
                            <InputGroup label="Note">
                                <input
                                    value={content.upi?.note}
                                    onChange={(e) => update({ upi: { ...content.upi!, note: e.target.value } })}
                                    className={inputClass}
                                    placeholder="Payment for..."
                                />
                            </InputGroup>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-1">Leave amount empty for flexible payment. Works with Google Pay, PhonePe, Paytm, etc.</p>
                    </div>
                );
            case QRContentType.PAYPAL:
                return (
                    <div className="space-y-6">
                        <InputGroup label="PayPal Email" icon={Mail}>
                            <input
                                type="email"
                                value={content.paypal?.email}
                                onChange={(e) => update({ paypal: { ...content.paypal!, email: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="your@paypal.com"
                            />
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Amount (USD)" icon={DollarSign}>
                                <input
                                    type="number"
                                    value={content.paypal?.amount}
                                    onChange={(e) => update({ paypal: { ...content.paypal!, amount: e.target.value } })}
                                    className={inputWithIconClass}
                                    placeholder="10.00"
                                    step="0.01"
                                />
                            </InputGroup>
                            <InputGroup label="Currency">
                                <input
                                    value={content.paypal?.currency || 'USD'}
                                    onChange={(e) => update({ paypal: { ...content.paypal!, currency: e.target.value } })}
                                    className={inputClass}
                                    placeholder="USD"
                                />
                            </InputGroup>
                        </div>
                        <InputGroup label="Item Description">
                            <input
                                value={content.paypal?.note}
                                onChange={(e) => update({ paypal: { ...content.paypal!, note: e.target.value } })}
                                className={inputClass}
                                placeholder="Payment for services"
                            />
                        </InputGroup>
                    </div>
                );
            case QRContentType.CRYPTO:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Cryptocurrency</label>
                            {renderToggleGroup([
                                { value: 'bitcoin', label: 'Bitcoin', icon: Bitcoin },
                                { value: 'ethereum', label: 'Ethereum' },
                                { value: 'other', label: 'Other' },
                            ], content.crypto?.coin || 'bitcoin', (v) => update({ crypto: { ...content.crypto!, coin: v as any } }))}
                        </div>
                        <InputGroup label="Wallet Address" icon={Bitcoin}>
                            <input
                                value={content.crypto?.address}
                                onChange={(e) => update({ crypto: { ...content.crypto!, address: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                            />
                        </InputGroup>
                        <InputGroup label="Amount (Optional)" icon={DollarSign}>
                            <input
                                type="number"
                                value={content.crypto?.amount}
                                onChange={(e) => update({ crypto: { ...content.crypto!, amount: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="0.001"
                                step="0.00000001"
                            />
                        </InputGroup>
                        <p className="text-[10px] text-slate-400 pl-1">Paste your wallet address. Amount is optional.</p>
                    </div>
                );
            case QRContentType.EVENT:
                return (
                    <div className="space-y-6">
                        <InputGroup label="Event Title" icon={Calendar}>
                            <input
                                value={content.event?.title}
                                onChange={(e) => update({ event: { ...content.event!, title: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="Team Meeting"
                            />
                        </InputGroup>
                        <InputGroup label="Location" icon={MapPin}>
                            <input
                                value={content.event?.location}
                                onChange={(e) => update({ event: { ...content.event!, location: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder="Conference Room A"
                            />
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Start Date & Time">
                                <input
                                    type="datetime-local"
                                    value={content.event?.start}
                                    onChange={(e) => update({ event: { ...content.event!, start: e.target.value } })}
                                    className={inputClass}
                                />
                            </InputGroup>
                            <InputGroup label="End Date & Time">
                                <input
                                    type="datetime-local"
                                    value={content.event?.end}
                                    onChange={(e) => update({ event: { ...content.event!, end: e.target.value } })}
                                    className={inputClass}
                                />
                            </InputGroup>
                        </div>
                        <InputGroup label="Notes (Optional)">
                            <textarea
                                rows={3}
                                value={content.event?.notes}
                                onChange={(e) => update({ event: { ...content.event!, notes: e.target.value } })}
                                className={inputClass}
                                placeholder="Additional event details..."
                            />
                        </InputGroup>
                        <p className="text-[10px] text-slate-400 pl-1">Creates a calendar event that can be added to Google Calendar, Apple Calendar, etc.</p>
                    </div>
                );
            case QRContentType.APP_STORE:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="w-9 h-9 bg-[#007AFF] rounded-xl flex items-center justify-center flex-shrink-0">
                                <Apple size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-900">iOS App Store</p>
                                <p className="text-[11px] text-blue-600 mt-0.5">Generates a QR that opens your app on the Apple App Store.</p>
                            </div>
                        </div>
                        <InputGroup label="App Store URL" icon={Apple}>
                            <input
                                type="url"
                                value={content.value}
                                onChange={(e) => update({ value: e.target.value })}
                                className={inputWithIconClass}
                                placeholder="https://apps.apple.com/app/id..."
                                autoFocus
                            />
                        </InputGroup>
                        <p className="text-[10px] text-slate-400 pl-1">Paste your App Store app link. Use the Play Store type for an Android-specific QR.</p>
                    </div>
                );
            case QRContentType.PLAY_STORE:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                            <div className="w-9 h-9 bg-[#34A853] rounded-xl flex items-center justify-center flex-shrink-0">
                                <PlayStoreIcon size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-green-900">Google Play Store</p>
                                <p className="text-[11px] text-green-600 mt-0.5">Generates a QR that opens your app on Google Play.</p>
                            </div>
                        </div>
                        <InputGroup label="Play Store URL" icon={PlayStoreIcon}>
                            <input
                                type="url"
                                value={content.value}
                                onChange={(e) => update({ value: e.target.value })}
                                className={inputWithIconClass}
                                placeholder="https://play.google.com/store/apps/details?id=..."
                                autoFocus
                            />
                        </InputGroup>
                        <p className="text-[10px] text-slate-400 pl-1">Paste your Google Play app link. Use the iOS App Store type for an iPhone-specific QR.</p>
                    </div>
                );
            case QRContentType.BARCODE_QR: {
                const BC_FORMATS = [
                    { id: 'CODE128', label: 'Code 128', hint: 'All ASCII — universal' },
                    { id: 'EAN13',   label: 'EAN-13',   hint: '12 digits + check' },
                    { id: 'EAN8',    label: 'EAN-8',    hint: '7 digits + check' },
                    { id: 'UPC',     label: 'UPC-A',    hint: '11 digits + check' },
                    { id: 'CODE39',  label: 'Code 39',  hint: 'Uppercase + digits' },
                    { id: 'ITF14',   label: 'ITF-14',   hint: '13 digits, shipping' },
                ];
                const currentFmt = BC_FORMATS.find(f => f.id === (content.barcodeQR?.format || 'CODE128'))!;
                const previewUrl = content.barcodeQR?.data
                    ? `${window.location.origin}/barcode-viewer.html?d=${btoa(unescape(encodeURIComponent(content.barcodeQR.data)))}&f=${content.barcodeQR?.format || 'CODE128'}`
                    : '';
                return (
                    <div className="space-y-6">
                        {/* How it works */}
                        <div className="flex gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <Scan size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-indigo-800 mb-1">How it works</p>
                                <p className="text-[11px] text-indigo-600 leading-relaxed">
                                    This QR encodes a link. When scanned, the phone opens a page that displays the full barcode — great for product labels, menus, and logistics.
                                </p>
                            </div>
                        </div>

                        {/* Format picker */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Barcode Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {BC_FORMATS.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => update({ barcodeQR: { ...content.barcodeQR!, format: f.id } })}
                                        className={`px-2 py-2.5 rounded-xl border text-xs font-bold transition-all text-center leading-tight ${
                                            (content.barcodeQR?.format || 'CODE128') === f.id
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                    >
                                        <span className="block">{f.label}</span>
                                        <span className={`block text-[9px] font-normal mt-0.5 ${(content.barcodeQR?.format || 'CODE128') === f.id ? 'text-indigo-200' : 'text-slate-400'}`}>{f.hint}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data input */}
                        <InputGroup label="Barcode Data" icon={BarcodeQRIcon}>
                            <input
                                type="text"
                                value={content.barcodeQR?.data || ''}
                                onChange={(e) => update({ barcodeQR: { ...content.barcodeQR!, data: e.target.value } })}
                                className={inputWithIconClass}
                                placeholder={currentFmt.hint}
                                autoFocus
                            />
                        </InputGroup>

                        {/* Inline barcode preview */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Barcode Preview</label>
                            <BarcodeInlinePreview
                                data={content.barcodeQR?.data || ''}
                                format={content.barcodeQR?.format || 'CODE128'}
                            />
                        </div>

                        {/* Encoded URL preview */}
                        {previewUrl && (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">QR Encodes This URL</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                    <Globe size={13} className="text-slate-400 flex-shrink-0" />
                                    <p className="text-[10px] font-mono text-slate-500 truncate flex-1">{previewUrl}</p>
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-indigo-500 hover:text-indigo-700 text-[10px] font-bold"
                                    >
                                        Test ↗
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            default:
                const isPhone = content.type === QRContentType.PHONE || content.type === QRContentType.SMS || content.type === QRContentType.WHATSAPP;
                const isMsg = content.type === QRContentType.SMS || content.type === QRContentType.WHATSAPP;
                return (
                    <div className="space-y-6">
                        <InputGroup
                            label={isPhone ? 'Phone Number' : content.type === QRContentType.TELEGRAM ? 'Telegram Username' : TYPE_CONFIG[content.type].label}
                            icon={isPhone ? Phone : content.type === QRContentType.TELEGRAM ? Send : undefined}
                        >
                            <input
                                value={content.type === QRContentType.PHONE ? content.phone :
                                    content.type === QRContentType.SMS ? content.sms?.phone :
                                        content.type === QRContentType.WHATSAPP ? content.whatsapp?.phone :
                                            content.type === QRContentType.TELEGRAM ? content.telegram :
                                                content.value}
                                onChange={e => {
                                    if (content.type === QRContentType.PHONE) update({ phone: e.target.value });
                                    else if (content.type === QRContentType.TELEGRAM) update({ telegram: e.target.value });
                                    else if (content.type === QRContentType.WHATSAPP) update({ whatsapp: { ...content.whatsapp!, phone: e.target.value } });
                                    else if (content.type === QRContentType.SMS) update({ sms: { ...content.sms!, phone: e.target.value } });
                                    else update({ value: e.target.value });
                                }}
                                className={isPhone || content.type === QRContentType.TELEGRAM ? inputWithIconClass : inputClass}
                                placeholder={isPhone ? '+1 234 567 890' : content.type === QRContentType.TELEGRAM ? 'username' : ''}
                            />
                        </InputGroup>

                        {isMsg && (
                            <InputGroup label="Message (Optional)">
                                <textarea
                                    rows={4}
                                    value={content.type === QRContentType.SMS ? content.sms?.message : content.whatsapp?.message}
                                    onChange={e => {
                                        if (content.type === QRContentType.SMS) update({ sms: { ...content.sms!, message: e.target.value } });
                                        if (content.type === QRContentType.WHATSAPP) update({ whatsapp: { ...content.whatsapp!, message: e.target.value } });
                                    }}
                                    className={inputClass}
                                    placeholder="Hello! I'm interested in..."
                                />
                            </InputGroup>
                        )}
                    </div>
                );
        }
    };

    const NavSidebar = () => (
        <div className="flex-shrink-0 bg-slate-50/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-row lg:flex-col items-center lg:py-8 lg:gap-6 order-2 lg:order-1 h-20 lg:h-full w-full lg:w-[88px] relative z-30 justify-evenly lg:justify-start shadow-[1px_0_20px_rgba(0,0,0,0.02)]">
            <div className="hidden lg:flex flex-col items-center gap-4 w-full mb-2">
                {/* Logo Placeholder */}
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">
                    <Code2 size={20} strokeWidth={2.5} />
                </div>
            </div>

            {[
                { id: 'data', icon: QrCode, label: 'QR Code', color: 'indigo' },
                { id: 'design', icon: Palette, label: 'Design', color: 'violet' },
                { id: 'frame', icon: Crop, label: 'Frames', color: 'pink' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveMode(item.id as PanelMode)}
                    className={`
                    group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
                    ${activeMode === item.id
                            ? 'bg-white text-slate-900 shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/5 scale-105'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'}
                `}
                    title={item.label}
                >
                    <item.icon size={22} strokeWidth={activeMode === item.id ? 2 : 1.5} className={`transition-transform duration-300 ${activeMode === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-[10px] font-bold mt-1">{item.label}</span>
                    {activeMode === item.id && (
                        <span className={`absolute -right-1 top-1 w-2.5 h-2.5 rounded-full bg-${item.color}-500 ring-2 ring-white shadow-sm`}></span>
                    )}
                </button>
            ))}

            <div className="hidden lg:block flex-1"></div>
            <div className="w-10 h-px bg-slate-200/60 hidden lg:block my-2"></div>

            <button
                onClick={() => setActiveMode('apps')}
                className={`
                group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
                ${activeMode === 'apps'
                        ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-200'
                        : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50/50'}
            `}
                title="Apps & Tools"
            >
                <LayoutGrid size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-1">Apps</span>
            </button>

            <button
                onClick={() => setActiveMode('history')}
                className={`
                group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
                ${activeMode === 'history'
                        ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                        : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50/50'}
            `}
                title="History"
            >
                <History size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-1">History</span>
                {history.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {history.length > 9 ? '9+' : history.length}
                    </span>
                )}
            </button>

            <button
                onClick={() => setActiveMode('info')}
                className={`
                group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
                ${activeMode === 'info'
                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50'}
            `}
                title="Info & SEO"
            >
                <Info size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-1">Info</span>
            </button>
        </div>
    );

    const TypeSelector = () => (
        <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-sm z-50 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Select Content Type</h3>
                    <p className="text-sm text-slate-500">Choose what you want to link to.</p>
                </div>
                <button onClick={() => setIsTypeSelectorOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-500" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32">
                <div className="max-w-4xl mx-auto space-y-10">
                    {CATEGORIES.map(cat => (
                        <div key={cat.id}>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                                {cat.label}
                                <div className="h-px flex-1 bg-slate-200"></div>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {cat.types.map(t => {
                                    const Conf = TYPE_CONFIG[t];
                                    const isActive = content.type === t;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => changeType(t)}
                                            className={`text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${isActive ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors shadow-sm ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                                <Conf.icon size={20} />
                                            </div>
                                            <div className="font-bold text-sm text-slate-900 mb-0.5">{Conf.label}</div>
                                            <div className="text-[11px] text-slate-500 leading-tight">{Conf.desc}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-transparent">
            <NavSidebar />

            <div className={`flex-1 flex flex-col bg-transparent h-full overflow-hidden relative order-1 lg:order-2 ${activeMode === 'info' || activeMode === 'apps' || activeMode === 'history' ? 'w-full' : ''}`}>

                {activeMode === 'data' && (
                    <>
                        <div className="pt-8 px-8 pb-6 flex-shrink-0 flex items-start justify-between bg-transparent">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Content</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Configure your QR code data.</p>
                            </div>
                        </div>

                        <div className="px-8 pb-6">
                            <button
                                onClick={() => setIsTypeSelectorOpen(true)}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all shadow-sm group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        {React.createElement(TYPE_CONFIG[content.type].icon, { size: 24 })}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-0.5">Selected Type</div>
                                        <div className="text-lg font-bold text-slate-900">{TYPE_CONFIG[content.type].label}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    Change <ChevronRight size={16} />
                                </div>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
                            <div className="bg-slate-50/50 rounded-3xl p-1">
                                {renderForm()}
                            </div>
                        </div>

                        {isTypeSelectorOpen && <TypeSelector />}
                    </>
                )}

                {activeMode === 'design' && (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="pt-8 px-8 pb-6 flex-shrink-0">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Design</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Customize the look and feel.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 pb-20 space-y-10 custom-scrollbar">

                            {/* Color Presets */}
                            <div>
                                <SectionHeader title="Quick Presets" desc="One-click color themes." />
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Classic', fg: '#000000', bg: '#ffffff', fg2: '' },
                                        { label: 'Navy', fg: '#0f172a', bg: '#ffffff', fg2: '' },
                                        { label: 'Ocean', fg: '#0891b2', bg: '#f0f9ff', fg2: '' },
                                        { label: 'Forest', fg: '#15803d', bg: '#f0fdf4', fg2: '' },
                                        { label: 'Sunset', fg: '#dc2626', bg: '#fff7ed', fg2: '' },
                                        { label: 'Violet', fg: '#7c3aed', bg: '#faf5ff', fg2: '' },
                                        { label: 'Gradient', fg: '#6366f1', bg: '#ffffff', fg2: '#ec4899', grad: true },
                                        { label: 'Gold', fg: '#92400e', bg: '#fef3c7', fg2: '' },
                                    ].map((p) => (
                                        <button
                                            key={p.label}
                                            onClick={() => setDesign(prev => ({
                                                ...prev,
                                                fgColor: p.fg,
                                                bgColor: p.bg,
                                                gradientEnabled: !!p.grad,
                                                gradientColor2: p.fg2 || prev.gradientColor2 || '#6366f1',
                                            }))}
                                            className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full border border-white shadow-md ring-1 ring-slate-200 flex-shrink-0"
                                                style={p.grad
                                                    ? { background: `linear-gradient(135deg, ${p.fg}, ${p.fg2})` }
                                                    : { background: p.bg, border: `3px solid ${p.fg}` }
                                                }
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-800 transition-colors">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <SectionHeader title="Colors" desc="Fine-tune your palette." />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Foreground</span>
                                            <span className="font-mono text-sm text-slate-900">{design.fgColor}</span>
                                        </div>
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white">
                                            <input type="color" value={design.fgColor} onChange={e => setDesign(prev => ({ ...prev, fgColor: e.target.value }))} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Background</span>
                                            <span className="font-mono text-sm text-slate-900">{design.bgColor}</span>
                                        </div>
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white">
                                            <input type="color" value={design.bgColor} onChange={e => setDesign(prev => ({ ...prev, bgColor: e.target.value }))} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                {/* Eye Color */}
                                <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Corner Color</span>
                                        <span className="text-xs text-slate-400">{design.eyeColor ? 'Custom color' : 'Same as foreground'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {design.eyeColor && (
                                            <button
                                                onClick={() => setDesign(prev => ({ ...prev, eyeColor: '' }))}
                                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wide transition-colors"
                                            >Reset</button>
                                        )}
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white"
                                            style={{ background: design.eyeColor || design.fgColor }}>
                                            <input
                                                type="color"
                                                value={design.eyeColor || design.fgColor}
                                                onChange={e => setDesign(prev => ({ ...prev, eyeColor: e.target.value }))}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gradient */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <SectionHeader title="Gradient" desc="Apply a color transition to the modules." />
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                        <button onClick={() => setDesign(prev => ({ ...prev, gradientEnabled: false }))} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!design.gradientEnabled ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Off</button>
                                        <button onClick={() => setDesign(prev => ({ ...prev, gradientEnabled: true }))} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${design.gradientEnabled ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>On</button>
                                    </div>
                                </div>
                                <div className={`space-y-4 transition-all duration-300 ${!design.gradientEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Color 1</span>
                                                <span className="font-mono text-xs text-slate-700">{design.fgColor}</span>
                                            </div>
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white">
                                                <input type="color" value={design.fgColor} onChange={e => setDesign(prev => ({ ...prev, fgColor: e.target.value }))} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Color 2</span>
                                                <span className="font-mono text-xs text-slate-700">{design.gradientColor2 || '#6366f1'}</span>
                                            </div>
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white">
                                                <input type="color" value={design.gradientColor2 || '#6366f1'} onChange={e => setDesign(prev => ({ ...prev, gradientColor2: e.target.value }))} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Gradient Direction */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Direction</span>
                                        <div className="flex gap-2">
                                            {[
                                                { angle: 0, label: '→' },
                                                { angle: 90, label: '↓' },
                                                { angle: 45, label: '↘' },
                                                { angle: 135, label: '↙' },
                                            ].map(({ angle, label }) => (
                                                <button
                                                    key={angle}
                                                    onClick={() => setDesign(prev => ({ ...prev, gradientAngle: angle }))}
                                                    className={`flex-1 py-2.5 rounded-xl text-lg font-bold transition-all ${(design.gradientAngle ?? 135) === angle ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                >{label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Live preview strip */}
                                    <div
                                        className="h-8 rounded-xl shadow-inner"
                                        style={{
                                            background: `linear-gradient(${design.gradientAngle ?? 135}deg, ${design.fgColor}, ${design.gradientColor2 || '#6366f1'})`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Patterns */}
                            <div>
                                <SectionHeader title="Pattern Style" desc="Select the shape of the data modules." />
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { id: QRModuleStyle.SQUARE, label: 'Classic' },
                                        { id: QRModuleStyle.ROUNDED, label: 'Smooth' },
                                        { id: QRModuleStyle.DOTS, label: 'Circles' },
                                        { id: QRModuleStyle.DIAMOND, label: 'Rhombus' }
                                    ].map((s) => (
                                        <MiniQRPreview
                                            key={s.id}
                                            moduleStyle={s.id}
                                            eyeStyle={design.eyeStyle}
                                            label={s.label}
                                            isSelected={design.moduleStyle === s.id}
                                            onClick={() => setDesign(prev => ({ ...prev, moduleStyle: s.id }))}
                                            focus="module"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Eyes */}
                            <div>
                                <SectionHeader title="Corner Style" desc="Customize the finder patterns." />
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: QREyeStyle.SQUARE, label: 'Sharp' },
                                        { id: QREyeStyle.CIRCLE, label: 'Rounded' },
                                        { id: QREyeStyle.LEAF, label: 'Organic' }
                                    ].map((s) => (
                                        <MiniQRPreview
                                            key={s.id}
                                            moduleStyle={design.moduleStyle}
                                            eyeStyle={s.id}
                                            label={s.label}
                                            isSelected={design.eyeStyle === s.id}
                                            onClick={() => setDesign(prev => ({ ...prev, eyeStyle: s.id }))}
                                            focus="eye"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Logo */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <SectionHeader title="Logo" desc="Add your brand logo to the center." />
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                        <button onClick={() => setDesign(prev => ({ ...prev, isBranded: false }))} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!design.isBranded ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Off</button>
                                        <button onClick={() => setDesign(prev => ({ ...prev, isBranded: true }))} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${design.isBranded ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>On</button>
                                    </div>
                                </div>

                                <div className={`transition-all duration-300 ${!design.isBranded ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer relative group bg-white">
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleLogoUpload} />
                                        {design.logoUrl ? (
                                            <div className="relative w-20 h-20 mb-3">
                                                <img src={design.logoUrl} className="w-full h-full object-contain rounded-xl shadow-sm border bg-white p-1" />
                                                <button onClick={(e) => { e.preventDefault(); setDesign(prev => ({ ...prev, logoUrl: null })) }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md z-30 hover:bg-red-600 transition-transform hover:scale-110"><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon size={28} />
                                            </div>
                                        )}
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{design.logoUrl ? 'Click to replace logo' : 'Upload Logo'}</span>
                                        <span className="text-xs text-slate-400 mt-1">Supports PNG, JPG, SVG</span>
                                    </div>

                                    {design.logoUrl && (
                                        <div className="mt-6 space-y-6">
                                            <div>
                                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                                    <span>Size</span>
                                                    <span>{Math.round(design.logoSize * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="0.35"
                                                    step="0.01"
                                                    value={design.logoSize}
                                                    onChange={e => setDesign(prev => ({ ...prev, logoSize: parseFloat(e.target.value) }))}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                            {design.logoUrl.includes('image/svg+xml') && (
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Icon Tint</label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white">
                                                            <input
                                                                type="color"
                                                                onChange={e => recolorLogo(e.target.value)}
                                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-500">Pick a color to recolor the SVG.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeMode === 'frame' && (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="pt-8 px-8 pb-6 flex-shrink-0">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frames</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Add a call-to-action border.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 pb-20 space-y-8 custom-scrollbar">
                            <div>
                                <SectionHeader title="Frame Style" desc="Choose a frame to highlight your QR code." />
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: QRFrame.NONE, label: 'None', icon: LayoutTemplate },
                                        { id: QRFrame.BALLOON_BOTTOM, label: 'Balloon', icon: MessageSquare },
                                        { id: QRFrame.BOX_BOTTOM, label: 'Boxed', icon: Crop },
                                        { id: QRFrame.SIMPLE_BOX, label: 'Border', icon: Layers },
                                        { id: QRFrame.TEXT_ONLY, label: 'Text Only', icon: Type },
                                        { id: QRFrame.POLAROID, label: 'Polaroid', icon: FileImage },
                                        { id: QRFrame.PHONE, label: 'Phone', icon: Smartphone },
                                        { id: QRFrame.FOCUS, label: 'Focus', icon: Camera },
                                        { id: QRFrame.BADGE, label: 'Badge', icon: Award },
                                        { id: QRFrame.BAG, label: 'Bag', icon: ShoppingBag },
                                        { id: QRFrame.COFFEE, label: 'Coffee', icon: Coffee },
                                        { id: QRFrame.BUBBLE_TOP, label: 'Bubble', icon: MessageCircle },
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setDesign(prev => ({ ...prev, frame: f.id }))}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${design.frame === f.id ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 text-pink-700 shadow-sm' : 'bg-white border-slate-200 hover:border-pink-300 hover:shadow-md text-slate-600'}`}
                                        >
                                            <f.icon size={24} />
                                            <span className="text-xs font-bold">{f.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {design.frame !== QRFrame.NONE && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <InputGroup label="Frame Text" icon={Type}>
                                        <input
                                            value={design.frameText}
                                            onChange={(e) => setDesign(prev => ({ ...prev, frameText: e.target.value }))}
                                            className={inputWithIconClass}
                                            placeholder="SCAN ME"
                                            maxLength={25}
                                        />
                                    </InputGroup>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Frame Color</label>
                                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition bg-slate-50">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm ring-2 ring-white">
                                                <input
                                                    type="color"
                                                    value={design.frameColor}
                                                    onChange={e => setDesign(prev => ({ ...prev, frameColor: e.target.value }))}
                                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                                />
                                            </div>
                                            <span className="font-mono text-sm text-slate-900">{design.frameColor}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeMode === 'apps' && (
                    <AppsHub
                        onCreateQRCode={(url) => {
                            setContent({ type: QRContentType.URL, value: url });
                            setActiveMode('data');
                        }}
                    />
                )}

                {activeMode === 'history' && (
                    <HistoryPanel
                        history={history}
                        onRestore={onRestoreHistory}
                        onDelete={onDeleteHistory}
                        onClear={onClearHistory}
                        onSave={onSaveToHistory}
                        onBack={() => setActiveMode('data')}
                        currentQrValue={content.value}
                    />
                )}

                {activeMode === 'info' && (
                    <div className="flex-1 h-full overflow-y-auto bg-slate-50">
                        <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none opacity-40">
                                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[128px] -translate-y-1/2 mix-blend-screen"></div>
                                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600 rounded-full blur-[128px] translate-y-1/2 mix-blend-screen"></div>
                            </div>

                            <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 shadow-lg">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-xs font-bold text-white tracking-wide uppercase">No Sign-up • No Expiry</span>
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
                                    Free Unlimited <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">QR Code Generator</span>
                                </h1>
                                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                                    Generate lifetime static QR codes for free. No account required, no scanning limits, and no ads.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button onClick={() => setActiveMode('data')} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2">
                                        Start Creating <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-5xl mx-auto px-6 py-16">
                            {/* Comparison Table */}
                            <div className="mb-24">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Why We Are #1</h2>
                                    <p className="text-slate-500">Don't get tricked by "free" generators that expire.</p>
                                </div>
                                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                                    <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-6 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        <div className="text-left">Feature</div>
                                        <div className="text-center text-indigo-600">GenQR Studio</div>
                                        <div className="text-center text-slate-400">Others (Bitly, etc.)</div>
                                    </div>
                                    {[
                                        { feature: "Lifetime Validity", us: true, them: false },
                                        { feature: "No Sign-up Required", us: true, them: false },
                                        { feature: "Unlimited Scans", us: true, them: false },
                                        { feature: "Static (No Redirection)", us: true, them: false },
                                        { feature: "High Quality Vector (SVG)", us: true, them: false },
                                        { feature: "Ad-Free Experience", us: true, them: false },
                                    ].map((row, i) => (
                                        <div key={i} className="grid grid-cols-3 p-6 border-b border-slate-100 hover:bg-slate-50/50 transition-colors items-center">
                                            <div className="font-bold text-slate-700">{row.feature}</div>
                                            <div className="flex justify-center text-emerald-500"><CheckCircle2 size={24} fill="#dcfce7" /></div>
                                            <div className="flex justify-center text-red-400"><X size={24} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tools Directory (SEO "Tool Pages") */}
                            <div className="mb-24">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore Our Free Tools</h2>
                                    <p className="text-slate-500">Specialized tools for designers, developers, and marketers.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Payment Tools */}
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6"><DollarSign size={24} /></div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Payment & Finance</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-emerald-500" /> UPI QR code generator for business free</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-emerald-500" /> Create PayPal payment link QR code free</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-emerald-500" /> Bitcoin wallet address QR code generator</li>
                                        </ul>
                                        <button onClick={() => { setActiveMode('data'); setTimeout(() => (document.querySelector('button[title="Finance & Crypto"]') as HTMLElement)?.click(), 100); }} className="mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                            Create Payment QR <ArrowRight size={16} />
                                        </button>
                                    </div>

                                    {/* Design Tools */}
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6"><Palette size={24} /></div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Design & Creative</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-purple-500" /> Free mesh gradient generator CSS</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-purple-500" /> Glitch effect image generator online free</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-purple-500" /> Seamless pattern generator for branding</li>
                                        </ul>
                                        <button onClick={() => setActiveMode('apps')} className="mt-6 text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                            Open Design Tools <ArrowRight size={16} />
                                        </button>
                                    </div>

                                    {/* Utility Tools */}
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6"><Settings size={24} /></div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Developer Utilities</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-sky-500" /> Print DPI calculator pixel to inches</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-sky-500" /> Image to WebP converter high quality</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-sky-500" /> UTM link builder with QR code</li>
                                        </ul>
                                        <button onClick={() => setActiveMode('apps')} className="mt-6 text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                                            Open Utilities <ArrowRight size={16} />
                                        </button>
                                    </div>

                                    {/* Social Tools */}
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-6"><Share2 size={24} /></div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Social Media</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-pink-500" /> WhatsApp link generator with pre-filled message</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-pink-500" /> Social media profile background creator</li>
                                            <li className="flex items-center gap-2 text-slate-600 text-sm"><Check size={16} className="text-pink-500" /> Instagram & LinkedIn QR codes</li>
                                        </ul>
                                        <button onClick={() => { setActiveMode('data'); setTimeout(() => (document.querySelector('button[title="Contact & Social"]') as HTMLElement)?.click(), 100); }} className="mt-6 text-sm font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1">
                                            Create Social QR <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Developer Section - Apple Style Redesign */}
                            <div className="mb-24">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                                    <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-10 overflow-hidden">

                                        {/* Profile Image */}
                                        <div className="relative w-40 h-40 flex-shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-full shadow-inner"></div>
                                            <img
                                                src="/profile.jpg"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://github.com/labeeb-dev.png";
                                                }}
                                                alt="Labeeb - Developer"
                                                className="w-full h-full rounded-full object-cover border-[6px] border-white shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 border border-indigo-100">
                                                The Creative Mind
                                            </div>
                                            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Labeeb</h2>
                                            <p className="text-lg text-slate-500 font-medium mb-6">UI/UX Designer & Frontend Developer</p>

                                            <p className="text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto md:mx-0 font-light">
                                                Crafting digital experiences that blend <span className="font-medium text-slate-900">aesthetics</span> with <span className="font-medium text-slate-900">functionality</span>.
                                                GenQR Studio is a testament to the power of modern web design.
                                            </p>

                                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                <a href="https://www.instagram.com/c_labeeb/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all hover:scale-110">
                                                    <Instagram size={20} />
                                                </a>
                                                <a href="https://www.linkedin.com/in/clabeeb/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all hover:scale-110">
                                                    <Linkedin size={20} />
                                                </a>
                                                <a href="https://wa.me/919809672709?text=Hi%20Labeeb,%20I%20love%20your%20QR%20Studio!" target="_blank" rel="noopener noreferrer" className="pl-4 pr-5 py-2.5 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-slate-800 transition-all hover:scale-105 shadow-lg flex items-center gap-2">
                                                    <MessageCircle size={18} />
                                                    <span>Say Hello</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ & SEO Content */}
                            <div className="space-y-12">
                                <div className="text-center max-w-2xl mx-auto">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                                    <p className="text-slate-500">Common questions about our free static QR code generator.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { q: "How to create a QR code that never expires for free?", a: "Simply use GenQR Studio. Select your content type (URL, Text, etc.), enter your data, and download. Our codes are static, meaning they encode data directly and never expire." },
                                        { q: "Is there a truly free QR code generator?", a: "Yes! GenQR Studio is 100% free forever. We don't charge for scans, we don't show ads, and we don't require you to sign up." },
                                        { q: "Best free QR code generator for printing high quality?", a: "We offer SVG (Vector) export which is perfect for printing. You can scale it to any size (billboards, t-shirts) without losing quality. We also support 4K PNG/JPG." },
                                        { q: "Can I create a QR code without an account?", a: "Absolutely. We believe in privacy and speed. No sign-up, no login, no email required. Just generate and download." },
                                        { q: "Is my data private?", a: "Yes. We process everything locally in your browser. Your data is never sent to our servers." },
                                        { q: "Do you have a bulk WebP converter?", a: "Yes, check our Apps section. We have a high-quality Image to WebP converter that runs entirely in your browser." }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                            <h3 className="font-bold text-slate-900 mb-3 text-lg flex items-start gap-3">
                                                <span className="bg-indigo-50 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">?</span>
                                                {item.q}
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed pl-9">{item.a}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* SEO Footer Text */}
                                <div className="mt-20 pt-10 border-t border-slate-200 text-center">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Popular Tools</h2>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {['Free QR Code Generator No Signup', 'Static QR Code Generator Lifetime Validity', 'Unlimited QR Code Generator Without Ads', 'UPI QR Code Generator', 'PayPal QR Code', 'Bitcoin QR Code', 'Mesh Gradient Generator', 'Glitch Effect Generator', 'Image to WebP Converter', 'WiFi QR Code', 'WhatsApp Link Generator'].map(tag => (
                                            <span key={tag} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-10 text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
                                        GenQR Studio is the best free QR code generator for 2025. Create unlimited static QR codes that never expire.
                                        Features include high-quality SVG export, custom colors, logos, and frames.
                                        Perfect for business, marketing, and personal use. No credit card required.
                                    </p>
                                    <p className="mt-4 text-xs text-slate-300">
                                        © {new Date().getFullYear()} GenQR Studio. Built with ❤️ by Labeeb.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;