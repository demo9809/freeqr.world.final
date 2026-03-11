
export enum QRContentType {
  URL = 'URL',
  TEXT = 'TEXT',
  WIFI = 'WIFI',
  EMAIL = 'EMAIL',
  VCARD = 'VCARD',
  PHONE = 'PHONE',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  EVENT = 'EVENT',
  GEO = 'GEO',
  UPI = 'UPI',
  PAYPAL = 'PAYPAL',
  CRYPTO = 'CRYPTO',
  SOCIAL = 'SOCIAL',
  APP_STORE = 'APP_STORE',
  PLAY_STORE = 'PLAY_STORE',
  BARCODE_QR = 'BARCODE_QR'
}

export enum QRModuleStyle {
  SQUARE = 'square',
  DOTS = 'dots',
  ROUNDED = 'rounded',
  DIAMOND = 'diamond'
}

export enum QREyeStyle {
  SQUARE = 'square',
  CIRCLE = 'circle',
  LEAF = 'leaf' // Renamed conceptually to the "Natural/Organic" style requested
}

export enum QRFrame {
  NONE = 'NONE',
  BALLOON_BOTTOM = 'BALLOON_BOTTOM',
  BOX_BOTTOM = 'BOX_BOTTOM',
  SIMPLE_BOX = 'SIMPLE_BOX',
  TEXT_ONLY = 'TEXT_ONLY',
  POLAROID = 'POLAROID',
  PHONE = 'PHONE',
  FOCUS = 'FOCUS',
  BADGE = 'BADGE',
  // New Styles
  BAG = 'BAG',
  COFFEE = 'COFFEE',
  BUBBLE_TOP = 'BUBBLE_TOP'
}

export type PanelMode = 'data' | 'design' | 'frame' | 'info' | 'apps' | 'history';

export interface QRDesignState {
  isBranded: boolean;
  fgColor: string;
  bgColor: string;
  moduleStyle: QRModuleStyle;
  eyeStyle: QREyeStyle;
  logoUrl: string | null;
  logoSize: number; // 0.1 to 0.4

  // Eye/Corner color (optional — falls back to fgColor)
  eyeColor?: string;

  // Gradient (optional)
  gradientEnabled?: boolean;
  gradientColor2?: string;
  gradientAngle?: number; // degrees: 0, 45, 90, 135

  // Frame Settings
  frame: QRFrame;
  frameText: string;
  frameColor: string;
}

export interface QRContentState {
  type: QRContentType;
  value: string; // The final string encoded in the QR

  // Form state persistence
  wifi?: { ssid: string; pass: string; encryption: 'WPA' | 'WEP' | 'nopass' };
  email?: { to: string; subject: string; body: string };
  vcard?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    org: string;
    title: string;
    url: string;
    street: string;
    city: string;
    country: string;
  };
  phone?: string;
  sms?: { phone: string; message: string };
  whatsapp?: { phone: string; message: string };
  telegram?: string;
  event?: { title: string; location: string; start: string; end: string; notes: string };
  geo?: { lat: string; lng: string; url: string; mode: 'url' | 'coords' };
  upi?: { id: string; name: string; amount: string; note: string };
  paypal?: { email: string; amount: string; currency: string; note: string };
  crypto?: { coin: 'bitcoin' | 'ethereum' | 'other'; address: string; amount: string };
  social?: { platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube'; handle: string };
  appStore?: { iosUrl: string; androidUrl: string; fallbackUrl: string; activeTab: 'ios' | 'android' };
  // Barcode QR — encodes a URL that renders a barcode when scanned
  barcodeQR?: { data: string; format: string; };
}

export interface QRHistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  contentType: QRContentType;
  qrValue: string;
  content: QRContentState;
  design: QRDesignState;
}