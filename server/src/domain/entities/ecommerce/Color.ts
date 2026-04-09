import { LocalizedText } from './Translation';

export interface Color {
  id: number;
  name: LocalizedText;
  code: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductColor {
  id: number;
  colorId: number;
  color?: Color;
  priceModifier: number;
}

export function createColorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
