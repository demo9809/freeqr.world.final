
import React, { useState, useRef, useEffect, useMemo } from 'react';
import jsQR from 'jsqr';
import JsBarcode from 'jsbarcode';
import {
    ScanLine, FileImage, Calculator, Link2, Grid3X3, Zap, Image as ImageIcon, Palette,
    Upload, Copy, Check, AlertTriangle, X, ArrowLeft, Download, Trash2, Settings, RefreshCw,
    Layers, Smartphone, Monitor, Layout, Shuffle, Wand2, Shapes, Move, Maximize, RotateCw,
    Globe, Tag, MousePointer2, Target, Search, Type, Activity, MonitorPlay, Circle, Plus, Code2,
    Crop, Printer, Sliders, Eye, EyeOff, Loader2, ArrowRight, MessageCircle, Barcode
} from 'lucide-react';

// Types for our Apps
interface AppTool {
    id: string;
    title: string;
    desc: string;
    icon: React.ElementType;
    status: 'active' | 'coming_soon';
    badge?: string;
}

const TOOLS: AppTool[] = [
    { id: 'batch', title: 'Batch QR Generator', desc: 'Upload a CSV to generate hundreds of QR codes and download as a ZIP.', icon: Layers, status: 'active', badge: 'New' },
    { id: 'scanner', title: 'QR Scanner', desc: 'Upload or paste an image to instantly decode QR codes.', icon: ScanLine, status: 'active', badge: 'Live' },
    { id: 'dpi', title: 'Print DPI Calculator', desc: 'Calculate max print size from pixel dimensions.', icon: Printer, status: 'active', badge: 'New' },
    { id: 'glitch', title: 'Glitch Effect', desc: 'Apply aesthetic glitch distortions to images or text.', icon: Zap, status: 'active', badge: 'New' },
    { id: 'mesh', title: 'Mesh Gradients', desc: 'Create beautiful, fluid mesh gradients with editable points.', icon: Palette, status: 'active', badge: 'New' },
    { id: 'pattern', title: 'Pattern Generator', desc: 'Create seamless geometric or branded logo patterns.', icon: Grid3X3, status: 'active', badge: 'New' },
    { id: 'utm', title: 'UTM Builder', desc: 'Generate tracking links for your marketing campaigns.', icon: Link2, status: 'active', badge: 'New' },
    { id: 'webp', title: 'Image to WebP', desc: 'Convert PNG/JPG to WebP locally for faster websites.', icon: FileImage, status: 'active', badge: 'New' },
    { id: 'social_bg', title: 'Social Backgrounds', desc: 'Generate gradients and meshes for Instagram/LinkedIn.', icon: ImageIcon, status: 'active', badge: 'New' },
    { id: 'whatsapp', title: 'WhatsApp Link', desc: 'Create direct chat links with pre-filled messages.', icon: MessageCircle, status: 'active', badge: 'New' },
    { id: 'barcode', title: 'Barcode Generator', desc: 'Generate Code128, EAN-13, UPC, Code39 and more — download as SVG or PNG.', icon: Barcode, status: 'active', badge: 'New' },
    { id: 'aspect', title: 'Ratio Calculator', desc: 'Calculate aspect ratios for banners and social posts.', icon: Calculator, status: 'coming_soon' }
];

interface ConvertedImage {
    id: string;
    originalName: string;
    originalSize: number;
    convertedUrl: string;
    convertedSize: number;
    savings: number;
    status: 'processing' | 'done';
}

// Social BG Types
type BgType = 'linear' | 'radial' | 'mesh';
type AspectRatio = '1:1' | '9:16' | '4:5' | '16:9' | '4:3';

// Pattern Types
type PatLayout = 'grid' | 'brick' | 'random';
type PatShape = 'circle' | 'square' | 'triangle' | 'cross' | 'star';

// Glitch Types
type GlitchMode = 'text' | 'image';
type GlitchStyle = 'rgb' | 'slice' | 'noise' | 'scanline';

// Mesh Gradient Types
interface MeshNode {
    id: number;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    color: string;
    r: number; // radius percentage
}

const PRESET_PALETTES = [
    ['#FF9A9E', '#FECFEF', '#FECFEF', '#a18cd1'],
    ['#fad0c4', '#ffd1ff', '#ffecd2', '#fcb69f'],
    ['#84fab0', '#8fd3f4', '#a6c0fe', '#f68084'],
    ['#fccb90', '#d57eeb', '#e0c3fc', '#8ec5fc'],
    ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140', '#ff0844', '#ffb199'],
    ['#667eea', '#764ba2', '#6B73FF', '#000DFF'],
    ['#89f7fe', '#66a6ff', '#48c6ef', '#6f86d6'],
    ['#feada6', '#f5efef', '#e6e9f0', '#eef1f5'],
    ['#29323c', '#485563', '#2b5876', '#4e4376'],
    ['#0ba360', '#3cba92', '#30cfd0', '#330867'],
    ['#ff5858', '#f09819', '#ff9068', '#ff4b1f'],
];

import QRCode from 'qrcode';



