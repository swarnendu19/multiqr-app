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

export interface QRTemplate {
  id: string;
  name: string;
  category: 'business' | 'social' | 'marketing' | 'events' | 'personal';
  description: string;
  design: QRDesign;
}

export const qrTemplates: QRTemplate[] = [
  {
    id: 'classic-business',
    name: 'Classic Business',
    category: 'business',
    description: 'Clean and professional look for corporate use',
    design: {
      ...defaultDesign,
      foregroundColor: '#1a1a2e',
      backgroundColor: '#ffffff',
      dotStyle: 'square',
      cornerStyle: 'square',
    },
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    category: 'business',
    description: 'Sleek gradient design for tech companies',
    design: {
      ...defaultDesign,
      foregroundColor: '#667eea',
      backgroundColor: '#ffffff',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      gradient: {
        enabled: true,
        type: 'linear',
        color1: '#667eea',
        color2: '#764ba2',
        rotation: 135,
      },
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'personal',
    description: 'Cool blue tones for a refreshing look',
    design: {
      ...defaultDesign,
      foregroundColor: '#0077b6',
      backgroundColor: '#caf0f8',
      dotStyle: 'dots',
      cornerStyle: 'circle',
    },
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    category: 'social',
    description: 'Warm colors perfect for social media',
    design: {
      ...defaultDesign,
      foregroundColor: '#ff6b6b',
      backgroundColor: '#fff5f5',
      dotStyle: 'classy-rounded',
      cornerStyle: 'rounded',
      gradient: {
        enabled: true,
        type: 'linear',
        color1: '#ff6b6b',
        color2: '#feca57',
        rotation: 45,
      },
    },
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    category: 'marketing',
    description: 'Bold dark theme for maximum impact',
    design: {
      ...defaultDesign,
      foregroundColor: '#ffffff',
      backgroundColor: '#1a1a2e',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
    },
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    category: 'events',
    description: 'Vibrant neon style for nightlife events',
    design: {
      ...defaultDesign,
      foregroundColor: '#00ff88',
      backgroundColor: '#0d0d0d',
      dotStyle: 'dots',
      cornerStyle: 'circle',
      gradient: {
        enabled: true,
        type: 'linear',
        color1: '#00ff88',
        color2: '#00d4ff',
        rotation: 90,
      },
    },
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    category: 'business',
    description: 'Subtle and elegant for professional settings',
    design: {
      ...defaultDesign,
      foregroundColor: '#4a4a4a',
      backgroundColor: '#f8f9fa',
      dotStyle: 'square',
      cornerStyle: 'square',
    },
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    category: 'personal',
    description: 'Eco-friendly green theme',
    design: {
      ...defaultDesign,
      foregroundColor: '#2d6a4f',
      backgroundColor: '#d8f3dc',
      dotStyle: 'classy',
      cornerStyle: 'classy-rounded',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    category: 'marketing',
    description: 'Luxurious purple for premium brands',
    design: {
      ...defaultDesign,
      foregroundColor: '#7b2cbf',
      backgroundColor: '#f3e8ff',
      dotStyle: 'classy-rounded',
      cornerStyle: 'rounded',
      gradient: {
        enabled: true,
        type: 'linear',
        color1: '#7b2cbf',
        color2: '#c77dff',
        rotation: 180,
      },
    },
  },
  {
    id: 'event-party',
    name: 'Party Time',
    category: 'events',
    description: 'Fun and colorful for celebrations',
    design: {
      ...defaultDesign,
      foregroundColor: '#ff006e',
      backgroundColor: '#ffffff',
      dotStyle: 'dots',
      cornerStyle: 'circle',
      gradient: {
        enabled: true,
        type: 'radial',
        color1: '#ff006e',
        color2: '#8338ec',
        rotation: 0,
      },
    },
  },
  {
    id: 'instagram-style',
    name: 'Instagram Style',
    category: 'social',
    description: 'Instagram-inspired gradient design',
    design: {
      ...defaultDesign,
      foregroundColor: '#833ab4',
      backgroundColor: '#ffffff',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      gradient: {
        enabled: true,
        type: 'linear',
        color1: '#833ab4',
        color2: '#fd1d1d',
        rotation: 45,
      },
    },
  },
  {
    id: 'twitter-blue',
    name: 'Twitter Blue',
    category: 'social',
    description: 'Classic Twitter blue branding',
    design: {
      ...defaultDesign,
      foregroundColor: '#1da1f2',
      backgroundColor: '#ffffff',
      dotStyle: 'rounded',
      cornerStyle: 'circle',
    },
  },
];
