import Link from "next/link";
import Logo from "../logo/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}