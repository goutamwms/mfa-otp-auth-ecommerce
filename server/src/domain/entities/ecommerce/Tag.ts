import { LocalizedText } from './Translation';

export interface Tag {
  id: number;
  slug: string;
  name: LocalizedText;
  createdAt: Date;
}

export function createTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
