"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const handleCheckedChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch checked={false} disabled className="opacity-50" />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground shrink-0" />
      <Switch
        checked={isDark}
        onCheckedChange={handleCheckedChange}
        className="cursor-pointer"
        aria-label="Toggle light/dark mode"
      />
      <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  )
}
