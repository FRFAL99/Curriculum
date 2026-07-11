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
  /** Posizione iniziale suggerita per la finestra */
  defaultPosition: { x: number; y: number };
  /** true = presente anche nel dock, non solo come icona desktop */
  inDock?: boolean;
  /** Larghezza personalizzata della finestra */
  width?: number;
}

export const windowsConfig: WindowConfig[] = [
  {
    id: "resume",
    title: "Resume",
    icon: FileText,
    component: ResumeWindow,
    defaultPosition: { x: 40, y: 60 },
    inDock: true,
    width: 680,
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
    component: ProjectsWindow,
    defaultPosition: { x: 100, y: 100 },
    inDock: true,
    width: 620,
  },
  {
    id: "experience",
    title: "Experience",
    icon: History,
    component: ExperienceWindow,
    defaultPosition: { x: 160, y: 140 },
    inDock: true,
    width: 580,
  },
  {
    id: "skills",
    title: "Skills",
    icon: Sparkles,
    component: SkillsWindow,
    defaultPosition: { x: 220, y: 180 },
    inDock: true,
    width: 540,
  },
  {
    id: "contact",
    title: "Contact",
    icon: Mail,
    component: ContactWindow,
    defaultPosition: { x: 280, y: 220 },
    inDock: true,
    width: 420,
  },
  {
    id: "developer-notes",
    title: "Developer Notes",
    icon: Terminal,
    component: DeveloperNotesWindow,
    defaultPosition: { x: 340, y: 260 },
    inDock: false,
    width: 520,
  },
];
