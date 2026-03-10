import { QRModuleStyle, QREyeStyle } from '../types';

export const isFinderPattern = (row: number, col: number, matrixSize: number): boolean => {
  // Top Left
  if (row < 7 && col < 7) return true;
  // Top Right
  if (row < 7 && col >= matrixSize - 7) return true;
  // Bottom Left
  if (row >= matrixSize - 7 && col < 7) return true;
  return false;
};

export const getFinderPatternPath = (
  startRow: number, 
  startCol: number, 
  cellSize: number, 
  style: QREyeStyle,
  matrixSize: number
): string => {
  const x = startCol * cellSize;
  const y = startRow * cellSize;
  const size = 7 * cellSize;
  
  // Common Inner Dot (3x3 modules) - centered in the 7x7 box
  const innerX = x + 2 * cellSize;
  const innerY = y + 2 * cellSize;
  const innerSize = 3 * cellSize;

  if (style === QREyeStyle.CIRCLE) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const outerR = size / 2; 
    const innerCutoutR = outerR - cellSize; 
    const dotR = innerSize / 2; 

    const ring = `M ${cx}, ${cy} m -${outerR}, 0 a ${outerR},${outerR} 0 1,0 ${outerR * 2},0 a ${outerR},${outerR} 0 1,0 -${outerR * 2},0 ` +
                 `M ${cx}, ${cy} m -${innerCutoutR}, 0 a ${innerCutoutR},${innerCutoutR} 0 1,1 ${innerCutoutR * 2},0 a ${innerCutoutR},${innerCutoutR} 0 1,1 -${innerCutoutR * 2},0`;
    const dot = `M ${cx}, ${cy} m -${dotR}, 0 a ${dotR},${dotR} 0 1,0 ${dotR * 2},0 a ${dotR},${dotR} 0 1,0 -${dotR * 2},0`;
    return ring + " " + dot;
  } 
  
  if (style === QREyeStyle.LEAF) {
    // Natural Home Style: Diagonal points.
    const r = 2.5 * cellSize; // Radius for rounded corners
    
    const outer = `
      M ${x},${y} 
      L ${x + size - r},${y} 
      A ${r},${r} 0 0 1 ${x + size},${y + r} 
      L ${x + size},${y + size} 
      L ${x + r},${y + size} 
      A ${r},${r} 0 0 1 ${x},${y + size - r} 
      Z
    `;

    // Inner Hole (simulating stroke) - 1 cell thick
    const hX = x + cellSize;
    const hY = y + cellSize;
    const hSize = 5 * cellSize;
    const hR = 1.5 * cellSize; 

    const hole = `
      M ${hX},${hY}
      L ${hX},${hY + hSize - hR}
      A ${hR},${hR} 0 0 0 ${hX + hR},${hY + hSize}
      L ${hX + hSize},${hY + hSize}
      L ${hX + hSize},${hY + hR}
      A ${hR},${hR} 0 0 0 ${hX + hSize - hR},${hY}
      Z
    `;

    // Inner Dot (Solid Square)
    const inner = `M ${innerX},${innerY} h${innerSize} v${innerSize} h-${innerSize} Z`;
    
    return outer + " " + hole + " " + inner;
  }

  // Default SQUARE
  const outer = `M ${x},${y} h${size} v${size} h-${size} Z`;
  const hole = `M ${x+cellSize},${y+cellSize} v${5*cellSize} h${5*cellSize} v-${5*cellSize} Z`;
  const inner = `M ${innerX},${innerY} h${innerSize} v${innerSize} h-${innerSize} Z`;
  
  return outer + " " + hole + " " + inner;
};

export const getModulePath = (row: number, col: number, cellSize: number, style: QRModuleStyle): string => {
  const x = col * cellSize;
  const y = row * cellSize;
  const size = cellSize;

  switch (style) {
    case QRModuleStyle.DOTS:
      const r = (size * 0.85) / 2; 
      const cx = x + size / 2;
      const cy = y + size / 2;
      return `M ${cx}, ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;

    case QRModuleStyle.ROUNDED:
       const pad = size * 0.1;
       const s = size - pad * 2;
       const rx = s * 0.35;
       return `M ${x+pad+rx},${y+pad} h${s-2*rx} a${rx},${rx} 0 0 1 ${rx},${rx} v${s-2*rx} a${rx},${rx} 0 0 1 -${rx},${rx} h-${s-2*rx} a${rx},${rx} 0 0 1 -${rx},-${rx} v-${s-2*rx} a${rx},${rx} 0 0 1 ${rx},-${rx} z`;

    case QRModuleStyle.DIAMOND:
      return `M ${x + size/2}, ${y} L ${x + size}, ${y + size/2} L ${x + size/2}, ${y + size} L ${x}, ${y + size/2} Z`;

    case QRModuleStyle.SQUARE:
    default:
      return `M ${x} ${y} h ${size} v ${size} h -${size} Z`;
  }
};