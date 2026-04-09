export type SupportedLanguage = 'en' | 'fr';

export interface LocalizedText {
  en: string;
  fr: string;
}

export interface Translation {
  [key: string]: LocalizedText;
}

export function createTranslation(en: string, fr: string): LocalizedText {
  return { en, fr };
}

export function getTranslation(translated: LocalizedText | string | undefined, lang: SupportedLanguage): string {
  if (!translated) return '';
  if (typeof translated === 'string') return translated;
  return translated[lang] || translated.en || '';
}

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return lang === 'en' || lang === 'fr';
}
