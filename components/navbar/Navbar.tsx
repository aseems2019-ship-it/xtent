import Logo from "../logo/Logo";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40">      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-3">
          <Button variant="ghost">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </header>
  );
}