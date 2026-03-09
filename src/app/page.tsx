import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
return (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold">Hello Alpha</h1>
    <Button>Click me</Button>
    Toggle Theme:
    <ModeToggle />
  </div>
)
}