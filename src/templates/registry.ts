import type { TemplateDefinition } from "@/lib/cv-types";
import { ClassicTemplate } from "./ClassicTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { MinimalTemplate } from "./MinimalTemplate";

/**
 * The single template registry read by the gallery, switcher, and preview.
 * Lives here (not in lib/constants) because templates import from constants —
 * keeping the registry separate avoids a circular import.
 */
export const TEMPLATES: TemplateDefinition[] = [
  { id: "classic", name: "Classic", component: ClassicTemplate, usesAccent: false },
  { id: "professional", name: "Professional", component: ProfessionalTemplate, usesAccent: true },
  { id: "modern", name: "Modern", component: ModernTemplate, usesAccent: true },
  { id: "elegant", name: "Elegant", component: ElegantTemplate, usesAccent: true },
  { id: "minimal", name: "Minimal", component: MinimalTemplate, usesAccent: true },
];
