import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderKanban,
  History,
  Sparkles,
  Mail,
  Terminal,
} from "lucide-react";
import { ResumeWindow } from "../windows/Resume";
import { ProjectsWindow } from "../windows/Projects";
import { ExperienceWindow } from "../windows/Experience";
import { SkillsWindow } from "../windows/Skills";
import { ContactWindow } from "../windows/Contact";
import { DeveloperNotesWindow } from "../windows/DeveloperNotes";

/**
 * Ogni voce rappresenta una finestra dell'app.
 * `component` è il contenuto reale renderizzato dentro la <Window> generica
 * (vedi WindowManager.tsx). In Fase 3 sono ancora placeholder tipizzati;
 * verranno riempiti di contenuto vero nella Fase 4.
 */
export interface WindowConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  component: ComponentType;
  /**
   * Posizione iniziale fissa, opzionale. Se omessa (caso comune) la finestra
   * viene centrata automaticamente all'apertura, in base alla sua altezza
   * reale (vedi CENTER_ON_OPEN in WindowManagerContext.tsx).
   */
  defaultPosition?: { x: number; y: number };
  /** true = presente anche nel dock, non solo come icona desktop */
  inDock?: boolean;
  /** Larghezza personalizzata della finestra */
  width?: number;
  /** true = mostra il pulsante schermo intero nella titlebar (solo desktop) */
  allowMaximize?: boolean;
}

export const windowsConfig: WindowConfig[] = [
  {
    id: "resume",
    title: "Resume",
    icon: FileText,
    component: ResumeWindow,
    inDock: true,
    width: 680,
    allowMaximize: true,
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
    component: ProjectsWindow,
    inDock: true,
    width: 620,
  },
  {
    id: "experience",
    title: "Experience",
    icon: History,
    component: ExperienceWindow,
    inDock: true,
    width: 580,
  },
  {
    id: "skills",
    title: "Skills",
    icon: Sparkles,
    component: SkillsWindow,
    inDock: true,
    width: 540,
  },
  {
    id: "contact",
    title: "Contact",
    icon: Mail,
    component: ContactWindow,
    inDock: true,
    width: 420,
  },
  {
    id: "developer-notes",
    title: "Developer Notes",
    icon: Terminal,
    component: DeveloperNotesWindow,
    inDock: false,
    width: 520,
  },
];
