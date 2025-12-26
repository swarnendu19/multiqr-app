export type QRType = 'url' | 'text' | 'wifi' | 'vcard';

export type CornerStyle = 'square' | 'rounded' | 'circle' | 'classy' | 'classy-rounded';
export type DotStyle = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded';

export interface GradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  color1: string;
  color2: string;
  rotation: number;
}

export interface FrameTemplate {
  id: string;
  name: string;
  type: 'none' | 'simple' | 'rounded' | 'label' | 'banner';
  labelText?: string;
  labelPosition?: 'top' | 'bottom';
  color?: string;
}

export interface QRContent {
  url?: string;
  text?: string;
  wifi?: {
    ssid: string;
    password: string;
    encryption: 'WPA' | 'WEP' | 'nopass';
    hidden?: boolean;
  };
  vcard?: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    website?: string;
    company?: string;
    title?: string;
  };
}

export interface QRDesign {
  foregroundColor: string;
  backgroundColor: string;
  gradient: GradientConfig;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  cornerDotStyle: CornerStyle;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number;
  frame: FrameTemplate;
}

export interface QRProject {
  id: string;
  user_id: string;
  name: string;
  qr_type: QRType;
  content: QRContent;
  design: QRDesign;
  canvas_data?: object;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export const defaultDesign: QRDesign = {
  foregroundColor: '#1a365d',
  backgroundColor: '#ffffff',
  gradient: {
    enabled: false,
    type: 'linear',
    color1: '#1a365d',
    color2: '#2dd4bf',
    rotation: 45,
  },
  dotStyle: 'square',
  cornerStyle: 'square',
  cornerDotStyle: 'square',
  errorCorrection: 'M',
  size: 300,
  frame: {
    id: 'none',
    name: 'None',
    type: 'none',
  },
};

export const frameTemplates: FrameTemplate[] = [
  { id: 'none', name: 'None', type: 'none' },
  { id: 'simple', name: 'Simple Border', type: 'simple', color: '#1a365d' },
  { id: 'rounded', name: 'Rounded Border', type: 'rounded', color: '#1a365d' },
  { id: 'scan-me-top', name: 'Scan Me (Top)', type: 'label', labelText: 'SCAN ME', labelPosition: 'top', color: '#1a365d' },
  { id: 'scan-me-bottom', name: 'Scan Me (Bottom)', type: 'label', labelText: 'SCAN ME', labelPosition: 'bottom', color: '#1a365d' },
  { id: 'banner', name: 'Banner', type: 'banner', labelText: 'SCAN TO VISIT', labelPosition: 'bottom', color: '#1a365d' },
];

export const qrTypeInfo: Record<QRType, { title: string; description: string; icon: string }> = {
  url: {
    title: 'URL',
    description: 'Link to any website or webpage',
    icon: 'Link',
  },
  text: {
    title: 'Plain Text',
    description: 'Display any text message',
    icon: 'Type',
  },
  wifi: {
    title: 'WiFi',
    description: 'Connect to WiFi network instantly',
    icon: 'Wifi',
  },
  vcard: {
    title: 'vCard',
    description: 'Share contact information',
    icon: 'User',
  },
};
