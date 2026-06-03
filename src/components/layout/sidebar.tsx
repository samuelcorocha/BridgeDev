import Link from "next/link"
import { LayoutDashboard, Boxes } from "lucide-react"
import type { DefaultSession } from "next-auth"
import { SignOutButton } from "./sign-out-button"

interface Props {
  user: DefaultSession["user"] & { id: string; plan: string }
}

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/challenges", icon: Boxes, label: "Desafios" },
]

export function Sidebar({ user }: Props) {
  return (
    <aside className="w-56 border-r border-zinc-200 flex flex-col py-6 px-3 bg-white">
      <div className="px-3 mb-8">
        <span className="font-bold text-lg tracking-tight">BridgeDev</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-zinc-200 pt-4 px-3 space-y-2">
        <p className="text-xs text-zinc-400 truncate">{user.name}</p>
        <SignOutButton />
      </div>
    </aside>
  )
}
