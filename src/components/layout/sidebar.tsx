"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Boxes } from "lucide-react"
import type { DefaultSession } from "next-auth"
import { SignOutButton } from "./sign-out-button"
import { ThemeToggle } from "./theme-toggle"

interface Props {
  user: DefaultSession["user"] & { id: string; plan: string }
}

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/challenges", icon: Boxes, label: "Desafios" },
]

export function Sidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-zinc-200 dark:border-zinc-800 flex flex-col py-6 px-3 bg-white dark:bg-zinc-950">
      <div className="px-3 mb-8">
        <span className="font-bold text-lg tracking-tight gradient-text">BridgeDev</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 font-medium"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-violet-600 dark:text-violet-400" : ""}`} />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 px-3 space-y-2">
        <ThemeToggle />
        <p className="text-xs text-zinc-400 truncate px-3">{user.name}</p>
        <SignOutButton />
      </div>
    </aside>
  )
}
