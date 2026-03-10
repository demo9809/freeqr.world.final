
import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import QRRenderer from './components/QRRenderer';
import { QRContentState, QRContentType, QRDesignState, QRModuleStyle, QREyeStyle, QRFrame, PanelMode, QRHistoryEntry } from './types';
import { loadHistory, addHistoryEntry, removeHistoryEntry, clearAllHistory } from './services/historyService';
import { Download, Zap, ChevronDown, Copy, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';

const TYPE_LABELS: Partial<Record<QRContentType, string>> = {
  [QRContentType.URL]: 'URL',
  [QRContentType.TEXT]: 'Text',
  [QRContentType.WIFI]: 'WiFi',
  [QRContentType.EMAIL]: 'Email',
  [QRContentType.VCARD]: 'vCard',
  [QRContentType.PHONE]: 'Phone',
  [QRContentType.SMS]: 'SMS',
  [QRContentType.WHATSAPP]: 'WhatsApp',
  [QRContentType.TELEGRAM]: 'Telegram',
  [QRContentType.EVENT]: 'Event',
  [QRContentType.GEO]: 'Location',
  [QRContentType.UPI]: 'UPI',
  [QRContentType.PAYPAL]: 'PayPal',
  [QRContentType.CRYPTO]: 'Crypto',
  [QRContentType.SOCIAL]: 'Social',
  [QRContentType.APP_STORE]: 'App Store',
};

const generateLabel = (content: QRContentState): string => {
  const typeLabel = TYPE_LABELS[content.type] || content.type;
  switch (content.type) {
    case QRContentType.URL: return content.value.replace(/^https?:\/\//, '').slice(0, 40) || 'URL QR';
    case QRContentType.WIFI: return content.wifi?.ssid || 'WiFi QR';
    case QRContentType.EMAIL: return content.email?.to || 'Email QR';
    case QRContentType.VCARD: return `${content.vcard?.firstName || ''} ${content.vcard?.lastName || ''}`.trim() || 'vCard QR';
    case QRContentType.APP_STORE: return 'App Store Smart Link';
    case QRContentType.TEXT: return content.value.slice(0, 40) || 'Text QR';
    default: return `${typeLabel} QR`;
  }
};

function App() {
  const [activeMode, setActiveMode] = useState<PanelMode>('data');

  const initialContent: QRContentState = {
    type: QRContentType.URL,
    value: 'https://google.com',
    wifi: { ssid: '', pass: '', encryption: 'WPA' },
    geo: { lat: '', lng: '', url: '', mode: 'url' }
  };

  const initialDesign: QRDesignState = {
    isBranded: true,
    fgColor: '#1e293b',
    bgColor: '#ffffff',
    moduleStyle: QRModuleStyle.ROUNDED,
    eyeStyle: QREyeStyle.SQUARE,
    logoUrl: null,
    logoSize: 0.2,
    eyeColor: '',
    gradientEnabled: false,
    gradientColor2: '#6366f1',
    gradientAngle: 135,
    frame: QRFrame.NONE,
    frameText: 'SCAN ME',
    frameColor: '#000000'
  };

  const [content, setContent] = useState<QRContentState>(initialContent);
  const [design, setDesign] = useState<QRDesignState>(initialDesign);

  // History state — loaded from localStorage on mount
  const [history, setHistory] = useState<QRHistoryEntry[]>(() => loadHistory());

  // Download State
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf'>('png');
  const [downloadQuality, setDownloadQuality] = useState<number>(2048);

  // Copy to Clipboard state
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings and content to default?")) {
      setContent({
        type: QRContentType.URL,
        value: '',
        wifi: { ssid: '', pass: '', encryption: 'WPA' },
        geo: { lat: '', lng: '', url: '', mode: 'url' }
      });
      setDesign({
        isBranded: false,
        fgColor: '#000000',
        bgColor: '#ffffff',
        moduleStyle: QRModuleStyle.SQUARE,
        eyeStyle: QREyeStyle.SQUARE,
        logoUrl: null,
        logoSize: 0.2,
        eyeColor: '',
        gradientEnabled: false,
        gradientColor2: '#6366f1',
        gradientAngle: 135,
        frame: QRFrame.NONE,
        frameText: 'SCAN ME',
        frameColor: '#000000'
      });
      setActiveMode('data');
    }
  };

  const saveCurrentToHistory = () => {
    if (!content.value) return;
    const entry: QRHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      label: generateLabel(content),
      contentType: content.type,
      qrValue: content.value,
      content: { ...content },
      design: { ...design },
    };
    setHistory(prev => addHistoryEntry(prev, entry));
  };

  /**
   * Clones the QR SVG and converts any embedded `data:image/svg+xml` <image>
   * hrefs to `data:image/png` so that vector tools like Adobe Illustrator can
   * read the file without throwing "linked file not found" errors.
   */
  const prepareSvgForExport = async (): Promise<string> => {
    const svgEl = document.getElementById('qr-svg');
    if (!svgEl) return '';
    const cloned = svgEl.cloneNode(true) as Element;
    const images = Array.from(cloned.querySelectorAll('image'));
    await Promise.all(images.map((imgEl) =>
      new Promise<void>((resolve) => {
        const href = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href') || '';
        if (!href.startsWith('data:image/svg+xml')) { resolve(); return; }
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx?.clearRect(0, 0, 256, 256);
          ctx?.drawImage(img, 0, 0, 256, 256);
          imgEl.setAttribute('href', canvas.toDataURL('image/png'));
          imgEl.removeAttribute('xlink:href');
          resolve();
        };
        img.onerror = () => resolve();
        img.src = href;
      })
    ));
    return new XMLSerializer().serializeToString(cloned);
  };

  const svgToPngBlob = (size: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const svg = document.getElementById('qr-svg');
      if (!svg) return resolve(null);

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      canvas.width = size;
      canvas.height = size;

      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = design.bgColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          }, 'image/png', 0.95);
        } else {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  };

  const handleDownload = async () => {
    if (!document.getElementById('qr-svg')) return;
    saveCurrentToHistory();

    if (downloadFormat === 'svg') {
      // Export as Illustrator-safe SVG (SVG-in-SVG images → PNG)
      const svgStr = await prepareSvgForExport();
      triggerDownload(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), 'svg');
      return;
    }

    if (downloadFormat === 'pdf') {
      // Convert SVG directly to vector PDF — no rasterisation, tiny file size
      const svgStr = await prepareSvgForExport();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgStr, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;

      const sizeMm = 200;   // square PDF, 200mm × 200mm
      const margin = 10;
      const inner = sizeMm - margin * 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [sizeMm, sizeMm] });
      await svg2pdf(svgElement, pdf, { x: margin, y: margin, width: inner, height: inner });
      pdf.save(`qr-studio-${Date.now()}.pdf`);
      return;
    }

    const blob = await svgToPngBlob(downloadQuality);
    if (!blob) return;

    if (downloadFormat === 'jpg') {
      const svgStr = new XMLSerializer().serializeToString(document.getElementById('qr-svg')!);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const size = downloadQuality;
      canvas.width = size; canvas.height = size;
      const url2 = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }));
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = design.bgColor || '#ffffff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((jpgBlob) => {
            if (jpgBlob) triggerDownload(jpgBlob, 'jpg');
            URL.revokeObjectURL(url2);
          }, 'image/jpeg', 0.95);
        }
      };
      img.src = url2;
    } else {
      triggerDownload(blob, 'png');
    }
  };

  const handleCopy = async () => {
    try {
      if (downloadFormat === 'svg') {
        // Copy Illustrator-safe SVG (embedded SVG logos converted to PNG)
        const svgStr = await prepareSvgForExport();
        if (!svgStr) return;
        await navigator.clipboard.writeText(svgStr);
      } else {
        // Copy as PNG bitmap
        const blob = await svgToPngBlob(1024);
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  const triggerDownload = (blob: Blob, ext: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `qr-studio-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreHistory = (entry: QRHistoryEntry) => {
    setContent(entry.content);
    setDesign(entry.design);
    setActiveMode('data');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => removeHistoryEntry(prev, id));
  };

  const handleClearHistory = () => {
    setHistory(clearAllHistory());
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F5F5F7] text-slate-900 font-sans flex flex-col lg:flex-row">

      {/* Left Studio Panel (Controls) */}
      <div className={`
        order-2 lg:order-1 flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/60
        flex flex-col relative z-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${activeMode === 'info' || activeMode === 'apps' || activeMode === 'history' ? 'w-full h-full absolute inset-0' : 'w-full lg:w-[35%] h-[55vh] lg:h-full'}
      `}>
        <ControlPanel
          content={content}
          setContent={setContent}
          design={design}
          setDesign={setDesign}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          onReset={handleReset}
          history={history}
          onSaveToHistory={saveCurrentToHistory}
          onRestoreHistory={handleRestoreHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
        />
      </div>

      {/* Right Studio Canvas (Preview) */}
      <div className={`
        order-1 lg:order-2 flex-col h-[45vh] lg:h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${activeMode === 'info' || activeMode === 'apps' || activeMode === 'history' ? 'hidden' : 'flex-1 relative flex'}
      `}>

        {/* Header - Minimal & Floating */}
        <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-10 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-9 h-9 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
              <Zap size={18} fill="currentColor" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-800 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40">
              GenAI QR Studio
            </h1>
          </div>
        </header>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-6 lg:p-12 overflow-hidden">

          {/* The Artboard Card */}
          <div className="
                relative group
                bg-white rounded-[40px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)]
                border border-white/60 backdrop-blur-xl
                flex items-center justify-center
                w-full max-w-[320px] lg:max-w-[480px] aspect-square flex-shrink-0
                transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.12)]
             ">
            <div className="w-full h-full p-8 lg:p-12">
              <QRRenderer
                value={content.value || 'https://google.com'}
                design={design}
                size={1000}
              />
            </div>

            {/* Premium Corner Accents */}
            <div className="absolute top-8 left-8 w-6 h-6 border-t-[3px] border-l-[3px] border-slate-100 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-8 right-8 w-6 h-6 border-t-[3px] border-r-[3px] border-slate-100 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-[3px] border-l-[3px] border-slate-100 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-[3px] border-r-[3px] border-slate-100 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Export Controls - Floating Pill */}
          <div className="absolute bottom-8 lg:bottom-12 z-20 w-full max-w-lg px-4">
            <div className="
                    flex items-center justify-between p-1.5 pl-2
                    bg-white/80 backdrop-blur-2xl border border-white/50
                    rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                    hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-all duration-300
                 ">

              {/* Format Selector */}
              <div className="flex items-center gap-1 pl-2">
                {(['png', 'jpg', 'svg', 'pdf'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setDownloadFormat(fmt)}
                    className={`
                                    px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full transition-all duration-200
                                    ${downloadFormat === fmt
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                                `}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-200 mx-2"></div>

              {/* Quality, Copy & Download */}
              <div className="flex items-center gap-2">
                {downloadFormat !== 'svg' && downloadFormat !== 'pdf' && (
                  <div className="relative">
                    <select
                      value={downloadQuality}
                      onChange={(e) => setDownloadQuality(Number(e.target.value))}
                      className="appearance-none bg-transparent pl-2 pr-6 py-1 text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:text-slate-900 transition-colors"
                    >
                      <option value={1024}>1K</option>
                      <option value={2048}>2K</option>
                      <option value={4096}>4K</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}

                {/* Copy to Clipboard — hidden for PDF */}
                {downloadFormat !== 'pdf' && (
                  <button
                    onClick={handleCopy}
                    className={`
                      flex items-center gap-1.5 px-3 py-2.5
                      rounded-full text-xs font-bold tracking-wide
                      transition-all active:scale-95
                      ${copied
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}
                    `}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied!' : downloadFormat === 'svg' ? 'Copy SVG' : 'Copy'}</span>
                  </button>
                )}

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="
                                flex items-center gap-2 px-5 py-2.5
                                bg-black hover:bg-slate-800 text-white
                                rounded-full text-xs font-bold tracking-wide
                                transition-all active:scale-95
                            "
                >
                  <Download size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
