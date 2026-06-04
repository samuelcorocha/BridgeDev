export const DIFFICULTY_LABELS = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
} as const

export const DIFFICULTY_COLORS = {
  BEGINNER: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
  INTERMEDIATE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  ADVANCED: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
} as const

export const TECH_COLORS: Record<string, string> = {
  "Node.js": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "Express": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "Jest": "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  "Vitest": "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  "Git": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  "GitHub Actions": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  "Docker": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "Docker Compose": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "PostgreSQL": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  "YAML": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "TypeScript": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "React": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
}

export const DEFAULT_TECH = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
