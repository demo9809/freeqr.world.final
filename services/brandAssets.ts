
import { QRModuleStyle, QREyeStyle, QRDesignState, QRContentType } from '../types';

const createSvgDataUri = (svgContent: string) => `data:image/svg+xml;base64,${btoa(svgContent)}`;

const LOGOS = {
  // ── Messaging ──────────────────────────────────────────────────────────────
  WHATSAPP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,

  TELEGRAM: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#229ED9" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>`,

  SMS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#6366f1" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z"/></svg>`,

  // ── Social ──────────────────────────────────────────────────────────────────
  FACEBOOK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,

  TWITTER: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,

  INSTAGRAM: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E1306C"/><path fill="#ffffff" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,

  LINKEDIN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0A66C2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,

  YOUTUBE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,

  // ── Utilities ───────────────────────────────────────────────────────────────
  GOOGLE_MAPS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#34A853" d="M12 0C7.053 0 3.053 4 3.053 8.947c0 5.263 7.368 14.211 8.052 15.053.421.421.843.421 1.264 0 .684-.842 8.052-9.79 8.052-15.053C20.947 4 16.947 0 12 0zm0 13.263c-2.368 0-4.316-1.947-4.316-4.316 0-2.368 1.948-4.316 4.316-4.316 2.368 0 4.316 1.948 4.316 4.316 0 2.369-1.948 4.316-4.316 4.316z"/></svg>`,

  WIFI: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0ea5e9" d="M12 3c4.284 0 8.222 1.497 11.31 3.996.476.386.546 1.075.16 1.552-.387.477-1.075.547-1.552.16C19.332 6.617 15.816 5.25 12 5.25c-3.816 0-7.332 1.367-9.918 3.458-.477.387-1.165.317-1.552-.16-.386-.477-.316-1.166.16-1.552C3.778 4.497 7.716 3 12 3zm0 6c3.071 0 5.905.985 8.226 2.664.496.359.607 1.053.248 1.55-.359.496-1.053.606-1.55.248-1.843-1.333-4.094-2.115-6.524-2.115-2.43 0-4.681.782-6.524 2.115-.497.358-1.191.248-1.55-.248-.359-.497-.248-1.191.248-1.55C7.095 9.985 9.929 9 12 9zm0 6c1.739 0 3.337.563 4.641 1.518.514.376.619 1.091.244 1.604-.375.514-1.091.619-1.604.244-.899-.658-2.001-1.046-3.2-1.046s-2.301.388-3.201 1.046c-.512.375-1.228.27-1.603-.244-.376-.513-.271-1.228.243-1.604C8.663 15.563 10.261 15 12 15z"/></svg>`,

  EMAIL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f97316" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,

  PHONE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#10b981" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,

  GENERIC_LINK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#334155" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,

  TEXT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#64748b" d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>`,

  VCARD: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0A66C2" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`,

  EVENT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#7c3aed" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,

  UPI: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#097939" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>`,

  PAYPAL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#009CDE" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>`,

  BITCOIN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#F7931A" d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/></svg>`,

  APP_STORE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#007AFF" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,

  SOCIAL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#6366f1" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>`,

  // ── Play Store ───────────────────────────────────────────────────────────────
  PLAY_STORE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#34A853" d="M3.18 23.76c.38.21.84.22 1.24.02L19.1 13.5c.36-.2.59-.58.59-.99s-.23-.79-.59-1L4.42.24C4.02.03 3.56.04 3.18.25A1.17 1.17 0 0 0 2.57 1.3v21.4c0 .44.23.84.61 1.06z"/></svg>`,

  // ── Barcode QR ──────────────────────────────────────────────────────────────
  BARCODE_QR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="1" y="3" width="2" height="18" fill="#1e293b"/><rect x="4" y="3" width="1" height="18" fill="#1e293b"/><rect x="6" y="3" width="3" height="18" fill="#1e293b"/><rect x="10" y="3" width="1" height="18" fill="#1e293b"/><rect x="12" y="3" width="2" height="18" fill="#1e293b"/><rect x="15" y="3" width="1" height="18" fill="#1e293b"/><rect x="17" y="3" width="3" height="18" fill="#1e293b"/><rect x="21" y="3" width="2" height="18" fill="#1e293b"/></svg>`,
};

interface BrandConfig {
  fgColor: string;
  bgColor: string;
  logoUrl: string;
  eyeStyle: QREyeStyle;
  moduleStyle: QRModuleStyle;
}

const DEFAULT_STYLE: BrandConfig = {
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  logoUrl: '',
  eyeStyle: QREyeStyle.SQUARE,
  moduleStyle: QRModuleStyle.ROUNDED
};

export const getBrandConfig = (type: QRContentType, subType?: string): BrandConfig => {
  // 1. Social platform subtypes
  if (type === QRContentType.SOCIAL && subType) {
    switch (subType) {
      case 'whatsapp': return { ...DEFAULT_STYLE, fgColor: '#25D366', eyeStyle: QREyeStyle.CIRCLE, logoUrl: createSvgDataUri(LOGOS.WHATSAPP) };
      case 'facebook': return { ...DEFAULT_STYLE, fgColor: '#1877F2', eyeStyle: QREyeStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.FACEBOOK) };
      case 'twitter': return { ...DEFAULT_STYLE, fgColor: '#000000', eyeStyle: QREyeStyle.CIRCLE, logoUrl: createSvgDataUri(LOGOS.TWITTER) };
      case 'instagram': return { ...DEFAULT_STYLE, fgColor: '#E1306C', eyeStyle: QREyeStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.INSTAGRAM) };
      case 'linkedin': return { ...DEFAULT_STYLE, fgColor: '#0A66C2', eyeStyle: QREyeStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.LINKEDIN) };
      case 'youtube': return { ...DEFAULT_STYLE, fgColor: '#FF0000', eyeStyle: QREyeStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.YOUTUBE) };
    }
  }

  // 2. All top-level types
  switch (type) {
    case QRContentType.URL:
      return { ...DEFAULT_STYLE, fgColor: '#0f172a', moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.GENERIC_LINK) };

    case QRContentType.TEXT:
      return { ...DEFAULT_STYLE, fgColor: '#475569', eyeStyle: QREyeStyle.SQUARE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.TEXT) };

    case QRContentType.WIFI:
      return { ...DEFAULT_STYLE, fgColor: '#0ea5e9', eyeStyle: QREyeStyle.CIRCLE, moduleStyle: QRModuleStyle.DOTS, logoUrl: createSvgDataUri(LOGOS.WIFI) };

    case QRContentType.EMAIL:
      return { ...DEFAULT_STYLE, fgColor: '#f97316', eyeStyle: QREyeStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.EMAIL) };

    case QRContentType.VCARD:
      return { ...DEFAULT_STYLE, fgColor: '#0A66C2', eyeStyle: QREyeStyle.SQUARE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.VCARD) };

    case QRContentType.PHONE:
      return { ...DEFAULT_STYLE, fgColor: '#10b981', eyeStyle: QREyeStyle.CIRCLE, logoUrl: createSvgDataUri(LOGOS.PHONE) };

    case QRContentType.SMS:
      return { ...DEFAULT_STYLE, fgColor: '#6366f1', eyeStyle: QREyeStyle.ROUNDED, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.SMS) };

    case QRContentType.WHATSAPP:
      return { ...DEFAULT_STYLE, fgColor: '#25D366', eyeStyle: QREyeStyle.CIRCLE, logoUrl: createSvgDataUri(LOGOS.WHATSAPP) };

    case QRContentType.TELEGRAM:
      return { ...DEFAULT_STYLE, fgColor: '#229ED9', eyeStyle: QREyeStyle.CIRCLE, moduleStyle: QRModuleStyle.DOTS, logoUrl: createSvgDataUri(LOGOS.TELEGRAM) };

    case QRContentType.EVENT:
      return { ...DEFAULT_STYLE, fgColor: '#7c3aed', eyeStyle: QREyeStyle.SQUARE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.EVENT) };

    case QRContentType.GEO:
      return { ...DEFAULT_STYLE, fgColor: '#16a34a', eyeStyle: QREyeStyle.LEAF, logoUrl: createSvgDataUri(LOGOS.GOOGLE_MAPS) };

    case QRContentType.UPI:
      return { ...DEFAULT_STYLE, fgColor: '#097939', eyeStyle: QREyeStyle.SQUARE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.UPI) };

    case QRContentType.PAYPAL:
      return { ...DEFAULT_STYLE, fgColor: '#003087', bgColor: '#ffffff', eyeStyle: QREyeStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.PAYPAL) };

    case QRContentType.CRYPTO:
      return { ...DEFAULT_STYLE, fgColor: '#F7931A', eyeStyle: QREyeStyle.SQUARE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.BITCOIN) };

    case QRContentType.SOCIAL:
      return { ...DEFAULT_STYLE, fgColor: '#6366f1', eyeStyle: QREyeStyle.CIRCLE, moduleStyle: QRModuleStyle.DOTS, logoUrl: createSvgDataUri(LOGOS.SOCIAL) };

    case QRContentType.APP_STORE:
      return { ...DEFAULT_STYLE, fgColor: '#007AFF', eyeStyle: QREyeStyle.CIRCLE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.APP_STORE) };

    case QRContentType.PLAY_STORE:
      return { ...DEFAULT_STYLE, fgColor: '#34A853', bgColor: '#ffffff', eyeStyle: QREyeStyle.CIRCLE, moduleStyle: QRModuleStyle.ROUNDED, logoUrl: createSvgDataUri(LOGOS.PLAY_STORE) };

    case QRContentType.BARCODE_QR:
      return { ...DEFAULT_STYLE, fgColor: '#1e293b', bgColor: '#ffffff', eyeStyle: QREyeStyle.SQUARE, moduleStyle: QRModuleStyle.SQUARE, logoUrl: createSvgDataUri(LOGOS.BARCODE_QR) };

    default:
      return DEFAULT_STYLE;
  }
};
