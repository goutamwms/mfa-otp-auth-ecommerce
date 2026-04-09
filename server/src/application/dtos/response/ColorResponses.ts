import { Color } from '../../../domain/entities/ecommerce';
import { getTranslation, SupportedLanguage } from '../../../domain/entities/ecommerce/Translation';

export interface ColorResponse {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface ColorListResponse {
  colors: ColorResponse[];
}

export function toColorResponse(color: Color, lang: SupportedLanguage = 'en'): ColorResponse {
  return {
    id: color.id,
    name: getTranslation(color.name, lang),
    code: color.code,
    isActive: color.isActive,
    createdAt: color.createdAt.toISOString(),
  };
}

export function toColorListResponse(colors: Color[], lang: SupportedLanguage = 'en'): ColorListResponse {
  return {
    colors: colors.map(c => toColorResponse(c, lang)),
  };
}