const QRCodeCanvas = React.forwardRef<HTMLCanvasElement, { value: string, size: number }>(({ value, size }, ref) => {
    const localRef = useRef<HTMLCanvasElement>(null);

    React.useImperativeHandle(ref, () => localRef.current as HTMLCanvasElement);

    useEffect(() => {
        if (!localRef.current || !value) return;
        QRCode.toCanvas(localRef.current, value, {
            width: size,
            margin: 0,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, (error) => {
            if (error) console.error(error);
        });
    }, [value, size]);

    return <canvas ref={localRef} />;
});
QRCodeCanvas.displayName = 'QRCodeCanvas';

const COUNTRY_CODES = [
    { code: '1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '44', country: 'UK', flag: '🇬🇧' },
    { code: '91', country: 'India', flag: '🇮🇳' },
    { code: '971', country: 'UAE', flag: '🇦🇪' },
    { code: '61', country: 'Australia', flag: '🇦🇺' },
    { code: '86', country: 'China', flag: '🇨🇳' },
    { code: '33', country: 'France', flag: '🇫🇷' },
    { code: '49', country: 'Germany', flag: '🇩🇪' },
    { code: '81', country: 'Japan', flag: '🇯🇵' },
    { code: '65', country: 'Singapore', flag: '🇸🇬' },
    { code: '55', country: 'Brazil', flag: '🇧🇷' },
    { code: '7', country: 'Russia', flag: '🇷🇺' },
    { code: '27', country: 'South Africa', flag: '🇿🇦' },
    { code: '82', country: 'South Korea', flag: '🇰🇷' },
    { code: '39', country: 'Italy', flag: '🇮🇹' },
    { code: '34', country: 'Spain', flag: '🇪🇸' },
    { code: '31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '46', country: 'Sweden', flag: '🇸🇪' },
    { code: '90', country: 'Turkey', flag: '🇹🇷' },
    { code: '966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '20', country: 'Egypt', flag: '🇪🇬' },
    { code: '62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '63', country: 'Philippines', flag: '🇵🇭' },
    { code: '66', country: 'Thailand', flag: '🇹🇭' },
    { code: '84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '977', country: 'Nepal', flag: '🇳🇵' },
    { code: '93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '98', country: 'Iran', flag: '🇮🇷' },
    { code: '964', country: 'Iraq', flag: '🇮🇶' },
    { code: '965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '974', country: 'Qatar', flag: '🇶🇦' },
    { code: '973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '968', country: 'Oman', flag: '🇴🇲' },
    { code: '962', country: 'Jordan', flag: '🇯🇴' },
    { code: '961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '212', country: 'Morocco', flag: '🇲🇦' },
    { code: '213', country: 'Algeria', flag: '🇩🇿' },
    { code: '216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '254', country: 'Kenya', flag: '🇰🇪' },
    { code: '233', country: 'Ghana', flag: '🇬🇭' },
    { code: '52', country: 'Mexico', flag: '🇲🇽' },
    { code: '54', country: 'Argentina', flag: '🇦🇷' },
    { code: '57', country: 'Colombia', flag: '🇨🇴' },
    { code: '56', country: 'Chile', flag: '🇨🇱' },
    { code: '51', country: 'Peru', flag: '🇵🇪' },
    { code: '58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '48', country: 'Poland', flag: '🇵🇱' },
    { code: '380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '40', country: 'Romania', flag: '🇷🇴' },
    { code: '30', country: 'Greece', flag: '🇬🇷' },
    { code: '351', country: 'Portugal', flag: '🇵🇹' },
    { code: '32', country: 'Belgium', flag: '🇧🇪' },
    { code: '43', country: 'Austria', flag: '🇦🇹' },
    { code: '45', country: 'Denmark', flag: '🇩🇰' },
    { code: '358', country: 'Finland', flag: '🇫🇮' },
    { code: '47', country: 'Norway', flag: '🇳🇴' },
    { code: '353', country: 'Ireland', flag: '🇮🇪' },
    { code: '64', country: 'New Zealand', flag: '🇳🇿' }
].sort((a, b) => a.country.localeCompare(b.country));

const WhatsAppGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [waCountryCode, setWaCountryCode] = useState('91');
    const [waPhone, setWaPhone] = useState('');
    const [waMessage, setWaMessage] = useState('');
    const [generatedWaLink, setGeneratedWaLink] = useState('');
    const qrRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!waPhone) {
            setGeneratedWaLink('');
            return;
        }
        const cleanPhone = waPhone.replace(/\D/g, '');
        const fullPhone = `${waCountryCode}${cleanPhone}`;
        const encodedMsg = encodeURIComponent(waMessage);
        const link = `https://wa.me/${fullPhone}${waMessage ? `?text=${encodedMsg}` : ''}`;
        setGeneratedWaLink(link);
    }, [waPhone, waMessage, waCountryCode]);

    const downloadQR = () => {
        const canvas = qrRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `whatsapp-qr-${waPhone}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* Left: Controls */}
            <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800">WhatsApp Link Generator</h2>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Smartphone size={20} className="text-emerald-500" />
                            Contact Details
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Code</label>
                                <div className="relative">
                                    <select
                                        value={waCountryCode}
                                        onChange={(e) => setWaCountryCode(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
                                    >
                                        {COUNTRY_CODES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} +{c.code} ({c.country})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={waPhone}
                                    onChange={(e) => setWaPhone(e.target.value.replace(/\D/g, ''))}
                                    placeholder="1234567890"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Message (Optional)</label>
                            <span className="text-xs text-slate-400">{waMessage.length} chars</span>
                        </div>
                        <textarea
                            value={waMessage}
                            onChange={(e) => setWaMessage(e.target.value)}
                            placeholder="Hi! I'm interested in your services..."
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Templates</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "👋 Greeting", text: "Hello! I'd like to get in touch." },
                                { label: "💼 Business", text: "Hi, I have a query regarding your products." },
                                { label: "📅 Appointment", text: "I would like to schedule an appointment." },
                                { label: "🆘 Support", text: "I need help with an order." }
                            ].map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => setWaMessage(t.text)}
                                    className="px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-emerald-200 hover:shadow-sm"
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="w-full lg:w-[420px] flex flex-col gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col sticky top-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <Eye size={20} className="text-indigo-500" />
                        Live Preview
                    </h3>

                    <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[300px]">
                        {generatedWaLink ? (
                            <>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                    <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100 relative z-10">
                                        <QRCodeCanvas ref={qrRef} value={generatedWaLink} size={220} />
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 break-all text-xs text-slate-500 font-mono text-center">
                                        {generatedWaLink}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(generatedWaLink)}
                                            className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold rounded-xl transition-all hover:shadow-md text-sm group"
                                        >
                                            <Copy size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Copy Link
                                        </button>
                                        <button
                                            onClick={downloadQR}
                                            className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold rounded-xl transition-all hover:shadow-md text-sm group"
                                        >
                                            <Download size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Save QR
                                        </button>
                                        <a
                                            href={generatedWaLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                                        >
                                            <MessageCircle size={18} /> Open Chat
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-400 py-12">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Smartphone size={32} className="opacity-20" />
                                </div>
                                <p className="text-sm font-medium">Enter a phone number<br />to generate preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Barcode Generator ────────────────────────────────────────────────────────

const BARCODE_FORMATS = [
    { id: 'CODE128',    label: 'Code 128',      hint: 'Alphanumeric — supports all ASCII characters', example: 'FREEQR-2024' },
    { id: 'EAN13',      label: 'EAN-13',        hint: '12 digits (check digit added automatically)', example: '590123412345' },
    { id: 'EAN8',       label: 'EAN-8',         hint: '7 digits (check digit added automatically)', example: '9638507' },
    { id: 'UPC',        label: 'UPC-A',         hint: '11 digits (check digit added automatically)', example: '01234567890' },
    { id: 'CODE39',     label: 'Code 39',       hint: 'Uppercase letters, digits, and - . $ / + % SPACE', example: 'INV-001-XR' },
    { id: 'ITF14',      label: 'ITF-14',        hint: '13 digits — used for retail shipping cartons', example: '1234567890123' },
    { id: 'MSI',        label: 'MSI Plessey',   hint: 'Digits only — common in inventory systems', example: '1234567890' },
    { id: 'pharmacode', label: 'Pharmacode',    hint: 'Integer 3–131070 — pharmaceutical industry', example: '12345' },
];

const BC_EXAMPLES: Record<string, { label: string; value: string }[]> = {
    CODE128:    [{ label: '📦 Product SKU', value: 'SKU-10294-B' }, { label: '🧾 Order ID', value: 'ORD-2024-7821' }, { label: '🔢 Serial No.', value: 'SN-A1B2C3D4' }],
    EAN13:      [{ label: '📚 ISBN-13', value: '978020161622' }, { label: '🥫 Food item', value: '590123412345' }, { label: '🏷️ Generic', value: '400638133393' }],
    EAN8:       [{ label: '🎁 Small pack', value: '9638507' }, { label: '🏷️ Generic', value: '1234567' }],
    UPC:        [{ label: '🛒 Grocery', value: '01234567890' }, { label: '📱 Electronics', value: '07891234567' }],
    CODE39:     [{ label: '📋 Inventory', value: 'INV-001' }, { label: '🏷️ Asset tag', value: 'ASSET-XR9' }, { label: '📂 File code', value: 'FILE-2024-A' }],
    ITF14:      [{ label: '📦 Shipping', value: '1234567890123' }, { label: '🏬 Retail box', value: '0614141000418' }],
    MSI:        [{ label: '🏪 Stock', value: '5500123' }, { label: '🔢 Generic', value: '1234567890' }],
    pharmacode: [{ label: '💊 Sample 1', value: '1234' }, { label: '💊 Sample 2', value: '98765' }],
};

const BarcodeGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [bcFormat, setBcFormat] = useState('CODE128');
    const [bcValue, setBcValue] = useState('FREEQR-2024');
    const [bcWidth, setBcWidth] = useState(2);
    const [bcHeight, setBcHeight] = useState(100);
    const [bcMargin, setBcMargin] = useState(10);
    const [bcFg, setBcFg] = useState('#000000');
    const [bcBg, setBcBg] = useState('#ffffff');
    const [bcShowText, setBcShowText] = useState(true);
    const [bcFontSize, setBcFontSize] = useState(16);
    const [bcError, setBcError] = useState<string | null>(null);
    const bcSvgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!bcSvgRef.current || !bcValue.trim()) return;
        try {
            JsBarcode(bcSvgRef.current, bcValue, {
                format: bcFormat,
                width: bcWidth,
                height: bcHeight,
                margin: bcMargin,
                lineColor: bcFg,
                background: bcBg,
                displayValue: bcShowText,
                fontSize: bcFontSize,
                textMargin: 6,
                font: 'monospace',
            });
            setBcError(null);
        } catch (e: unknown) {
            setBcError((e as Error).message?.replace(/^JsBarcode:\s*/i, '') ?? 'Invalid value for this format');
        }
    }, [bcFormat, bcValue, bcWidth, bcHeight, bcMargin, bcFg, bcBg, bcShowText, bcFontSize]);

    const downloadSvg = () => {
        if (!bcSvgRef.current || bcError) return;
        const blob = new Blob([new XMLSerializer().serializeToString(bcSvgRef.current)], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement('a'), { href: url, download: `barcode-${bcFormat}-${Date.now()}.svg` }).click();
        URL.revokeObjectURL(url);
    };

    const downloadPng = () => {
        if (!bcSvgRef.current || bcError) return;
        const svgStr = new XMLSerializer().serializeToString(bcSvgRef.current);
        const w = bcSvgRef.current.width.baseVal.value * 2;
        const h = bcSvgRef.current.height.baseVal.value * 2;
        const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
        const ctx = canvas.getContext('2d')!;
        const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml' }));
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            Object.assign(document.createElement('a'), { href: canvas.toDataURL('image/png'), download: `barcode-${bcFormat}-${Date.now()}.png` }).click();
        };
        img.src = url;
    };

    const currentFmt = BARCODE_FORMATS.find(f => f.id === bcFormat)!;
    const examples = BC_EXAMPLES[bcFormat] ?? [];

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* ── Left: Controls ── */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Barcode Generator</h2>
                        <p className="text-sm text-slate-400 mt-0.5">Vector barcodes — no server, fully in-browser</p>
                    </div>
                </div>

                {/* Format & Data */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Barcode size={16} className="text-indigo-500" /> Format & Data
                    </h3>

                    {/* Format picker */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Barcode Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {BARCODE_FORMATS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => { setBcFormat(f.id); setBcValue(f.example); setBcError(null); }}
                                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${bcFormat === f.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">{currentFmt.hint}</p>
                    </div>

                    {/* Value input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Value to Encode</label>
                        <input
                            type="text"
                            value={bcValue}
                            onChange={e => setBcValue(e.target.value)}
                            placeholder={currentFmt.example}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono text-slate-900 outline-none focus:ring-2 placeholder:text-slate-400 transition-colors ${bcError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                        />
                        {bcError && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5 font-medium">
                                <AlertTriangle size={12} className="flex-shrink-0" /> {bcError}
                            </p>
                        )}
                    </div>

                    {/* Quick examples */}
                    {examples.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Examples</label>
                            <div className="flex flex-wrap gap-2">
                                {examples.map((ex, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setBcValue(ex.value); setBcError(null); }}
                                        className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-medium transition-all border border-slate-200 hover:border-indigo-200"
                                    >
                                        {ex.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Appearance */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Palette size={16} className="text-indigo-500" /> Appearance
                    </h3>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Bar Color', value: bcFg, setter: setBcFg },
                            { label: 'Background', value: bcBg, setter: setBcBg },
                        ].map(({ label, value, setter }) => (
                            <div key={label}>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                                    <input type="color" value={value} onChange={e => setter(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent flex-shrink-0" />
                                    <span className="text-sm font-mono text-slate-600">{value.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sliders */}
                    <div className="space-y-5">
                        {([
                            { label: 'Bar Width', value: bcWidth, setter: setBcWidth, min: 1, max: 4, step: 0.5, unit: 'px' },
                            { label: 'Height', value: bcHeight, setter: setBcHeight, min: 40, max: 200, step: 5, unit: 'px' },
                            { label: 'Margin', value: bcMargin, setter: setBcMargin, min: 0, max: 40, step: 2, unit: 'px' },
                        ] as const).map(({ label, value, setter, min, max, step, unit }) => (
                            <div key={label}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">{value}{unit}</span>
                                </div>
                                <input
                                    type="range" min={min} max={max} step={step} value={value}
                                    onChange={e => (setter as (v: number) => void)(Number(e.target.value))}
                                    className="w-full h-1.5 rounded-full accent-indigo-600"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Show text toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Show Text Below</p>
                            <p className="text-xs text-slate-400 mt-0.5">Display the encoded value beneath the bars</p>
                        </div>
                        <button
                            onClick={() => setBcShowText(v => !v)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${bcShowText ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${bcShowText ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {bcShowText && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Size</label>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">{bcFontSize}px</span>
                            </div>
                            <input type="range" min={10} max={28} step={1} value={bcFontSize} onChange={e => setBcFontSize(Number(e.target.value))} className="w-full h-1.5 rounded-full accent-indigo-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right: Preview + Download ── */}
            <div className="w-full lg:w-[420px] flex flex-col gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sticky top-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Eye size={20} className="text-indigo-500" /> Live Preview
                    </h3>

                    {/* Barcode preview */}
                    <div
                        className="flex-1 flex items-center justify-center min-h-[200px] rounded-2xl border border-dashed border-slate-200 p-6 overflow-hidden transition-colors"
                        style={{ background: bcBg }}
                    >
                        {bcError ? (
                            <div className="text-center p-4">
                                <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
                                <p className="text-sm text-red-500 font-semibold">Invalid input</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">{bcError}</p>
                            </div>
                        ) : (
                            <svg ref={bcSvgRef} className="max-w-full" />
                        )}
                    </div>

                    {/* Format badge */}
                    <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                            <Barcode size={12} /> {currentFmt.label}
                        </span>
                        {!bcError && bcSvgRef.current && (
                            <span className="text-xs text-slate-400 font-medium">
                                {bcSvgRef.current.width?.baseVal?.value}×{bcSvgRef.current.height?.baseVal?.value}px
                            </span>
                        )}
                    </div>

                    {/* Download buttons */}
                    <div className="mt-6 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={downloadSvg}
                                disabled={!!bcError || !bcValue.trim()}
                                className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Download size={16} /> SVG
                            </button>
                            <button
                                onClick={downloadPng}
                                disabled={!!bcError || !bcValue.trim()}
                                className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Download size={16} /> PNG
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 text-center">Runs entirely in your browser — nothing uploaded</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── AppsHub (main) ───────────────────────────────────────────────────────────
const AppsHub: React.FC = () => {
    const activeToolState = useState<string | null>(null);
    const [activeTool, setActiveTool] = activeToolState;

    // --- QR Scanner State ---
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- WebP Converter State ---
    const [webpImages, setWebpImages] = useState<ConvertedImage[]>([]);
    const [webpQuality, setWebpQuality] = useState<number>(0.8);
    const webpInputRef = useRef<HTMLInputElement>(null);

    // --- Social BG State ---
    const [bgType, setBgType] = useState<BgType>('mesh');
    const [bgColors, setBgColors] = useState<string[]>(['#4f46e5', '#ec4899', '#8b5cf6']);
    const [bgNoise, setBgNoise] = useState<number>(0.15);
    const [bgAspect, setBgAspect] = useState<AspectRatio>('9:16');
    const [bgSeed, setBgSeed] = useState<number>(1);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);

    // --- Pattern Generator State ---
    const [patMode, setPatMode] = useState<'shape' | 'image'>('shape');
    const [patShape, setPatShape] = useState<PatShape>('circle');
    const [patImage, setPatImage] = useState<string | null>(null);
    const [patLayout, setPatLayout] = useState<PatLayout>('grid');
    const [patBg, setPatBg] = useState('#f8fafc');
    const [patColor, setPatColor] = useState('#4f46e5'); // For shapes
    const [patScale, setPatScale] = useState(40);
    const [patSpacing, setPatSpacing] = useState(80);
    const [patRotation, setPatRotation] = useState(0);
    const [patOpacity, setPatOpacity] = useState(1);
    const patCanvasRef = useRef<HTMLCanvasElement>(null);
    const patInputRef = useRef<HTMLInputElement>(null);

    // --- UTM Builder State ---
    const [utmUrl, setUtmUrl] = useState('');
    const [utmSource, setUtmSource] = useState('');
    const [utmMedium, setUtmMedium] = useState('');
    const [utmCampaign, setUtmCampaign] = useState('');
    const [utmTerm, setUtmTerm] = useState('');
    const [utmContent, setUtmContent] = useState('');
    const [generatedUtm, setGeneratedUtm] = useState('');

    // --- Glitch Effect State ---
    const [glitchMode, setGlitchMode] = useState<GlitchMode>('text');
    const [glitchText, setGlitchText] = useState('CYBERPUNK');
    const [glitchImage, setGlitchImage] = useState<string | null>(null);
    const [glitchAmount, setGlitchAmount] = useState(0.5);
    const [glitchSeed, setGlitchSeed] = useState(1);
    const [glitchStyle, setGlitchStyle] = useState<GlitchStyle>('rgb');
    const glitchCanvasRef = useRef<HTMLCanvasElement>(null);
    const glitchInputRef = useRef<HTMLInputElement>(null);

    // --- Mesh Gradient State ---
    const [meshNodes, setMeshNodes] = useState<MeshNode[]>([
        { id: 1, x: 20, y: 20, color: '#4f46e5', r: 60 },
        { id: 2, x: 80, y: 20, color: '#ec4899', r: 50 },
        { id: 3, x: 20, y: 80, color: '#06b6d4', r: 70 },
        { id: 4, x: 80, y: 80, color: '#f59e0b', r: 55 },
        { id: 5, x: 50, y: 50, color: '#8b5cf6', r: 80 }
    ]);
    const [meshBg, setMeshBg] = useState('#0f172a');
    const [meshBlur, setMeshBlur] = useState(80);
    const [meshGrain, setMeshGrain] = useState(20);
    const [meshContrast, setMeshContrast] = useState(110);
    const [meshBrightness, setMeshBrightness] = useState(100);
    const [meshHue, setMeshHue] = useState(0);
    const [meshAspect, setMeshAspect] = useState<AspectRatio>('16:9');
    const [showMeshControls, setShowMeshControls] = useState(false);
    const [isMeshDragging, setIsMeshDragging] = useState(false);
    const [selectedMeshNode, setSelectedMeshNode] = useState<number | null>(null);

    const meshCanvasRef = useRef<HTMLCanvasElement>(null);

    // --- DPI Calculator State ---
    const [dpiWidth, setDpiWidth] = useState<number>(1920);
    const [dpiHeight, setDpiHeight] = useState<number>(1080);
    const [dpiValue, setDpiValue] = useState<number>(300);

    // --- DPI Calculator State ---



    // --- Scanner Logic ---
    const processImage = (file: File) => {
        setScanError(null);
        setScanResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setScanResult(code.data);
                } else {
                    setScanError("No QR code found in this image. Please try a clearer image.");
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (activeTool === 'scanner') processImage(e.dataTransfer.files[0]);
            if (activeTool === 'webp') processWebP(Array.from(e.dataTransfer.files));
            if (activeTool === 'pattern') processPatternImage(e.dataTransfer.files[0]);
            if (activeTool === 'glitch') processGlitchImage(e.dataTransfer.files[0]);
        }
    };

    const handlePaste = (e: ClipboardEvent) => {
        if (e.clipboardData && e.clipboardData.items) {
            const files: File[] = [];
            for (let i = 0; i < e.clipboardData.items.length; i++) {
                if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
                    const blob = e.clipboardData.items[i].getAsFile();
                    if (blob) files.push(blob);
                }
            }
            if (files.length > 0) {
                if (activeTool === 'scanner') processImage(files[0]);
                if (activeTool === 'webp') processWebP(files);
                if (activeTool === 'pattern') processPatternImage(files[0]);
                if (activeTool === 'glitch') processGlitchImage(files[0]);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [activeTool]);


    // --- WebP Logic ---
    const processWebP = (files: File[]) => {
        const newBatch: ConvertedImage[] = files.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            originalName: f.name,
            originalSize: f.size,
            convertedUrl: '',
            convertedSize: 0,
            savings: 0,
            status: 'processing'
        }));

        setWebpImages(prev => [...newBatch, ...prev]);

        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (!blob) return;
                        const url = URL.createObjectURL(blob);
                        const savings = Math.max(0, ((file.size - blob.size) / file.size) * 100);

                        setWebpImages(prev => prev.map(item =>
                            item.id === newBatch[idx].id
                                ? { ...item, convertedUrl: url, convertedSize: blob.size, savings, status: 'done' }
                                : item
                        ));
                    }, 'image/webp', webpQuality);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // --- Social BG Logic ---
    useEffect(() => {
        if (activeTool !== 'social_bg' || !bgCanvasRef.current) return;

        const canvas = bgCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Determine dimensions based on aspect ratio (base width 1080)
        const w = 1080;
        let h = 1080;
        if (bgAspect === '9:16') h = 1920;
        if (bgAspect === '4:5') h = 1350;
        if (bgAspect === '16:9') h = 608;

        canvas.width = w;
        canvas.height = h;

        // Simple pseudo-random based on seed
        const random = (seed: number) => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        // Draw Background
        if (bgType === 'linear') {
            const grad = ctx.createLinearGradient(0, 0, w, h);
            bgColors.forEach((c, i) => grad.addColorStop(i / (bgColors.length - 1), c));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        } else if (bgType === 'radial') {
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
            bgColors.forEach((c, i) => grad.addColorStop(i / (bgColors.length - 1), c));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        } else if (bgType === 'mesh') {
            // Fill base with first color
            ctx.fillStyle = bgColors[0];
            ctx.fillRect(0, 0, w, h);

            // Draw random blobs for other colors
            bgColors.slice(1).forEach((c, i) => {
                const x = random(bgSeed + i) * w;
                const y = random(bgSeed + i + 10) * h;
                const r = (random(bgSeed + i + 20) * 0.5 + 0.3) * w; // Radius 30-80% of width

                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, c);
                grad.addColorStop(1, 'transparent');

                ctx.globalAlpha = 0.8;
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            });
            ctx.globalAlpha = 1.0;
        }

        // Add Noise
        if (bgNoise > 0) {
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const n = (Math.random() - 0.5) * bgNoise * 255;
                data[i] += n;
                data[i + 1] += n;
                data[i + 2] += n;
            }
            ctx.putImageData(imageData, 0, 0);
        }

    }, [activeTool, bgType, bgColors, bgAspect, bgNoise, bgSeed]);

    const downloadBg = () => {
        const canvas = bgCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `social - bg - ${bgAspect} -${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // --- Pattern Generator Logic ---
    const processPatternImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPatImage(e.target?.result as string);
            setPatMode('image');
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (activeTool !== 'pattern' || !patCanvasRef.current) return;

        const canvas = patCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = 1080;
        const H = 1080;
        canvas.width = W;
        canvas.height = H;

        // Background
        ctx.fillStyle = patBg;
        ctx.fillRect(0, 0, W, H);

        const drawItem = (x: number, y: number, imgObj?: HTMLImageElement) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((patRotation * Math.PI) / 180);
            ctx.globalAlpha = patOpacity;

            if (patMode === 'image' && imgObj) {
                const s = patScale * 2;
                ctx.drawImage(imgObj, -s / 2, -s / 2, s, s);
            } else {
                ctx.fillStyle = patColor;
                const s = patScale;
                ctx.beginPath();
                if (patShape === 'circle') {
                    ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
                } else if (patShape === 'square') {
                    ctx.rect(-s / 2, -s / 2, s, s);
                } else if (patShape === 'triangle') {
                    ctx.moveTo(0, -s / 2);
                    ctx.lineTo(s / 2, s / 2);
                    ctx.lineTo(-s / 2, s / 2);
                    ctx.closePath();
                } else if (patShape === 'cross') {
                    const t = s / 3;
                    ctx.rect(-t / 2, -s / 2, t, s);
                    ctx.rect(-s / 2, -t / 2, s, t);
                } else if (patShape === 'star') {
                    const outer = s / 2;
                    const inner = s / 4;
                    for (let i = 0; i < 5; i++) {
                        ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * outer, -Math.sin((18 + i * 72) / 180 * Math.PI) * outer);
                        ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * inner, -Math.sin((54 + i * 72) / 180 * Math.PI) * inner);
                    }
                    ctx.closePath();
                }
                ctx.fill();
            }
            ctx.restore();
        };

        const spacing = Math.max(20, patSpacing);
        const cols = Math.ceil(W / spacing) + 2;
        const rows = Math.ceil(H / spacing) + 2;

        // Load image once if needed
        let img: HTMLImageElement | undefined;
        if (patMode === 'image' && patImage) {
            img = new Image();
            img.src = patImage;
            img.onload = () => {
                drawPattern();
            };
        } else {
            drawPattern();
        }

        function drawPattern() {
            // Clear again to be safe or draw over
            ctx.fillStyle = patBg;
            ctx.fillRect(0, 0, W, H);

            if (patLayout === 'random') {
                const count = (W * H) / (spacing * spacing) * 2;
                let seed = 12345;
                const pseudoRandom = () => {
                    const x = Math.sin(seed++) * 10000;
                    return x - Math.floor(x);
                };

                for (let i = 0; i < count; i++) {
                    const x = pseudoRandom() * W;
                    const y = pseudoRandom() * H;
                    drawItem(x, y, img);
                }
            } else {
                for (let r = -1; r < rows; r++) {
                    for (let c = -1; c < cols; c++) {
                        let x = c * spacing;
                        let y = r * spacing;

                        if (patLayout === 'brick') {
                            if (r % 2 !== 0) x += spacing / 2;
                        }

                        drawItem(x, y, img);
                    }
                }
            }
        }

    }, [activeTool, patMode, patShape, patImage, patLayout, patBg, patColor, patScale, patSpacing, patRotation, patOpacity]);

    const downloadPattern = () => {
        if (!patCanvasRef.current) return;
        const link = document.createElement('a');
        link.download = `pattern - ${Date.now()}.png`;
        link.href = patCanvasRef.current.toDataURL('image/png');
        link.click();
    };

    // --- UTM Builder Logic ---
    useEffect(() => {
        if (!utmUrl) {
            setGeneratedUtm('');
            return;
        }
        try {
            const url = new URL(utmUrl.startsWith('http') ? utmUrl : `https://${utmUrl}`);
            const params = new URLSearchParams(url.search);

            if (utmSource) params.set('utm_source', utmSource);
            if (utmMedium) params.set('utm_medium', utmMedium);
            if (utmCampaign) params.set('utm_campaign', utmCampaign);
            if (utmTerm) params.set('utm_term', utmTerm);
            if (utmContent) params.set('utm_content', utmContent);

            setGeneratedUtm(`${url.origin}${url.pathname}?${params.toString()}`);
        } catch (e) {
            // Invalid URL
            setGeneratedUtm(utmUrl); // Fallback
        }


    }, [utmUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);


    // --- Glitch Effect Logic ---
    const processGlitchImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setGlitchImage(e.target?.result as string);
            setGlitchMode('image');
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (activeTool !== 'glitch' || !glitchCanvasRef.current) return;
        const canvas = glitchCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawFrame = () => {
            // Dimensions
            let w = 800;
            let h = 800;
            let imgObj: HTMLImageElement | null = null;

            if (glitchMode === 'image' && glitchImage) {
                imgObj = new Image();
                imgObj.src = glitchImage;
                // We need to wait for load, but inside effect we can try:
                if (!imgObj.complete) {
                    imgObj.onload = () => drawFrame(); // Recursive retry on load
                    return;
                }
                const aspect = imgObj.width / imgObj.height;
                w = 800;
                h = 800 / aspect;
            }

            canvas.width = w;
            canvas.height = h;

            // 1. Base Draw
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            if (glitchMode === 'text') {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 120px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(glitchText, w / 2, h / 2);
            } else if (imgObj) {
                ctx.drawImage(imgObj, 0, 0, w, h);
            }

            // 2. Apply Glitch Effects based on Seed + Amount
            const random = (seedOffset: number) => {
                const x = Math.sin(glitchSeed + seedOffset) * 10000;
                return x - Math.floor(x);
            };

            const intensity = glitchAmount * 100; // 0-100

            // RGB Shift
            if (glitchStyle === 'rgb' || glitchStyle === 'scanline') {
                const offset = intensity * 0.5;
                if (offset > 0) {
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const data = imageData.data;
                    const copy = new Uint8ClampedArray(data);

                    const shift = Math.floor(intensity * 0.5);

                    for (let i = 0; i < data.length; i += 4) {
                        const rIdx = i - (shift * 4);
                        if (rIdx >= 0) data[i] = copy[rIdx];

                        const bIdx = i + (shift * 4);
                        if (bIdx < data.length) data[i + 2] = copy[bIdx + 2];
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
            }

            // Slices
            if (glitchStyle === 'slice' || glitchAmount > 0.5) {
                const slices = Math.floor(glitchAmount * 20);
                for (let i = 0; i < slices; i++) {
                    const sliceH = Math.floor(random(i) * 50) + 2;
                    const sliceY = Math.floor(random(i + 100) * (h - sliceH));
                    const shiftX = Math.floor((random(i + 200) - 0.5) * intensity * 2);

                    ctx.drawImage(canvas, 0, sliceY, w, sliceH, shiftX, sliceY, w, sliceH);
                }
            }

            // Noise
            if (glitchStyle === 'noise') {
                const noiseAmt = glitchAmount * 100;
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (Math.random() > 0.5) {
                        const n = (Math.random() - 0.5) * noiseAmt;
                        data[i] += n;
                        data[i + 1] += n;
                        data[i + 2] += n;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }

            // Scanlines
            if (glitchStyle === 'scanline' || glitchAmount > 0.3) {
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                for (let y = 0; y < h; y += 4) {
                    ctx.fillRect(0, y, w, 2);
                }
            }

        };

        drawFrame();

    }, [activeTool, glitchMode, glitchText, glitchImage, glitchAmount, glitchSeed, glitchStyle]);

    const downloadGlitch = () => {
        if (!glitchCanvasRef.current) return;
        const link = document.createElement('a');
        link.download = `glitch-${Date.now()}.png`;
        link.href = glitchCanvasRef.current.toDataURL('image/png');
        link.click();
    };

    // --- Mesh Gradient Logic ---

    const applyPalette = (colors: string[]) => {
        setMeshNodes(colors.map((c, i) => ({
            id: Date.now() + i,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            color: c,
            r: 50 + Math.random() * 30
        })));
        setMeshBg(colors[0]);
    };

    const addMeshNode = () => {
        setMeshNodes(prev => [...prev, {
            id: Date.now(),
            x: 50,
            y: 50,
            color: '#ffffff',
            r: 60
        }]);
    };

    const removeMeshNode = (id: number) => {
        if (meshNodes.length <= 2) return;
        setMeshNodes(prev => prev.filter(n => n.id !== id));
    };

    const randomizeMeshPositions = () => {
        setMeshNodes(prev => prev.map(n => ({
            ...n,
            x: Math.random() * 100,
            y: Math.random() * 100,
            r: 40 + Math.random() * 50
        })));
    };

    // Mesh Interaction Handlers
    const handleMeshDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!showMeshControls) return;

        const canvas = meshCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = (clientX - rect.left) / rect.width * 100;
        const y = (clientY - rect.top) / rect.height * 100;

        // Find clicked node (within 5% tolerance)
        const clicked = meshNodes.find(n => Math.hypot(n.x - x, n.y - y) < 5);

        if (clicked) {
            setIsMeshDragging(true);
            setSelectedMeshNode(clicked.id);
        }
    };

    const handleMeshMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isMeshDragging || selectedMeshNode === null || !showMeshControls) return;

        const canvas = meshCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100));
        const y = Math.max(0, Math.min(100, (clientY - rect.top) / rect.height * 100));

        setMeshNodes(prev => prev.map(n => n.id === selectedMeshNode ? { ...n, x, y } : n));
    };

    const handleMeshUp = () => {
        setIsMeshDragging(false);
        setSelectedMeshNode(null);
    };

    useEffect(() => {
        if (activeTool !== 'mesh' || !meshCanvasRef.current) return;

        const canvas = meshCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Determine Resolution based on Aspect Ratio
        const base = 1600;
        let W = base;
        let H = base;

        if (meshAspect === '16:9') { W = 1920; H = 1080; }
        else if (meshAspect === '9:16') { W = 1080; H = 1920; }
        else if (meshAspect === '4:5') { W = 1080; H = 1350; }
        else if (meshAspect === '4:3') { W = 1600; H = 1200; }

        canvas.width = W;
        canvas.height = H;

        // 1. Draw Background (SHARP, NO FILTER)
        ctx.fillStyle = meshBg;
        ctx.fillRect(0, 0, W, H);

        // 2. Draw Nodes with Blur Filter
        const blurScale = W / 1200;
        ctx.filter = `blur(${meshBlur * blurScale}px) contrast(${meshContrast}%) brightness(${meshBrightness}%) hue-rotate(${meshHue}deg)`;

        meshNodes.forEach(node => {
            const x = (node.x / 100) * W;
            const y = (node.y / 100) * H;
            const r = (node.r / 100) * (Math.min(W, H) * 0.8);

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, node.color);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Remove Filter for Grain and Controls
        ctx.filter = 'none';

        // 4. Grain / Noise
        if (meshGrain > 0) {
            const imageData = ctx.getImageData(0, 0, W, H);
            const data = imageData.data;
            const amount = (meshGrain / 100) * 50;
            for (let i = 0; i < data.length; i += 4) {
                const n = (Math.random() - 0.5) * amount;
                data[i] = Math.min(255, Math.max(0, data[i] + n));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // 5. Draw Controls (If enabled)
        if (showMeshControls) {
            meshNodes.forEach(node => {
                const x = (node.x / 100) * W;
                const y = (node.y / 100) * H;
                const r = 20; // Handle size

                // Outer ring
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Inner color
                ctx.beginPath();
                ctx.arc(x, y, r - 2, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();

                // Selection indicator
                if (node.id === selectedMeshNode) {
                    ctx.beginPath();
                    ctx.arc(x, y, r + 10, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }

    }, [activeTool, meshNodes, meshBg, meshBlur, meshContrast, meshBrightness, meshHue, meshGrain, meshAspect, showMeshControls, selectedMeshNode]);

    const downloadMeshPng = () => {
        if (!meshCanvasRef.current) return;
        const canvas = meshCanvasRef.current;

        // Temporarily hide controls for download
        const prevShow = showMeshControls;
        // We can't easily "hide" React state synchronously for the canvas draw inside this function 
        // without triggering a re-render.
        // Instead, we'll just rely on the user turning off controls or we accept controls in screenshot if on.
        // Better approach: trigger a re-render with controls off, then download. 
        // But for now, let's just perform the download.

        const link = document.createElement('a');
        link.download = `mesh-gradient-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const renderScanner = () => (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <ScanLine size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">QR Scanner</h2>
                </div>
            </div>

            <div
                className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-12 text-center group cursor-pointer
            ${isDragging
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-xl'
                        : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50 hover:shadow-lg'
                    }
        `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                    <ScanLine size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Drop QR Code Here</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Drag and drop your image file, or <span className="text-indigo-600 font-bold underline decoration-2 decoration-indigo-200 underline-offset-2">browse</span> to upload.
                    <br /><span className="text-xs opacity-70 mt-2 block">Supports PNG, JPG, WebP</span>
                </p>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }}
                />
            </div>

            {scanResult && (
                <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 flex items-center gap-3 text-emerald-700 font-bold">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
                            <Check size={16} strokeWidth={3} />
                        </div>
                        Decoded Successfully
                    </div>
                    <div className="p-8">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-sm text-slate-700 break-all shadow-inner mb-6">
                            {scanResult}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => { navigator.clipboard.writeText(scanResult); alert('Copied!'); }}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <Copy size={18} /> Copy Content
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {scanError && (
                <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl animate-in fade-in slide-in-from-bottom-2 flex items-center gap-4 text-red-700 shadow-sm">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <span className="font-bold">{scanError}</span>
                </div>
            )}
        </div>
    );

    const renderWebPConverter = () => (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <FileImage size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">WebP Converter</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900">Quality</h3>
                                <p className="text-xs text-slate-500 font-medium">Compression Level</p>
                            </div>
                            <div className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">
                                {Math.round(webpQuality * 100)}%
                            </div>
                        </div>
                        <input
                            type="range"
                            min="0.1" max="1.0" step="0.05"
                            value={webpQuality}
                            onChange={(e) => setWebpQuality(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Small Size</span>
                            <span>High Quality</span>
                        </div>
                    </div>

                    <div
                        className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group bg-white"
                        onClick={() => webpInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                            <Upload size={28} />
                        </div>
                        <p className="font-bold text-slate-900 mb-1">Upload Images</p>
                        <p className="text-xs text-slate-500">PNG, JPG supported</p>
                        <input
                            type="file"
                            multiple
                            ref={webpInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={(e) => e.target.files && processWebP(Array.from(e.target.files))}
                        />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {webpImages.length === 0 ? (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                            <FileImage size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No images converted yet</p>
                        </div>
                    ) : (
                        webpImages.map((img) => (
                            <div key={img.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${img.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600 animate-pulse'}`}>
                                        {img.status === 'done' ? <Check size={20} /> : <Loader2 size={20} className="animate-spin" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 truncate max-w-[200px] mb-0.5">{img.originalName}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-3 font-medium">
                                            <span>{formatSize(img.originalSize)}</span>
                                            {img.status === 'done' && (
                                                <>
                                                    <ArrowRight size={12} className="text-slate-300" />
                                                    <span className="text-slate-900">{formatSize(img.convertedSize)}</span>
                                                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">-{Math.round(img.savings)}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {img.status === 'done' && (
                                    <a
                                        href={img.convertedUrl}
                                        download={`${img.originalName.split('.')[0]}.webp`}
                                        className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                        title="Download"
                                    >
                                        <Download size={20} />
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderSocialBgGenerator = () => (
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <ImageIcon size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Social Backgrounds</h2>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings size={16} className="text-slate-400" /> Style & Format
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gradient Type</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['linear', 'radial', 'mesh'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setBgType(t as BgType)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${bgType === t ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['1:1', '9:16', '16:9', '4:5', '4:3'].map((a) => (
                                        <button
                                            key={a}
                                            onClick={() => setBgAspect(a as AspectRatio)}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${bgAspect === a ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Noise Texture</label>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{Math.round(bgNoise * 100)}%</span>
                                </div>
                                <input type="range" min="0" max="0.5" step="0.01" value={bgNoise} onChange={e => setBgNoise(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Palette size={16} className="text-slate-400" /> Color Palette
                        </h3>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {bgColors.map((c, i) => (
                                <div key={i} className="relative group aspect-square">
                                    <input
                                        type="color"
                                        value={c}
                                        onChange={e => {
                                            const newColors = [...bgColors];
                                            newColors[i] = e.target.value;
                                            setBgColors(newColors);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-full rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: c }} />
                                    {bgColors.length > 2 && (
                                        <button
                                            onClick={() => setBgColors(bgColors.filter((_, idx) => idx !== i))}
                                            className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-slate-100"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => setBgColors([...bgColors, '#ffffff'])} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-500 hover:border-indigo-300 transition-all">
                                <Plus size={20} />
                            </button>
                        </div>
                        <button onClick={() => setBgSeed(Math.random() * 100)} className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 border border-slate-200/50">
                            <Shuffle size={16} /> Randomize
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-9 bg-slate-100 rounded-[2rem] p-8 flex items-center justify-center relative overflow-hidden group border border-slate-200/50">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]"></div>

                    <canvas
                        ref={bgCanvasRef}
                        className="max-w-full max-h-full shadow-2xl shadow-slate-400/20 rounded-2xl transition-all duration-500"
                        style={{
                            aspectRatio: bgAspect.replace(':', '/'),
                            height: bgAspect === '9:16' ? '85%' : 'auto',
                            width: bgAspect === '16:9' ? '90%' : 'auto',
                            maxHeight: '650px'
                        }}
                    />

                    <div className="absolute bottom-8 flex gap-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={downloadBg}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Download size={20} /> Download PNG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    const renderPatternGenerator = () => (
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Grid3X3 size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Pattern Generator</h2>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Shapes size={16} className="text-slate-400" /> Source Element
                        </h3>
                        <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setPatMode('shape')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${patMode === 'shape' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Shape</button>
                            <button onClick={() => setPatMode('image')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${patMode === 'image' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Image</button>
                        </div>

                        {patMode === 'shape' ? (
                            <div className="grid grid-cols-5 gap-2">
                                {['circle', 'square', 'triangle', 'cross', 'star'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setPatShape(s as PatShape)}
                                        className={`aspect-square rounded-xl border flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all ${patShape === s ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 text-indigo-600' : 'border-slate-200'}`}
                                    >
                                        {s === 'circle' && <Circle size={18} />}
                                        {s === 'square' && <div className="w-4 h-4 border-2 border-current bg-current rounded-[2px]" />}
                                        {s === 'triangle' && <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-current" />}
                                        {s === 'cross' && <Plus size={20} strokeWidth={3} />}
                                        {s === 'star' && <Zap size={18} fill="currentColor" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group"
                                onClick={() => patInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                {patImage ? (
                                    <img src={patImage} className="w-16 h-16 object-contain mx-auto mb-2 rounded-lg shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                        <Upload size={20} />
                                    </div>
                                )}
                                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Upload Icon</span>
                                <input type="file" ref={patInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && processPatternImage(e.target.files[0])} />
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Layout size={16} className="text-slate-400" /> Layout & Style
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Arrangement</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['grid', 'brick', 'random'].map(l => (
                                        <button key={l} onClick={() => setPatLayout(l as PatLayout)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${patLayout === l ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>{l}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Size', val: patScale, set: setPatScale, min: 10, max: 200 },
                                    { label: 'Spacing', val: patSpacing, set: setPatSpacing, min: 20, max: 300 },
                                    { label: 'Rotation', val: patRotation, set: setPatRotation, min: 0, max: 360 },
                                    { label: 'Opacity', val: patOpacity, set: setPatOpacity, min: 0.1, max: 1, step: 0.1 }
                                ].map((opt) => (
                                    <div key={opt.label}>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{opt.label}</label>
                                            <span className="text-[10px] font-bold text-slate-600">{opt.val}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={opt.min} max={opt.max} step={opt.step || 1}
                                            value={opt.val}
                                            onChange={e => opt.set(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                        <input type="color" value={patBg} onChange={e => setPatBg(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">Background</span>
                                </div>
                                {patMode === 'shape' && (
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                            <input type="color" value={patColor} onChange={e => setPatColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">Color</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 bg-slate-200 rounded-[2rem] p-8 flex items-center justify-center relative overflow-hidden group border border-slate-300/50">
                    <canvas ref={patCanvasRef} className="max-w-full max-h-full shadow-2xl rounded-xl" style={{ maxHeight: '650px' }} />
                    <div className="absolute bottom-8 flex gap-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={downloadPattern}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Download size={20} /> Download Pattern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUtmBuilder = () => (
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Link2 size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">UTM Builder</h2>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Website URL <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="url"
                                        value={utmUrl}
                                        onChange={e => setUtmUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Campaign Source <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={utmSource}
                                            onChange={e => setUtmSource(e.target.value)}
                                            placeholder="google, newsletter"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Campaign Medium <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={utmMedium}
                                            onChange={e => setUtmMedium(e.target.value)}
                                            placeholder="cpc, banner, email"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Campaign Name <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={utmCampaign}
                                        onChange={e => setUtmCampaign(e.target.value)}
                                        placeholder="spring_sale, promo_code"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Campaign Term</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={utmTerm}
                                            onChange={e => setUtmTerm(e.target.value)}
                                            placeholder="running+shoes"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Campaign Content</label>
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={utmContent}
                                            onChange={e => setUtmContent(e.target.value)}
                                            placeholder="logolink, textlink"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 flex-1 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Link2 size={120} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Generated Campaign URL</h3>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 break-all font-mono text-lg text-white leading-relaxed">
                                {generatedUtm || <span className="text-slate-500 italic">Fill in the required fields to generate your URL...</span>}
                            </div>
                        </div>

                        {generatedUtm && (
                            <div className="flex gap-4 mt-8 relative z-10">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedUtm);
                                        // toast success
                                    }}
                                    className="flex-1 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    <Copy size={20} /> Copy URL
                                </button>
                                <button
                                    onClick={() => {
                                        // Logic to send to QR generator
                                        setActiveTool(null);
                                        // You would typically update the main app state here
                                    }}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    <ScanLine size={20} /> Create QR Code
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGlitchGenerator = () => (
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Zap size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Glitch Effect</h2>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings size={16} className="text-slate-400" /> Configuration
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mode</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button onClick={() => setGlitchMode('text')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${glitchMode === 'text' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Text</button>
                                    <button onClick={() => setGlitchMode('image')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${glitchMode === 'image' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Image</button>
                                </div>
                            </div>

                            {glitchMode === 'text' ? (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Input Text</label>
                                    <input
                                        type="text"
                                        value={glitchText}
                                        onChange={e => setGlitchText(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group"
                                    onClick={() => glitchInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    {glitchImage ? (
                                        <img src={glitchImage} className="w-16 h-16 object-contain mx-auto mb-2 rounded-lg shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Upload Image</span>
                                    <input type="file" ref={glitchInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setGlitchImage(URL.createObjectURL(e.target.files[0]))} />
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Glitch Style</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['rgb', 'slice', 'noise', 'scanline'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setGlitchStyle(s as GlitchStyle)}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all capitalize ${glitchStyle === s ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intensity</label>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{Math.round(glitchAmount * 100)}%</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.05" value={glitchAmount} onChange={e => setGlitchAmount(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            </div>

                            <button onClick={() => setGlitchSeed(Math.random())} className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 border border-slate-200/50">
                                <Shuffle size={16} /> Randomize Glitch
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 bg-slate-900 rounded-[2rem] p-8 flex items-center justify-center relative overflow-hidden group border border-slate-800 shadow-2xl">
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

                    <canvas
                        ref={glitchCanvasRef}
                        className="max-w-full max-h-full shadow-2xl shadow-black/50 rounded-xl"
                        style={{ maxHeight: '650px' }}
                    />

                    <div className="absolute bottom-8 flex gap-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.download = `glitch-${Date.now()}.png`;
                                link.href = glitchCanvasRef.current?.toDataURL() || '';
                                link.click();
                            }}
                            className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={20} /> Download Result
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMeshGenerator = () => (
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Palette size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Mesh Gradients</h2>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Sliders size={16} className="text-slate-400" /> Controls
                            </h3>
                            <button
                                onClick={() => setShowMeshControls(!showMeshControls)}
                                className={`p-2 rounded-lg transition-colors ${showMeshControls ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                title="Toggle Point Controls"
                            >
                                {showMeshControls ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Background Color</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                        <input type="color" value={meshBg} onChange={e => setMeshBg(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 uppercase">{meshBg}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Color Points</label>
                                <div className="space-y-2">
                                    {meshNodes.map((node, i) => (
                                        <div key={node.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 group">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                                                <input
                                                    type="color"
                                                    value={node.color}
                                                    onChange={e => {
                                                        const newNodes = [...meshNodes];
                                                        newNodes[i].color = e.target.value;
                                                        setMeshNodes(newNodes);
                                                    }}
                                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                    <span>Radius</span>
                                                    <span>{Math.round(node.r)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10" max="100"
                                                    value={node.r}
                                                    onChange={e => {
                                                        const newNodes = [...meshNodes];
                                                        newNodes[i].r = Number(e.target.value);
                                                        setMeshNodes(newNodes);
                                                    }}
                                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setMeshNodes(meshNodes.filter(n => n.id !== node.id))}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setMeshNodes([...meshNodes, { id: Date.now(), x: 50, y: 50, color: '#ffffff', r: 40 }])}
                                        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Add Color Point
                                    </button>
                                </div>
                            </div>

                            <button onClick={() => {
                                const palette = PRESET_PALETTES[Math.floor(Math.random() * PRESET_PALETTES.length)];
                                const newNodes = palette.map((color, i) => ({
                                    id: Date.now() + i,
                                    x: Math.random() * 100,
                                    y: Math.random() * 100,
                                    color,
                                    r: 30 + Math.random() * 40
                                }));
                                setMeshNodes(newNodes);
                            }} className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 border border-slate-200/50">
                                <Shuffle size={16} /> Randomize Palette
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings size={16} className="text-slate-400" /> Effects
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Grain', val: meshGrain, set: setMeshGrain, min: 0, max: 0.5, step: 0.01 },
                                { label: 'Blur', val: meshBlur, set: setMeshBlur, min: 0, max: 100 },
                                { label: 'Contrast', val: meshContrast, set: setMeshContrast, min: 0.5, max: 2, step: 0.1 },
                                { label: 'Brightness', val: meshBrightness, set: setMeshBrightness, min: 0.5, max: 2, step: 0.1 },
                                { label: 'Hue Shift', val: meshHue, set: setMeshHue, min: 0, max: 360 }
                            ].map((opt) => (
                                <div key={opt.label}>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{opt.label}</label>
                                        <span className="text-[10px] font-bold text-slate-600">{Math.round(opt.val * 100) / 100}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={opt.min} max={opt.max} step={opt.step || 1}
                                        value={opt.val}
                                        onChange={e => opt.set(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 bg-slate-100 rounded-[2rem] p-8 flex items-center justify-center relative overflow-hidden group border border-slate-200/50">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')]"></div>

                    <div className="relative shadow-2xl shadow-slate-400/20 rounded-2xl overflow-hidden transition-all duration-500"
                        style={{
                            aspectRatio: meshAspect.replace(':', '/'),
                            height: meshAspect === '9:16' ? '85%' : 'auto',
                            width: meshAspect === '16:9' ? '90%' : 'auto',
                            maxHeight: '650px'
                        }}
                    >
                        <canvas
                            ref={meshCanvasRef}
                            className="w-full h-full object-cover"
                        />

                        {/* Interactive Points Overlay */}
                        {showMeshControls && (
                            <div className="absolute inset-0 pointer-events-none">
                                {meshNodes.map((node) => (
                                    <div
                                        key={node.id}
                                        className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg cursor-move pointer-events-auto transition-transform hover:scale-125 ${selectedMeshNode === node.id ? 'ring-2 ring-indigo-500 scale-110 z-10' : 'z-0'}`}
                                        style={{
                                            left: `${node.x}%`,
                                            top: `${node.y}%`,
                                            backgroundColor: node.color
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setIsMeshDragging(true);
                                            setSelectedMeshNode(node.id);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-8 flex gap-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20 mr-4">
                            {['1:1', '16:9', '9:16', '4:3'].map(a => (
                                <button
                                    key={a}
                                    onClick={() => setMeshAspect(a as AspectRatio)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${meshAspect === a ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.download = `mesh-${Date.now()}.png`;
                                link.href = meshCanvasRef.current?.toDataURL() || '';
                                link.click();
                            }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Download size={20} /> Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDpiCalculator = () => (
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => setActiveTool(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Apps</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Printer size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Print DPI Calculator</h2>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Monitor size={24} className="text-slate-400" /> Image Dimensions
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Width (px)</label>
                                    <input
                                        type="number"
                                        value={dpiWidth}
                                        onChange={e => setDpiWidth(Number(e.target.value))}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Height (px)</label>
                                    <input
                                        type="number"
                                        value={dpiHeight}
                                        onChange={e => setDpiHeight(Number(e.target.value))}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Printer size={24} className="text-slate-400" /> Target Quality
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DPI (Dots Per Inch)</label>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{dpiValue} DPI</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="72" max="600" step="1"
                                        value={dpiValue}
                                        onChange={e => setDpiValue(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {[72, 150, 300, 600].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDpiValue(d)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${dpiValue === d ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Printer size={200} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Max Print Size</h4>
                                <div className="text-5xl font-bold tracking-tight">
                                    {(dpiWidth / dpiValue).toFixed(1)}" <span className="text-slate-500 text-3xl">x</span> {(dpiHeight / dpiValue).toFixed(1)}"
                                </div>
                                <div className="text-slate-400 mt-2 font-medium">
                                    {((dpiWidth / dpiValue) * 2.54).toFixed(1)}cm x {((dpiHeight / dpiValue) * 2.54).toFixed(1)}cm
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                                <div>
                                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Pixels</div>
                                    <div className="text-xl font-bold">{(dpiWidth * dpiHeight / 1000000).toFixed(1)} MP</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Print Quality</div>
                                    <div className={`text-xl font-bold ${dpiValue >= 300 ? 'text-emerald-400' : dpiValue >= 150 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {dpiValue >= 300 ? 'Excellent' : dpiValue >= 150 ? 'Good' : 'Low Res'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Main View ---
    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-6 lg:p-12 custom-scrollbar">
            {activeTool === 'batch' ? <BatchQRGenerator onBack={() => setActiveTool(null)} /> :
            activeTool === 'barcode' ? <BarcodeGenerator onBack={() => setActiveTool(null)} /> :
            activeTool === 'scanner' ? renderScanner() :
                activeTool === 'webp' ? renderWebPConverter() :
                    activeTool === 'social_bg' ? renderSocialBgGenerator() :
                        activeTool === 'whatsapp' ? <WhatsAppGenerator onBack={() => setActiveTool(null)} /> :
                            activeTool === 'pattern' ? renderPatternGenerator() :
                                activeTool === 'utm' ? renderUtmBuilder() :
                                    activeTool === 'glitch' ? renderGlitchGenerator() :
                                        activeTool === 'mesh' ? renderMeshGenerator() :
                                            activeTool === 'dpi' ? renderDpiCalculator() :
                                                (
                                                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
                                                        <div className="mb-12 text-center lg:text-left">
                                                            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Developer Tools & Utilities</h1>
                                                            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                                                                A collection of free, privacy-focused tools running entirely in your browser.
                                                                No server uploads, no tracking.
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                            {TOOLS.map((tool) => (
                                                                <button
                                                                    key={tool.id}
                                                                    onClick={() => tool.status === 'active' && setActiveTool(tool.id)}
                                                                    disabled={tool.status !== 'active'}
                                                                    className={`text-left group relative p-8 rounded-[2rem] border transition-all duration-300 bg-white flex flex-col h-full ${tool.status === 'active'
                                                                        ? 'border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer'
                                                                        : 'border-slate-100 opacity-60 cursor-not-allowed grayscale-[0.5]'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start justify-between mb-6">
                                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${tool.status === 'active' ? 'bg-slate-900 group-hover:bg-indigo-600 group-hover:scale-110' : 'bg-slate-400'
                                                                            } transition-all duration-300`}>
                                                                            <tool.icon size={28} />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            {tool.badge && (
                                                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                                                                                    {tool.badge}
                                                                                </span>
                                                                            )}
                                                                            {tool.status !== 'active' && (
                                                                                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-100">
                                                                                    Coming Soon
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{tool.title}</h3>
                                                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{tool.desc}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
        </div>
    );
};

// ============================================================
// BATCH QR GENERATOR
// ============================================================

function crc32(data: Uint8Array): number {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[i] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: { name: string; data: Uint8Array }[]): Blob {
    const localParts: Uint8Array[] = [];
    const centralDir: Uint8Array[] = [];
    let offset = 0;

    for (const file of files) {
        const nameBytes = new TextEncoder().encode(file.name);
        const crc = crc32(file.data);

        const local = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, file.data.length, true);
        lv.setUint32(22, file.data.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        local.set(nameBytes, 30);

        const cd = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(cd.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, file.data.length, true);
        cv.setUint32(24, file.data.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        cd.set(nameBytes, 46);

        localParts.push(local, file.data);
        centralDir.push(cd);
        offset += local.length + file.data.length;
    }

    const cdSize = centralDir.reduce((s, c) => s + c.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralDir, eocd], { type: 'application/zip' });
}

interface BatchRow { name: string; url: string; }

const BatchQRGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [rows, setRows] = useState<BatchRow[]>([]);
    const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseCSV = (text: string): BatchRow[] => {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) return [];
        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes('url') || firstLine.includes('name') || firstLine.includes('link');
        const dataLines = hasHeader ? lines.slice(1) : lines;
        return dataLines.map((line, i) => {
            const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length === 1) return { name: `qr-${i + 1}`, url: cols[0] };
            return { name: cols[0] || `qr-${i + 1}`, url: cols[1] || '' };
        }).filter(r => r.url);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const parsed = parseCSV(text);
            setRows(parsed);
            setStatus('idle');
            setProgress(0);
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const csv = 'name,url\nMy Website,https://example.com\nGoogle,https://google.com\nGitHub,https://github.com';
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'qr-template.csv';
        a.click();
    };

    const generateAll = async () => {
        if (rows.length === 0) return;
        setStatus('generating');
        setProgress(0);
        const zipFiles: { name: string; data: Uint8Array }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const dataUrl = await QRCode.toDataURL(row.url, {
                    width: 512,
                    margin: 2,
                    errorCorrectionLevel: 'H',
                    color: { dark: '#000000', light: '#ffffff' }
                });
                const base64 = dataUrl.split(',')[1];
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let b = 0; b < binary.length; b++) bytes[b] = binary.charCodeAt(b);
                const safeName = row.name.replace(/[^a-z0-9_\-]/gi, '_').slice(0, 60) || `qr-${i + 1}`;
                zipFiles.push({ name: `${safeName}.png`, data: bytes });
            } catch {
                // skip invalid URLs
            }
            setProgress(Math.round(((i + 1) / rows.length) * 100));
        }

        if (zipFiles.length === 0) {
            setStatus('error');
            setErrorMsg('No valid QR codes could be generated. Check your URLs.');
            return;
        }

        const zip = createZip(zipFiles);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zip);
        a.download = `qr-batch-${Date.now()}.zip`;
        a.click();
        setStatus('done');
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-10">
                <button onClick={onBack} className="p-2.5 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Batch QR Generator</h2>
                    <p className="text-slate-500 mt-1">Upload a CSV → Generate QR codes → Download as ZIP</p>
                </div>
            </div>

            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <h3 className="text-lg font-bold text-slate-900">Prepare your CSV</h3>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 font-mono text-sm text-slate-700 mb-5 border border-slate-200">
                    <div className="text-slate-400 text-xs font-bold mb-2 font-sans uppercase tracking-wider">Expected format</div>
                    <div className="text-emerald-600 font-bold">name,url</div>
                    <div>My Website,https://example.com</div>
                    <div>Google,https://google.com</div>
                    <div>GitHub,https://github.com</div>
                </div>
                <button onClick={downloadTemplate} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                    <Download size={16} />
                    Download Template CSV
                </button>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <h3 className="text-lg font-bold text-slate-900">Upload your CSV</h3>
                </div>
                <div
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={28} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-slate-700">Click to upload CSV</p>
                    <p className="text-sm text-slate-400 mt-1">Supports .csv files with name,url columns</p>
                </div>

                {rows.length > 0 && (
                    <div className="mt-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-700">{rows.length} row{rows.length !== 1 ? 's' : ''} found</span>
                            <button onClick={() => { setRows([]); setStatus('idle'); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs text-red-500 hover:text-red-700 font-semibold">Clear</button>
                        </div>
                        <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
                            {rows.slice(0, 50).map((row, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    <span className="text-slate-400 text-xs w-6 text-right flex-shrink-0">{i + 1}</span>
                                    <span className="font-semibold text-slate-800 w-32 truncate flex-shrink-0">{row.name}</span>
                                    <span className="text-slate-500 truncate">{row.url}</span>
                                </div>
                            ))}
                            {rows.length > 50 && (
                                <div className="px-4 py-2.5 text-xs text-slate-400 text-center">...and {rows.length - 50} more</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Step 3 — Generate */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <h3 className="text-lg font-bold text-slate-900">Generate & Download</h3>
                </div>

                {status === 'generating' && (
                    <div className="mb-5">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
                            <span>Generating...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {status === 'done' && (
                    <div className="mb-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <Check size={20} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-emerald-800">ZIP downloaded successfully!</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-5 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-700">{errorMsg}</span>
                    </div>
                )}

                <button
                    onClick={generateAll}
                    disabled={rows.length === 0 || status === 'generating'}
                    className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all ${rows.length === 0 || status === 'generating'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
                >
                    {status === 'generating' ? (
                        <><Loader2 size={20} className="animate-spin" /> Generating {rows.length} QR codes...</>
                    ) : (
                        <><Download size={20} /> Generate & Download ZIP ({rows.length} QR{rows.length !== 1 ? 's' : ''})</>
                    )}
                </button>
                <p className="text-xs text-slate-400 text-center mt-3">All processing happens in your browser. Nothing is uploaded.</p>
            </div>
        </div>
    );
};

export default AppsHub;
