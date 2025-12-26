import QRCodeStyling, { 
  DotType, 
  CornerSquareType, 
  CornerDotType,
  GradientType
} from 'qr-code-styling';
import { QRContent, QRDesign, QRType, DotStyle, CornerStyle } from '@/types/qr';

export function generateQRContent(type: QRType, content: QRContent): string {
  switch (type) {
    case 'url':
      return content.url || 'https://example.com';
    
    case 'text':
      return content.text || 'Hello World';
    
    case 'wifi':
      if (content.wifi) {
        const { ssid, password, encryption, hidden } = content.wifi;
        return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
      }
      return 'WIFI:T:WPA;S:Network;P:password;;';
    
    case 'vcard':
      if (content.vcard) {
        const { firstName, lastName, phone, email, website, company, title } = content.vcard;
        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${lastName};${firstName};;;`,
          `FN:${firstName} ${lastName}`,
        ];
        if (company) lines.push(`ORG:${company}`);
        if (title) lines.push(`TITLE:${title}`);
        if (phone) lines.push(`TEL:${phone}`);
        if (email) lines.push(`EMAIL:${email}`);
        if (website) lines.push(`URL:${website}`);
        lines.push('END:VCARD');
        return lines.join('\n');
      }
      return 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD';
    
    default:
      return 'https://example.com';
  }
}

function mapDotStyle(style: DotStyle): DotType {
  const map: Record<DotStyle, DotType> = {
    'square': 'square',
    'dots': 'dots',
    'rounded': 'rounded',
    'classy': 'classy',
    'classy-rounded': 'classy-rounded',
  };
  return map[style] || 'square';
}

function mapCornerStyle(style: CornerStyle): CornerSquareType {
  const map: Record<CornerStyle, CornerSquareType> = {
    'square': 'square',
    'rounded': 'extra-rounded',
    'circle': 'dot',
    'classy': 'square',
    'classy-rounded': 'extra-rounded',
  };
  return map[style] || 'square';
}

function mapCornerDotStyle(style: CornerStyle): CornerDotType {
  const map: Record<CornerStyle, CornerDotType> = {
    'square': 'square',
    'rounded': 'square',
    'circle': 'dot',
    'classy': 'square',
    'classy-rounded': 'dot',
  };
  return map[style] || 'square';
}

export function createQRCodeStyling(
  type: QRType,
  content: QRContent,
  design: QRDesign
): QRCodeStyling {
  const qrContent = generateQRContent(type, content);
  
  const dotsOptions: {
    type: DotType;
    color?: string;
    gradient?: {
      type: GradientType;
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  } = {
    type: mapDotStyle(design.dotStyle),
  };

  if (design.gradient.enabled) {
    dotsOptions.gradient = {
      type: design.gradient.type as GradientType,
      rotation: design.gradient.rotation * (Math.PI / 180),
      colorStops: [
        { offset: 0, color: design.gradient.color1 },
        { offset: 1, color: design.gradient.color2 },
      ],
    };
  } else {
    dotsOptions.color = design.foregroundColor;
  }

  const qrCode = new QRCodeStyling({
    width: design.size,
    height: design.size,
    type: 'canvas',
    data: qrContent,
    dotsOptions,
    cornersSquareOptions: {
      type: mapCornerStyle(design.cornerStyle),
      color: design.gradient.enabled ? design.gradient.color1 : design.foregroundColor,
    },
    cornersDotOptions: {
      type: mapCornerDotStyle(design.cornerDotStyle),
      color: design.gradient.enabled ? design.gradient.color2 : design.foregroundColor,
    },
    backgroundOptions: {
      color: design.backgroundColor,
    },
    qrOptions: {
      errorCorrectionLevel: design.errorCorrection,
    },
  });

  return qrCode;
}

export async function generateQRDataURL(
  type: QRType,
  content: QRContent,
  design: QRDesign
): Promise<string> {
  try {
    const qrCode = createQRCodeStyling(type, content, design);
    const rawData = await qrCode.getRawData('png');
    
    if (!rawData) return '';
    
    // Handle both Blob and Buffer types
    let blob: Blob;
    if (rawData instanceof Blob) {
      blob = rawData;
    } else {
      // For Node.js Buffer, convert to Uint8Array first
      const uint8Array = new Uint8Array(rawData);
      blob = new Blob([uint8Array]);
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export async function generateQRSVG(
  type: QRType,
  content: QRContent,
  design: QRDesign
): Promise<string> {
  try {
    const qrCode = createQRCodeStyling(type, content, design);
    const rawData = await qrCode.getRawData('svg');
    
    if (!rawData) return '';
    
    // Handle both Blob and Buffer types
    if (rawData instanceof Blob) {
      return await rawData.text();
    }
    return rawData.toString();
  } catch (error) {
    console.error('Error generating QR SVG:', error);
    return '';
  }
}
