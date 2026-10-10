import type { Content, Locale } from "@/types/content";
import { en } from "./en";
import { pt } from "./pt";

export const content: Record<Locale, Content> = { pt, en };

export function getContent(locale: Locale): Content {
  return content[locale];
}
