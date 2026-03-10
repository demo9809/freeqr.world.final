import React, { useMemo, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QRDesignState, QRModuleStyle, QREyeStyle, QRFrame } from '../types';
import { isFinderPattern, getFinderPatternPath, getModulePath } from '../services/qrUtils';

interface QRRendererProps {
    value: string;
    design: QRDesignState;
    size?: number; // Internal coordinate system size (viewBox), not display size
    id?: string; // for downloading
}

const QRRenderer: React.FC<QRRendererProps> = ({ value, design, size = 1000, id = "qr-svg" }) => {
    const [modules, setModules] = useState<boolean[][]>([]);
    const [matrixSize, setMatrixSize] = useState(0);

    // Determine effective design based on branding toggle
    const effectiveDesign = useMemo(() => {
        if (!design.isBranded) {
            // User request: If Branding is OFF, ONLY remove the logo.
            // Colors, shapes, and styles should remain active.
            return {
                ...design,
                logoUrl: null
            };
        }
        return design;
    }, [design]);

    useEffect(() => {
        try {
            const textToEncode = value || 'https://google.com';
            const qr = QRCode.create(textToEncode, {
                errorCorrectionLevel: 'H',
            });
            const qrSize = qr.modules.size;
            const data = qr.modules.data;
            const matrix: boolean[][] = [];
            for (let r = 0; r < qrSize; r++) {
                const row: boolean[] = [];
                for (let c = 0; c < qrSize; c++) {
                    row.push(!!data[r * qrSize + c]);
                }
                matrix.push(row);
            }
            setModules(matrix);
            setMatrixSize(qrSize);
        } catch (err) {
            console.error("QR Generation Error", err);
        }
    }, [value]);

    const cellSize = size / matrixSize;

    // Gradient coordinate computation
    const gradientCoords = useMemo(() => {
        if (!effectiveDesign.gradientEnabled) return null;
        const angle = effectiveDesign.gradientAngle ?? 135;
        const rad = (angle * Math.PI) / 180;
        const cx = size / 2, cy = size / 2;
        const len = size * 0.72;
        return {
            x1: cx - Math.cos(rad) * len,
            y1: cy - Math.sin(rad) * len,
            x2: cx + Math.cos(rad) * len,
            y2: cy + Math.sin(rad) * len,
        };
    }, [effectiveDesign.gradientEnabled, effectiveDesign.gradientAngle, size]);

    const moduleFill = effectiveDesign.gradientEnabled ? 'url(#qr-gradient)' : effectiveDesign.fgColor;
    const eyeFill = effectiveDesign.eyeColor || moduleFill;

    const { modulePath, finderPath } = useMemo(() => {
        if (!matrixSize) return { modulePath: '', finderPath: '' };

        let mp = '';
        let fp = '';

        // Calculate "Safe Zone" for Logo
        const hasLogo = !!effectiveDesign.logoUrl;
        // Convert logo size ratio (e.g., 0.2) to actual module count (e.g., 0.2 * 29 = 5.8 modules)
        const logoModules = hasLogo ? matrixSize * effectiveDesign.logoSize : 0;
        const center = matrixSize / 2;
        // Clean padding of 1.5 modules on all sides to ensure clear separation
        const padding = 1.5;
        const zoneMin = center - (logoModules / 2) - padding;
        const zoneMax = center + (logoModules / 2) + padding;

        const isInLogoZone = (r: number, c: number) => {
            if (!hasLogo) return false;
            return r >= zoneMin && r <= zoneMax && c >= zoneMin && c <= zoneMax;
        };

        for (let r = 0; r < matrixSize; r++) {
            for (let c = 0; c < matrixSize; c++) {
                if (modules[r][c]) {
                    if (isFinderPattern(r, c, matrixSize)) continue; // Already handled

                    // SKIP modules if they are inside the Logo Safe Zone
                    if (isInLogoZone(r, c)) continue;

                    mp += getModulePath(r, c, cellSize, effectiveDesign.moduleStyle);
                }
            }
        }

        fp += getFinderPatternPath(0, 0, cellSize, effectiveDesign.eyeStyle, matrixSize);
        fp += getFinderPatternPath(0, matrixSize - 7, cellSize, effectiveDesign.eyeStyle, matrixSize);
        fp += getFinderPatternPath(matrixSize - 7, 0, cellSize, effectiveDesign.eyeStyle, matrixSize);

        return { modulePath: mp, finderPath: fp };
    }, [modules, matrixSize, cellSize, effectiveDesign.moduleStyle, effectiveDesign.eyeStyle, effectiveDesign.logoUrl, effectiveDesign.logoSize]);

    // Dynamic ViewBox logic to handle tall frames
    const viewBoxHeight = useMemo(() => {
        switch (effectiveDesign.frame) {
            case QRFrame.BAG: return size * 1.3; // Needs space for handle
            case QRFrame.COFFEE: return size * 1.25; // Needs space for steam
            case QRFrame.BUBBLE_TOP: return size * 1.2; // Space for bubble
            case QRFrame.BALLOON_BOTTOM: return size * 1.2; // Increased height for text area below QR
            case QRFrame.FOCUS: return size * 1.1; // Slight padding
            default: return size;
        }
    }, [effectiveDesign.frame, size]);

    // Frame Render Logic
    const renderFrame = () => {
        if (effectiveDesign.frame === QRFrame.NONE) return null;

        const fc = effectiveDesign.frameColor || '#000000';
        const text = effectiveDesign.frameText || 'SCAN ME';
        const fs = size; // Base width unit

        switch (effectiveDesign.frame) {
            case QRFrame.BALLOON_BOTTOM:
                return (
                    <g>
                        {/* Speech Bubble Shape */}
                        <path
                            d={`M ${fs * 0.05},${fs * 0.05} h${fs * 0.9} a${fs * 0.05},${fs * 0.05} 0 0 1 ${fs * 0.05},${fs * 0.05} v${fs * 0.95} a${fs * 0.05},${fs * 0.05} 0 0 1 -${fs * 0.05},${fs * 0.05} h-${fs * 0.9} a${fs * 0.05},${fs * 0.05} 0 0 1 -${fs * 0.05},-${fs * 0.05} v-${fs * 0.95} a${fs * 0.05},${fs * 0.05} 0 0 1 ${fs * 0.05},-${fs * 0.05} z`}
                            fill={fc}
                        />
                        {/* Text Area at Bottom */}
                        <text x={fs / 2} y={fs * 1.02} textAnchor="middle" fill="white" fontSize={fs * 0.08} fontFamily="sans-serif" fontWeight="bold">{text}</text>

                        {/* Inner White Rect for QR Code */}
                        <rect x={fs * 0.1} y={fs * 0.1} width={fs * 0.8} height={fs * 0.8} fill="white" rx={fs * 0.02} />
                    </g>
                );
            case QRFrame.BOX_BOTTOM:
                return (
                    <g>
                        <rect x="0" y="0" width={fs} height={fs} rx={fs * 0.05} fill={fc} />
                        <rect x={fs * 0.05} y={fs * 0.05} width={fs * 0.9} height={fs * 0.75} rx={fs * 0.03} fill="white" />
                        <text x={fs / 2} y={fs * 0.92} textAnchor="middle" fill="white" fontSize={fs * 0.1} fontFamily="sans-serif" fontWeight="bold">{text}</text>
                    </g>
                );
            case QRFrame.SIMPLE_BOX:
                return (
                    <g>
                        <rect x={fs * 0.02} y={fs * 0.02} width={fs * 0.96} height={fs * 0.96} rx={fs * 0.05} fill="none" stroke={fc} strokeWidth={fs * 0.03} />
                    </g>
                );
            case QRFrame.TEXT_ONLY:
                return (
                    <g>
                        <text x={fs / 2} y={fs * 0.95} textAnchor="middle" fill={fc} fontSize={fs * 0.1} fontFamily="sans-serif" fontWeight="bold">{text}</text>
                    </g>
                );
            case QRFrame.POLAROID:
                return (
                    <g>
                        <rect x={fs * 0.02} y={fs * 0.02} width={fs * 0.96} height={fs * 0.96} fill="#fff" rx={fs * 0.02} stroke="#e2e8f0" strokeWidth={fs * 0.01} />
                        <text x={fs / 2} y={fs * 0.92} textAnchor="middle" fill="#334155" fontSize={fs * 0.09} fontFamily="Courier New, monospace" fontWeight="bold">{text}</text>
                        <rect x={fs * 0.1} y={fs * 0.1} width={fs * 0.8} height={fs * 0.75} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={fs * 0.005} />
                    </g>
                );
            case QRFrame.PHONE:
                return (
                    <g>
                        <rect x={fs * 0.15} y={fs * 0.02} width={fs * 0.7} height={fs * 0.96} rx={fs * 0.1} fill={fc} />
                        <rect x={fs * 0.18} y={fs * 0.08} width={fs * 0.64} height={fs * 0.8} fill="white" rx={fs * 0.02} />
                        <rect x={fs * 0.4} y={fs * 0.05} width={fs * 0.2} height={fs * 0.02} rx={fs * 0.01} fill="rgba(0,0,0,0.2)" />
                        <text x={fs / 2} y={fs * 0.95} textAnchor="middle" fill="white" fontSize={fs * 0.05} fontFamily="sans-serif" fontWeight="bold">{text}</text>
                    </g>
                );
            case QRFrame.FOCUS:
                const strokeW = fs * 0.04;
                return (
                    <g fill="none" stroke={fc} strokeWidth={strokeW} strokeLinecap="round">
                        <path d={`M ${fs * 0.05},${fs * 0.25} V ${fs * 0.05} H ${fs * 0.25}`} />
                        <path d={`M ${fs * 0.75},${fs * 0.05} H ${fs * 0.95} V ${fs * 0.25}`} />
                        <path d={`M ${fs * 0.05},${fs * 0.75} V ${fs * 0.95} H ${fs * 0.25}`} />
                        <path d={`M ${fs * 0.75},${fs * 0.95} H ${fs * 0.95} V ${fs * 0.75}`} />
                        <text x={fs / 2} y={fs * 1.08} textAnchor="middle" fill={fc} fontSize={fs * 0.06} fontFamily="sans-serif" fontWeight="bold" stroke="none">{text}</text>
                    </g>
                );
            case QRFrame.BADGE:
                return (
                    <g>
                        <circle cx={fs / 2} cy={fs / 2} r={fs * 0.48} fill="none" stroke={fc} strokeWidth={fs * 0.02} strokeDasharray={`${fs * 0.05} ${fs * 0.02}`} />
                        <circle cx={fs / 2} cy={fs / 2} r={fs * 0.42} fill="none" stroke={fc} strokeWidth={fs * 0.01} />
                        <path id="curve" d={`M ${fs * 0.2},${fs * 0.5} A ${fs * 0.3},${fs * 0.3} 0 0 1 ${fs * 0.8},${fs * 0.5}`} fill="none" />
                        <text fill={fc} fontSize={fs * 0.06} fontWeight="bold" textAnchor="middle">
                            <textPath href="#curve" startOffset="50%" textAnchor="middle">{text}</textPath>
                        </text>
                    </g>
                );
            case QRFrame.BAG:
                return (
                    <g>
                        {/* Handle */}
                        <path d={`M ${fs * 0.3},${fs * 0.25} v-${fs * 0.15} a${fs * 0.2},${fs * 0.2} 0 0 1 ${fs * 0.4},0 v${fs * 0.15}`} fill="none" stroke={fc} strokeWidth={fs * 0.08} strokeLinecap="round" />
                        {/* Bag Body */}
                        <path d={`M ${fs * 0.1},${fs * 0.25} h${fs * 0.8} a${fs * 0.05},${fs * 0.05} 0 0 1 ${fs * 0.05},${fs * 0.05} v${fs * 0.9} a${fs * 0.05},${fs * 0.05} 0 0 1 -${fs * 0.05},${fs * 0.05} h-${fs * 0.8} a${fs * 0.05},${fs * 0.05} 0 0 1 -${fs * 0.05},-${fs * 0.05} v-${fs * 0.9} a${fs * 0.05},${fs * 0.05} 0 0 1 ${fs * 0.05},-${fs * 0.05} z`} fill="white" stroke={fc} strokeWidth={fs * 0.04} />
                        {/* Bottom Strip */}
                        <path d={`M ${fs * 0.1},${fs * 0.95} h${fs * 0.8} a${fs * 0.05},${fs * 0.05} 0 0 1 ${fs * 0.05},${fs * 0.05} v${fs * 0.2} a${fs * 0.05},${fs * 0.05} 0 0 1 -${fs * 0.05},${fs * 0.05} h-${fs * 0.8} a${fs * 0.05},${fs * 0.05} 0 0 1 -${fs * 0.05},-${fs * 0.05} v-${fs * 0.2} a${fs * 0.05},${fs * 0.05} 0 0 1 ${fs * 0.05},-${fs * 0.05} z`} fill={fc} />
                        {/* Text */}
                        <text x={fs / 2} y={fs * 1.15} textAnchor="middle" fill="white" fontSize={fs * 0.08} fontFamily="sans-serif" fontWeight="bold">{text}</text>
                    </g>
                );
            case QRFrame.COFFEE:
                return (
                    <g>
                        {/* Steam */}
                        <path d={`M ${fs * 0.35},${fs * 0.15} q ${fs * 0.05},-${fs * 0.1} 0,-${fs * 0.15} m ${fs * 0.15},${fs * 0.15} q ${fs * 0.05},-${fs * 0.1} 0,-${fs * 0.15} m ${fs * 0.15},${fs * 0.15} q ${fs * 0.05},-${fs * 0.1} 0,-${fs * 0.15}`} fill="none" stroke={fc} strokeWidth={fs * 0.03} strokeLinecap="round" />
                        {/* Handle */}
                        <path d={`M ${fs * 0.85},${fs * 0.45} h${fs * 0.05} a${fs * 0.1},${fs * 0.1} 0 0 1 ${fs * 0.1},${fs * 0.1} v${fs * 0.2} a${fs * 0.1},${fs * 0.1} 0 0 1 -${fs * 0.1},${fs * 0.1} h-${fs * 0.05}`} fill="none" stroke={fc} strokeWidth={fs * 0.06} />
                        {/* Cup Body */}
                        <path d={`M ${fs * 0.15},${fs * 0.25} h${fs * 0.7} v${fs * 0.6} a${fs * 0.35},${fs * 0.35} 0 0 1 -${fs * 0.7},0 z`} fill="white" stroke={fc} strokeWidth={fs * 0.04} />
                        {/* Text Area */}
                        <text x={fs / 2} y={fs * 1.1} textAnchor="middle" fill={fc} fontSize={fs * 0.08} fontFamily="sans-serif" fontWeight="bold">{text}</text>
                    </g>
                );
            case QRFrame.BUBBLE_TOP:
                return (
                    <g>
                        {/* Bubble */}
                        <rect x={fs * 0.1} y={fs * 0.05} width={fs * 0.8} height={fs * 0.2} rx={fs * 0.05} fill={fc} />
                        {/* Tail */}
                        <path d={`M ${fs * 0.45},${fs * 0.25} l ${fs * 0.05},${fs * 0.1} l ${fs * 0.05},-${fs * 0.1} z`} fill={fc} />
                        {/* Text */}
                        <text x={fs / 2} y={fs * 0.18} textAnchor="middle" fill="white" fontSize={fs * 0.09} fontFamily="sans-serif" fontWeight="bold">{text}</text>
                        {/* Border around QR */}
                        <rect x={fs * 0.05} y={fs * 0.35} width={fs * 0.9} height={fs * 0.9} rx={fs * 0.05} fill="none" stroke={fc} strokeWidth={fs * 0.03} />
                    </g>
                );
            default: return null;
        }
    };

    // Calculate QR Transform based on Frame
    const qrTransform = useMemo(() => {
        if (effectiveDesign.frame === QRFrame.NONE) return { scale: 1, x: 0, y: 0 };

        // Adjusted transforms to fit perfectly inside custom path areas
        if (effectiveDesign.frame === QRFrame.BALLOON_BOTTOM) return { scale: 0.7, x: size * 0.15, y: size * 0.15 }; // Centered in the white box
        if (effectiveDesign.frame === QRFrame.BOX_BOTTOM) return { scale: 0.7, x: size * 0.15, y: size * 0.08 };
        if (effectiveDesign.frame === QRFrame.SIMPLE_BOX) return { scale: 0.8, x: size * 0.1, y: size * 0.1 };
        if (effectiveDesign.frame === QRFrame.TEXT_ONLY) return { scale: 0.8, x: size * 0.1, y: size * 0.05 };

        if (effectiveDesign.frame === QRFrame.POLAROID) return { scale: 0.7, x: size * 0.15, y: size * 0.12 };
        if (effectiveDesign.frame === QRFrame.PHONE) return { scale: 0.55, x: size * 0.225, y: size * 0.2 };
        if (effectiveDesign.frame === QRFrame.FOCUS) return { scale: 0.8, x: size * 0.1, y: size * 0.1 };
        if (effectiveDesign.frame === QRFrame.BADGE) return { scale: 0.55, x: size * 0.225, y: size * 0.225 };

        // New Frames
        if (effectiveDesign.frame === QRFrame.BAG) return { scale: 0.55, x: size * 0.225, y: size * 0.35 }; // Shifted down for handle
        if (effectiveDesign.frame === QRFrame.COFFEE) return { scale: 0.45, x: size * 0.275, y: size * 0.35 }; // Small inside cup
        if (effectiveDesign.frame === QRFrame.BUBBLE_TOP) return { scale: 0.75, x: size * 0.125, y: size * 0.42 }; // Below bubble

        return { scale: 1, x: 0, y: 0 };
    }, [effectiveDesign.frame, size]);


    if (!matrixSize) return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
            <span className="text-xs font-medium tracking-wide uppercase">Generating...</span>
        </div>
    );

    const logoPosRaw = size * (0.5 - effectiveDesign.logoSize / 2);

    return (
        <div className="relative group w-full h-full flex items-center justify-center">
            <svg
                id={id}
                width="100%"
                height="100%"
                viewBox={`0 0 ${size} ${viewBoxHeight}`}
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
                fillRule="evenodd"
                className="max-w-full max-h-full block"
            >
                {/* Gradient Definition */}
                {gradientCoords && (
                    <defs>
                        <linearGradient
                            id="qr-gradient"
                            gradientUnits="userSpaceOnUse"
                            x1={gradientCoords.x1}
                            y1={gradientCoords.y1}
                            x2={gradientCoords.x2}
                            y2={gradientCoords.y2}
                        >
                            <stop offset="0%" stopColor={effectiveDesign.fgColor} />
                            <stop offset="100%" stopColor={effectiveDesign.gradientColor2 || '#6366f1'} />
                        </linearGradient>
                    </defs>
                )}

                {/* Render Frame Background Elements First */}
                {renderFrame()}

                {/* Render QR Code Group (Scaled & Positioned) */}
                <g transform={`translate(${qrTransform.x}, ${qrTransform.y}) scale(${qrTransform.scale})`}>
                    {/* Background for QR area if frame doesn't provide it */}
                    {effectiveDesign.frame === QRFrame.NONE && <rect width={size} height={size} fill={effectiveDesign.bgColor} rx={size * 0.03} />}

                    {/* Explicit white background layer for Badge/Focus/Bag/etc */}
                    {(effectiveDesign.frame === QRFrame.BADGE || effectiveDesign.frame === QRFrame.FOCUS || effectiveDesign.frame === QRFrame.BAG || effectiveDesign.frame === QRFrame.COFFEE) && (
                        <rect width={size} height={size} fill="#ffffff" rx={size * 0.02} />
                    )}

                    {/* Data Modules */}
                    <path d={modulePath} fill={moduleFill} />

                    {/* Finder Patterns (Eyes) — optionally a separate color */}
                    <path d={finderPath} fill={eyeFill} />

                    {/* Logo Overlay */}
                    {effectiveDesign.logoUrl && (
                        <image
                            x={logoPosRaw}
                            y={logoPosRaw}
                            width={size * effectiveDesign.logoSize}
                            height={size * effectiveDesign.logoSize}
                            href={effectiveDesign.logoUrl}
                            preserveAspectRatio="xMidYMid meet"
                        />
                    )}
                </g>
            </svg>
        </div>
    );
};

export default QRRenderer;